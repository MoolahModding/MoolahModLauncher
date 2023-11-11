export async function getCurrentModVersionByMWS(id: string) {
  const response = await fetch(`https://api.modworkshop.net/mods/${id}/version`)

  return response.text()
}

export function getLatestVersionDownload(id: string) {}
