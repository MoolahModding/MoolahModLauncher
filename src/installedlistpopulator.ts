import {
  existsSync,
  mkdirSync,
  readdirSync,
  lstatSync,
  readFileSync,
} from "node:fs"
import path from "node:path"
import { getModsDirectory } from "./config"

// TODO: refactor
// TODO: consider using fs/promise

export function ILP_getInstalledMods() {
  const installDir = getModsDirectory()

  if (!existsSync(installDir)) {
    mkdirSync(installDir)
  }

  const mods = readdirSync(installDir)

  const finalMods = []

  for (const mod of mods) {
    if (!lstatSync(path.join(installDir, mod)).isDirectory()) {
      continue
    }
    if (!existsSync(path.join(installDir, mod, "pd3mod.json"))) {
      continue
    }
    try {
      const meta = JSON.parse(
        readFileSync(path.join(installDir, mod, "pd3mod.json")).toString()
      )
      meta["finalIconPath"] =
        "file:///" + path.join(installDir, mod, meta["icon"])
      console.log(meta["finalIconPath"])
      finalMods.push(meta)
    } catch (e) {
      console.warn("Mod: " + mod + " could not be read from filesystem: " + e)
    }
  }

  return finalMods
}
