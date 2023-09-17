// TODO: Merge with Leon's steam locator

const fs = require('node:fs');
const path = require('node:path');

function locateEpicInstall() {
  const epicManifestPath = "C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests";
  if(!fs.existsSync(epicManifestPath))
    return "NOTFOUND";

  var manifests = fs.readdirSync(epicManifestPath);

  for (var manifest in manifests) {
    if (!manifests[manifest].endsWith(".item"))
      continue;

    var manifestJson = JSON.parse(fs.readFileSync(path.join(epicManifestPath, manifests[manifest])));

    // TODO: change "PAYDAY 3" to whatever the game uses to identity itself
    if (manifestJson["DisplayName"] == "PAYDAY 3") {
      return manifestJson["InstallLocation"];
    }
  }

  return "NOTFOUND";
}

module.exports = {
  locateEpicInstall
}