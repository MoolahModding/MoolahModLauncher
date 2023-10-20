export async function getCurrentModVersionByMWS(id: string) {
  var response = await fetch(`https://api.modworkshop.net/mods/${id}/version`)

  return response.text()
}

export function getLatestVersionDownload(id: string) {}
