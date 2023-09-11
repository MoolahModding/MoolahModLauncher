const { app, BrowserWindow } = require('electron');

let mainWindow;

app.on('ready', () => {
	mainWindow = new BrowserWindow({ width: 800, height: 600 });
	mainWindow.loadFile('assets/index.html');

	// Check the platform to determine if we're on Windows
	if (process.platform === 'win32') {
		const setup = require('./setup_win32');
    
		// Check if the app was launched with the -install or -uninstall argument
		const isInstall = process.argv.includes('-install');
		const isUninstall = process.argv.includes('-uninstall');
    
		if (isInstall) {
			setup.installShellExtension(app.getAppPath());
		} else if (isUninstall) {
			setup.uninstallShellExtension();
		}
	}
  
	// Check if our command line arguments include a path and install mod here
  
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
