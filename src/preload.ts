import { contextBridge, ipcRenderer } from "electron"

import type { MMLConfigKeyType, MMLConfigType } from "./types/config"

// import { ILP_getInstalledMods } from "./installedlistpopulator"

// TODO: refactor
// TODO: fix not exposing keys (use ipc instead)

// contextBridge.exposeInMainWorld("installedpopulator", ILP_getInstalledMods)
contextBridge.exposeInMainWorld("moolah", {
  config: {
    setConfigValue: <T extends MMLConfigKeyType>(
      key: T,
      value: MMLConfigType[T]
    ) => ipcRenderer.send("set-config-value", key, value),
    getConfigValue: <T extends MMLConfigKeyType>(key: T) =>
      ipcRenderer.invoke("get-config-value", key),
  },
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
