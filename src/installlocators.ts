/* eslint-disable */

import { lstat, readFile, readdir } from "node:fs/promises"
import path from "node:path"

import { list } from "drivelist"
import regedit from "winreg"

// TODO: refactor

function locateSteamInstall() {
  return new Promise((resolve, reject) => {
    const key = new regedit({
      hive: regedit.HKLM,
      key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App 1272080",
    })

    key.keyExists((err, exists) => {
      if (err) {
        console.error(err)
        reject("ERROR")
      } else if (exists) {
        key.values((err, items) => {
          if (err) {
            console.error(err)
            reject("ERROR")
          } else {
            let steamLocation = null
            for (let i = 0; i < items.length; i++) {
              if (items[i].name === "InstallLocation") {
                steamLocation = items[i].value
                console.log(`InstallLocation: ${steamLocation}`)
                resolve(steamLocation)
                return
              }
            }
            console.log("InstallLocation not found in the registry key.")
            reject("NOTFOUND")
          }
        })
      } else {
        console.log("Registry key not found.")
        reject("NOTFOUND")
      }
    })
  })
}

async function locateMsStoreInstall(): Promise<string> {
  const drives = await list()
  const mountPaths = drives
    .filter((drive) => drive.isSystem)
    .flatMap((drive) => drive.mountpoints)
    .map((mountPoint) => mountPoint.path)
  for (const mountPath of new Set(mountPaths)) {
    const installPath = path.join(mountPath, "/XboxGames/Payday 3/Content")
    try {
      await lstat(installPath)
      return installPath
    } catch {
      continue
    }
  }

  throw new Error("NOT_FOUND")
}

async function locateEpicInstall(): Promise<string> {
  const epicManifestPath =
    "C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests"
  try {
    await lstat(epicManifestPath)
  } catch (err) {
    throw err
  }

  const manifests = await readdir(epicManifestPath)

  // TODO: change "PAYDAY 3" to whatever the game uses to identify itself
  for (const mf of manifests) {
    if (!mf.endsWith(".item")) continue

    const manifestJson = JSON.parse(
      await readFile(path.join(epicManifestPath, mf)).toString()
    )
    if (manifestJson["DisplayName"] === "PAYDAY 3") {
      return manifestJson["InstallLocation"]
    }
  }

  throw new Error("NOT_FOUND")
}

export function resolveInstall() {
  return locateSteamInstall().catch(() => {
    console.log(
      "Steam installation not found or encountered an error. Falling back to Xbox."
    )
    return locateMsStoreInstall().catch(() => {
      console.error(
        "Xbox installation not found or encountered an error. Falling back to Epic"
      )
      return locateEpicInstall().catch(() => {
        console.error("Epic installation not found or encountered an error.")
        throw new Error("No game installation not found.")
      })
    })
  })
}
