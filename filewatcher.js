const path = require("path")
const {getModsDirectory} = require("./config")
const chokidar = require("chokidar")

let watcher = null

async function initWatcher(webContents) {
    const watchPath = path.join(getModsDirectory())

    // Function might be called more than once if mod directory changes. If so, close existing watcher first.
    if (watcher) {
        await watcher.close()
    }

    watcher = chokidar.watch(watchPath)
        .on('all', (eventName, eventPath) => {
            if (path.basename(eventPath) !== 'pd3mod.json') return

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

module.exports = {
    initWatch: initWatcher
}
