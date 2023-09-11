const path = require('path');
const regedit = require('winreg');

function installShellExtension(appPath) {
	const exePath = path.resolve(appPath, 'moolahmodlauncher.exe');
	const fileExtension = '.pd3mod';

	const key = new regedit({
		hive: regedit.HKCU,
		key: '\\Software\\Classes\\' + fileExtension
	});

	key.create(() => {
		key.set('', regedit.REG_SZ, 'MoolahModLauncher.' + fileExtension, () => {
			key.set('DefaultIcon', regedit.REG_SZ, `"${exePath}",0`, () => {
				key.set('shell\\open\\command', regedit.REG_SZ, `"${exePath}" "%1"`, () => {
				console.log(`File extension for ${fileExtension} installed.`);
				});
			});
		});
	});
}

function uninstallShellExtension() {
	const fileExtension = '.pd3mod';

	const key = new regedit({
		hive: regedit.HKCU,
		key: '\\Software\\Classes\\' + fileExtension
	});

	key.destroy(() => {
		console.log(`File extension for ${fileExtension} uninstalled.`);
	});
}

module.exports = {
	installShellExtension,
	uninstallShellExtension,
};
