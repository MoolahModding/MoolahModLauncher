const { read } = require('./pak');

(async () => {
  try {
    const path = 'APackFile.pak';
    console.log(`Opening pak ${path}`);
    let pak = await read(path, Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex'));
    console.log(`Mount point = ${await pak.getMountPoint()}`);
    let files = pak.getFiles();
    let inis = files.filter(f => f.endsWith('.ini'));
    console.log(`Found ${inis.length} ini files`);
    let defaultGame = await pak.getFile(files.find(f => f.endsWith('DefaultGame.ini')));
    let lines = defaultGame.toString().split('\n');
    console.log(`Read DefaultGame.ini which is ${lines.length} lines long`);
    let projectVersion = lines.find(l => l.startsWith('ProjectVersion='));
    console.log(projectVersion);
  } catch (e) {
    console.log(e);
  }
})();
