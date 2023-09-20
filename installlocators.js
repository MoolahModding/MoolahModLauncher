const fs = require('node:fs');
const path = require('node:path');
const regedit = require('winreg');

function locateSteamInstall() {
  return new Promise((resolve, reject) => {
    const key = new regedit({
      hive: regedit.HKLM,
      key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App 1272080',
    });

    key.keyExists((err, exists) => {
      if (err) {
        console.error(err);
        reject("ERROR");
      } else if (exists) {
        key.values((err, items) => {
          if (err) {
            console.error(err);
            reject("ERROR");
          } else {
            let steamLocation = null;
            for (let i = 0; i < items.length; i++) {
              if (items[i].name === "InstallLocation") {
                steamLocation = items[i].value;
                console.log(`InstallLocation: ${steamLocation}`);
                resolve(steamLocation);
                return;
              }
            }
            console.log('InstallLocation not found in the registry key.');
            reject("NOTFOUND");
          }
        });
      } else {
        console.log('Registry key not found.');
        reject("NOTFOUND");
      }
    });
  });
}

function locateEpicInstall() {
  return new Promise((resolve, reject) => {
    const epicManifestPath = "C:/ProgramData/Epic/EpicGamesLauncher/Data/Manifests";
    if (!fs.existsSync(epicManifestPath))
      reject("NOTFOUND");

    var manifests = fs.readdirSync(epicManifestPath);

    for (var manifest in manifests) {
      if (!manifests[manifest].endsWith(".item"))
        continue;

      var manifestJson = JSON.parse(fs.readFileSync(path.join(epicManifestPath, manifests[manifest])));

      // TODO: change "PAYDAY 3" to whatever the game uses to identify itself
      if (manifestJson["DisplayName"] === "PAYDAY 3") {
        resolve(manifestJson["InstallLocation"]);
        return;
      }
    }

    reject("NOTFOUND");
  })
}

function resolveInstall() {
  return locateSteamInstall()
      .catch(() => {
        console.log('Steam installation not found or encountered an error. Falling back to Epic.');
        return locateEpicInstall()
            .catch(() => {
              console.error('Epic installation not found or encountered an error.');
              throw new Error('No game installation not found.');
            });
      });
}

module.exports = {
  resolveInstall
}
