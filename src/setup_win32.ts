import regedit from 'winreg'

const FILE_EXTENSION = '.pd3mod'

// TODO: refactor

export function installShellExtension(exePath: string) {
  console.log(`Installing ${FILE_EXTENSION} shell extension`)

  const key = new regedit({
    hive: regedit.HKCU,
    key: '\\Software\\Classes\\' + FILE_EXTENSION
  })

  key.create(() => {
    key.set('', regedit.REG_SZ, 'MoolahModLauncher' + FILE_EXTENSION, () => {

      const key_icon = new regedit({
        hive: regedit.HKCU,
        key: '\\Software\\Classes\\' + FILE_EXTENSION + '\\DefaultIcon'
      })

      key_icon.create(() => {
        key_icon.set('', regedit.REG_SZ, `"${exePath}",0`, () => {

          const key_shell = new regedit({
            hive: regedit.HKCU,
            key: '\\Software\\Classes\\' + FILE_EXTENSION + '\\shell\\open\\command'
          })

          key_shell.set('', regedit.REG_SZ, `"${exePath}" "%1"`, () => {
            console.log(`File extension for ${FILE_EXTENSION} installed.`)
          })
        })
      })
    })
  })
}

export function uninstallShellExtension() {
  console.log(`Uninstalling ${FILE_EXTENSION} shell extension`)

  const key = new regedit({
    hive: regedit.HKCU,
    key: '\\Software\\Classes\\' + FILE_EXTENSION
  })

  key.destroy(err => {
    if (err) {
        console.error(`Failed to uninstall ${FILE_EXTENSION} file extension.`)
    } else {
        console.log(`File extension for ${FILE_EXTENSION} uninstalled.`)
    }
  })
}
