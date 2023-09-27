const {contextBridge, ipcRenderer} = require('electron');

const config = require('./config');
const installedpopulator = require('./installedlistpopulator')

contextBridge.exposeInMainWorld("config", config);
contextBridge.exposeInMainWorld("installedpopulator", installedpopulator);
contextBridge.exposeInMainWorld('electronAPI', {
    launchGame: () => ipcRenderer.send('launch-game'),
    installMods: (paths) => ipcRenderer.send('install-mods', paths),

    onModAdded: (callback) => ipcRenderer.on('mod-added', callback),
    onModChanged: (callback) => ipcRenderer.on('mod-changed', callback),
    onModRemoved: (callback) => ipcRenderer.on('mod-removed', callback)
})
