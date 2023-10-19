import { MWS_getCurrentModVersion } from './providers/modworkshop';
import { GH_getLatestModVersion } from './providers/githubreleases';

/***
 * Returns true if an update is available
 * Returns false if there isn't
 */
async function checkForModUpdate(meta) {
  if (!meta["updateProvider"]) {
    return false;
  }

  let latest = null;
  switch(meta["updateProvider"]["type"].toLowerCase()) {
    case "modworkshop":
      latest = await MWS_getCurrentModVersion(meta["updateProvider"]["id"]);
      break;
    case "githubreleases":
      latest = await GH_getLatestModVersion(meta["updateProvider"]["repository"]);
      break;
  }

  // TODO: strip prefix such as v1.0.0 -> 1.0.0
  // TODO: check with semver instead
  if (meta["version"] !== latest) {
    return true;
  }
}

module.exports = {
  checkForModUpdate
}
