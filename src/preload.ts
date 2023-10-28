import { contextBridge, ipcRenderer } from "electron"

import { config } from "./config"
import { ILP_getInstalledMods } from "./installedlistpopulator"

// TODO: refactor
// TODO: fix not exposing keys (use ipc instead)

contextBridge.exposeInMainWorld("installedpopulator", ILP_getInstalledMods)
contextBridge.exposeInMainWorld("moolah", {
  config: config,
  events: {
    launchGame: () => ipcRenderer.send("launch-game"),
    installMods: (paths: string[]) => ipcRenderer.send("install-mods", paths),

    onModAdded: (callback: () => void) => ipcRenderer.on("mod-added", callback),
    onModChanged: (callback: () => void) =>
      ipcRenderer.on("mod-changed", callback),
    onModRemoved: (callback: () => void) =>
      ipcRenderer.on("mod-removed", callback),
  },
})
