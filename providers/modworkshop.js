async function getCurrentModVersion(id) {
  var response = await fetch({
    url: `https://api.modworkshop.net/mods/${id}/version`,
    method: "GET"
  });

  return response.text();
}

function getLatestVersionDownload(id) {}

module.exports = {
  MWS_getCurrentModVersion: getCurrentModVersion,
  MWS_getLatestVersionDownload: getLatestVersionDownload
}