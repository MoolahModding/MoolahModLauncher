import { contextBridge, ipcRenderer } from 'electron'

import { config } from './config'
import { ILP_getInstalledMods } from './installedlistpopulator'

// TODO: refactor

contextBridge.exposeInMainWorld("config", config)
contextBridge.exposeInMainWorld("installedpopulator", ILP_getInstalledMods)
contextBridge.exposeInMainWorld('electronAPI', {
    launchGame: () => ipcRenderer.send('launch-game'),
    installMods: (paths: string) => ipcRenderer.send('install-mods', paths),

    onModAdded: (callback: () => void) => ipcRenderer.on('mod-added', callback),
    onModChanged: (callback: () => void) => ipcRenderer.on('mod-changed', callback),
    onModRemoved: (callback: () => void) => ipcRenderer.on('mod-removed', callback)
})
