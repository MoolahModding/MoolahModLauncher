import fs from 'node:fs';
import path from 'node:path';
import config from './config';

function ILP_getInstalledMods() {
  config.loadConfig();
  let installDir = config.getModsDirectory()

  if (!fs.existsSync(installDir)) {
    fs.mkdir(installDir)
  }

  let mods = fs.readdirSync(installDir);

  let finalMods = [];

  for (let mod of mods) {
    if (!fs.lstatSync(path.join(installDir, mod)).isDirectory()) {
      continue;
    }
    if (!fs.existsSync(path.join(installDir, mod, "pd3mod.json"))) {
      continue;
    }
    try {
      let meta = JSON.parse(fs.readFileSync(path.join(installDir, mod, "pd3mod.json")));
      meta["finalIconPath"] = "file:///" + path.join(installDir, mod, meta["icon"]);
      console.log(meta["finalIconPath"]);
      finalMods.push(meta)
    } catch (e) {
      console.warn("Mod: " + mod + " could not be read from filesystem: " + e.toString());
    }
  }

  return finalMods;
}

module.exports = {
  ILP_getInstalledMods
};
