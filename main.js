const { app, BrowserWindow } = require('electron');
const path = require("node:path");

const modParser = require('./mod_parser');
const { loadConfig, saveConfig, setConfigValue } = require('./config');
const {locateEpicInstall} = require('./installlocators');

let mainWindow;

app.on('ready', () => {
	// Check the platform to determine if we're on Windows
	if (process.platform === 'win32') {
		const setup = require('./setup_win32');
    
		// Check if the app was launched with the -install or -uninstall argument
		const isInstall = process.argv.includes('-install');
		const isUninstall = process.argv.includes('-uninstall');
    
		if (isInstall) {
			setup.installShellExtension(app.getAppPath());

			var epic = locateEpicInstall();

			loadConfig();
			if (epic != "NOTFOUND") {
				setConfigValue("gameDirectory", epic);
			}
			// check for steam
			saveConfig();
		} else if (isUninstall) {
			setup.uninstallShellExtension();
			// After an uninstall we just quit
			app.quit();
		}
	}
  
	// Check if our command line arguments include a path and install mod here
	// TESTING
	const metaJson = modParser.readAndExtractMeta("test.pd3mod");
	if (metaJson != "ERROR") {
		console.log(metaJson.name);
	}
	// TESTING
  
	mainWindow = new BrowserWindow({
		width: 800, height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true
		}
	 });
	mainWindow.loadFile('assets/index.html');
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
