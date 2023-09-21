const fs = require('node:fs');
const path = require('node:path');
const config = require('./config')

function ILP_getInstalledMods() {
  config.loadConfig();
  // TODO: when we add msstore support, support WinGDK and Win64
  var installDir = path.join(config.getConfigValue("gameDirectory"), "PAYDAY3/Binaries/Win64/Mods");

  if (!fs.existsSync(installDir)) {
    fs.mkdir(installDir)
  }

  var mods = fs.readdirSync(installDir);

  var finalMods = [];

  for (var mod in mods) {
    if (!fs.lstatSync(path.join(installDir, mods[mod])).isDirectory()) {
      continue;
    }
    if (!fs.existsSync(path.join(installDir, mods[mod], "pd3meta.json"))) {
      continue;
    }
    try {
      var meta = JSON.parse(fs.readFileSync(path.join(installDir, mods[mod], "pd3meta.json")));
      meta["finalIconPath"] = "file:///" + path.join(installDir, mods[mod], meta["icon"]);
      console.log(meta["finalIconPath"]);
      finalMods.push(meta)
    } catch (e) {
      console.warn("Mod: " + mods[mod] + " had an issue while installing: " + e.toString());
    }
  }

  return finalMods;
}

module.exports = {
  ILP_getInstalledMods
};