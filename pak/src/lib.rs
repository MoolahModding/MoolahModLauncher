use std::{
    fs::File,
    io::BufReader,
    ops::DerefMut,
    sync::{Arc, Mutex, OnceLock, TryLockError},
};

use neon::{prelude::*, types::buffer::TypedArray};
use rayon::ThreadPool;

static POOL: OnceLock<ThreadPool> = OnceLock::new();
fn get_pool() -> &'static ThreadPool {
    POOL.get_or_init(|| rayon::ThreadPoolBuilder::new().build().unwrap())
}

fn convert_to_array<'a, C: Context<'a>>(
    cx: &mut C,
    slice: impl AsRef<[String]>,
) -> JsResult<'a, JsArray> {
    let slice = slice.as_ref();
    let js_array = JsArray::new(cx, slice.len() as u32);

    for (i, obj) in slice.iter().enumerate() {
        let js_string = cx.string(obj);
        js_array.set(cx, i as u32, js_string)?;
    }
    Ok(js_array)
}

fn copy_to_buffer<'a, C: Context<'a>>(
    cx: &mut C,
    slice: impl AsRef<[u8]>,
) -> JsResult<'a, JsBuffer> {
    let mut buffer = JsBuffer::new(cx, slice.as_ref().len())?;
    buffer.as_mut_slice(cx).copy_from_slice(slice.as_ref());
    Ok(buffer)
}

#[derive(Debug)]
struct PakError(String);
impl From<std::io::Error> for PakError {
    fn from(err: std::io::Error) -> Self {
        Self(err.to_string())
    }
}
impl From<repak::Error> for PakError {
    fn from(err: repak::Error) -> Self {
        Self(err.to_string())
    }
}
impl<T> From<TryLockError<T>> for PakError {
    fn from(err: TryLockError<T>) -> Self {
        Self(err.to_string())
    }
}

#[derive(Clone)]
struct PakReader {
    pak_reader: Arc<repak::PakReader>,
    reader: Arc<Mutex<BufReader<File>>>,
}

impl Finalize for PakReader {}

impl PakReader {
    fn js_read(mut cx: FunctionContext) -> JsResult<JsPromise> {
        use aes::cipher::KeyInit;

        let path = cx.argument::<JsString>(0)?.value(&mut cx).clone();
        let aes = cx
            .argument_opt(1)
            .map(|aes| {
                Ok(aes::Aes256::new_from_slice(
                    aes.downcast_or_throw::<JsBuffer, _>(&mut cx)?.as_slice(&cx),
                ))
            })
            .transpose()?
            .transpose();
        let Ok(aes) = aes else {
            return cx.throw_error("Invalid key length");
        };

        let channel = cx.channel();
        let (deferred, promise) = cx.promise();

        get_pool().install(|| {
            let result = || -> Result<_, PakError> {
                let mut reader = BufReader::new(File::open(path)?);

                Ok(PakReader {
                    pak_reader: Arc::new(repak::PakReader::new_any_with_optional_key(
                        &mut reader,
                        aes,
                    )?),
                    reader: Arc::new(Mutex::new(reader)),
                })
            }();

            deferred.settle_with(&channel, move |mut cx| match result {
                Ok(pak_reader) => Ok(cx.boxed(pak_reader)),
                Err(e) => cx.throw_error(e.0),
            });
        });

        Ok(promise)
    }

    fn js_get_files(mut cx: FunctionContext) -> JsResult<JsArray> {
        let files = cx
            .this()
            .downcast_or_throw::<JsBox<PakReader>, _>(&mut cx)?
            .pak_reader
            .files();
        convert_to_array(&mut cx, files)
    }

    fn js_get_mount_point(mut cx: FunctionContext) -> JsResult<JsString> {
        let pak_reader = &cx
            .this()
            .downcast_or_throw::<JsBox<PakReader>, _>(&mut cx)?
            .pak_reader;
        let mount_point = pak_reader.mount_point();
        Ok(cx.string(mount_point))
    }

    fn js_get_file(mut cx: FunctionContext) -> JsResult<JsPromise> {
        let this = (**cx
            .this()
            .downcast_or_throw::<JsBox<PakReader>, _>(&mut cx)?)
        .clone();
        let path = cx.argument::<JsString>(0)?.value(&mut cx).clone();

        let channel = cx.channel();
        let (deferred, promise) = cx.promise();

        get_pool().install(|| {
            let result = || -> Result<_, PakError> {
                let mut lock = this.reader.try_lock()?;
                Ok(this.pak_reader.get(&path, &mut lock.deref_mut())?)
            }();

            deferred.settle_with(&channel, move |mut cx| match result {
                Ok(data) => copy_to_buffer(&mut cx, data.into_iter().take(0).collect::<Vec<_>>()),
                Err(e) => cx.throw_error(e.0),
            });
        });

        Ok(promise)
    }
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("pakReaderRead", PakReader::js_read)?;
    cx.export_function("pakReaderGetMountPoint", PakReader::js_get_mount_point)?;
    cx.export_function("pakReaderGetFiles", PakReader::js_get_files)?;
    cx.export_function("pakReaderGetFile", PakReader::js_get_file)?;
    Ok(())
}
