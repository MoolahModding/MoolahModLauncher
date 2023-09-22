const {contextBridge, ipcRenderer} = require('electron');

const config = require('./config');
const installedpopulator = require('./installedlistpopulator')

contextBridge.exposeInMainWorld("config", config);
contextBridge.exposeInMainWorld("installedpopulator", installedpopulator);
contextBridge.exposeInMainWorld('electronAPI', {
    launchGame: () => ipcRenderer.send('launch-game')
})
