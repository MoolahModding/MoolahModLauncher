/* eslint-disable */

import { getLatestModVersionByGitHub } from "./providers/githubreleases"
import { getCurrentModVersionByMWS } from "./providers/modworkshop"

// TODO: refactor

/***
 * Returns true if an update is available
 * Returns false if there isn't
 */
export async function checkForModUpdate(meta: any) {
  if (!meta["updateProvider"]) {
    return false
  }

  let latest = null
  switch (meta["updateProvider"]["type"].toLowerCase()) {
    case "modworkshop":
      latest = await getCurrentModVersionByMWS(meta["updateProvider"]["id"])
      break
    case "githubreleases":
      latest = await getLatestModVersionByGitHub(
        meta["updateProvider"]["repository"]
      )
      break
  }

  // TODO: strip prefix such as v1.0.0 -> 1.0.0
  // TODO: check with semver instead
  if (meta["version"] !== latest) {
    return true
  }
}
