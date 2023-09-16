const {contextBridge} = require('electron');

const config = require('./config')

contextBridge.exposeInMainWorld("config", config)