import path from "node:path"
import { exit } from "node:process"
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'

// import filewatcher from './filewatcher'
import { installAllPackages } from './mod_installer'
import { resolveInstall } from './installlocators'
import { installShellExtension, uninstallShellExtension } from './setup_win32'
import { config } from "./config"

// TODO: refactor

function handleStartupEvent() {
    // Custom installer logic
    const cmd = process.argv[1]
    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
        installShellExtension(app.getPath("exe"))
    } else if (cmd === '--squirrel-uninstall') {
        uninstallShellExtension()
    }

    // Default installer logic
    return require('electron-squirrel-startup')
}

// Exit early if we were invoked through Squirrel installer
if (handleStartupEvent()) exit(0)

require('update-electron-app')()

let mainWindow

app.on('ready', () => {
  const installPackagesPaths = process.argv.slice(1).filter(v => v !== '.' && !v.startsWith('--'))

  if (!config.getConfigValue("gameDirectory")) {
    resolveInstall()
      .then(result => {
        console.log("Install dir:", result)
        //@ts-ignore
        config.setConfigValue("gameDirectory", result)
      })
      .catch(error => {
          console.error("Could not resolve game install", error)
      })
  }

  if (installPackagesPaths.length > 0) {
    installAllPackages(installPackagesPaths, true)
  } else {
    ipcMain.on("launch-game", handleLaunchGame)
    ipcMain.on("install-mods",  (event, packagePaths) => installAllPackages(packagePaths, false))

    mainWindow = new BrowserWindow({
      width: 800, height: 600,
      webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true
      },
      icon: 'assets/img/modloader' // FIXME: svg not supported
    })
    mainWindow.removeMenu()
    // filewatcher.initWatch(mainWindow.webContents).then(() => {})

    mainWindow.loadFile('assets/index.html')
      .catch(reason => console.error("Failed to load main window", reason))
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function handleLaunchGame() {
  // TODO: msstore/egs
  shell.openExternal("steam://rungameid/1272080//-fileopenlog", {logUsage: true}).then(() => {
    console.log("Game launched successfully!")
    app.quit()
  },
  reason => {
    dialog.showErrorBox("Failed to launch", `Failed to launch game\nNote: launching from the launcher is only supported on Steam for now.\n${reason}`)
  })
}
function getConfigValue(arg0: string) {
  throw new Error('Function not implemented.')
}
