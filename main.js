const { app, BrowserWindow, dialog } = require('electron');
const path = require("node:path");

const modParser = require('./mod_parser');
const { loadConfig, saveConfig, setConfigValue } = require('./config');
const {resolveInstall} = require('./installlocators');
const setup = require('./setup_win32');

if (require('electron-squirrel-startup')) app.quit();
require('update-electron-app')()

let mainWindow;

app.on('ready', () => {
    // Check if the app was launched with the -install or -uninstall argument
    const isInstall = process.argv.includes('--install');
    const isUninstall = process.argv.includes('--uninstall');
    const installPackagesPaths = process.argv.slice(1).filter(v => v !== '.' && !v.startsWith('--'));

    loadConfig();

    if (isInstall) {
        if (process.platform === 'win32') {
            setup.installShellExtension(app.getAppPath());
        }

        resolveInstall()
            .then(result => {
                console.log("Install dir:", result);
                setConfigValue("gameDirectory", result);
                saveConfig();
            })
            .catch(error => {
                console.error("Error:", error);
            });

    } else if (isUninstall) {
        if (process.platform === 'win32') {
            setup.uninstallShellExtension();
        } else {
            console.warn("Uninstall is NO-OP on non-windows platforms")
        }
        // After an uninstall we just quit
        app.quit();
    } else if (installPackagesPaths.length > 0) {
        for (let installPackagePath of installPackagesPaths) {
            let installPackage = modParser.fromPath(installPackagePath)
            installPackage.install().then(() => {
                dialog.showMessageBox(null, {title: "Mod installed successfully", message: `Successfully installed ${installPackagePath}`}).then(() => {
                    app.quit()
                })
            }, reason => {
                dialog.showErrorBox("Failed to install mod package", `Failed to install ${installPackagePath}\n${reason}`)
                app.quit()
            })
        }
    } else {
        mainWindow = new BrowserWindow({
            width: 800, height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true
            },
            icon: 'assets/img/modloader' // FIXME: svg not supported
        });
        mainWindow.loadFile('assets/index.html')
            .catch(reason => console.error("Failed to load main window", reason));
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
