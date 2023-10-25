import type { WebContents } from "electron"
import path from "node:path"

import chokidar from "chokidar"

import { getModsDirectory } from "./config"

const watchPath = path.join(getModsDirectory())
const watcher = chokidar.watch(watchPath)

// TODO: refactor

export async function initWatcher(webContents: WebContents) {
  // Function might be called more than once if mod directory changes. If so, close existing watcher first.
  if (watcher) {
    await watcher.close()
  }

  watcher.on("all", (eventName, eventPath) => {
    if (path.basename(eventPath) !== "pd3mod.json") return

    switch (eventName) {
      case "add":
        webContents.send("mod-added", eventPath)
        break
      case "change":
        webContents.send("mod-changed", eventPath)
        break
      case "unlink":
        webContents.send("mod-removed", eventPath)
    }
  })
}
