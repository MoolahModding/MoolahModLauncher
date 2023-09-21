const {contextBridge} = require('electron');

const config = require('./config');
const installedpopulator = require('./installedlistpopulator')

contextBridge.exposeInMainWorld("config", config);
contextBridge.exposeInMainWorld("installedpopulator", installedpopulator);