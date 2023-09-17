const { MWS_getCurrentModVersion } = require('./providers/modworkshop')

/***
 * Returns true if an update is available
 * Returns false if there isn't
 */
function checkForModUpdate(meta) {
  if (!meta["updateProvider"]) {
    return false;
  }

  switch(meta["updateProvider"]["type"]) {
    case "modworkshop":
      var latest = MWS_getCurrentModVersion(meta["updateProvider"]["id"]);
      // replace this with proper versioning logic
      if (meta["version"] != latest) {
        return true;
      }
      break;
  }
}

module.exports = {
  checkForModUpdate
}