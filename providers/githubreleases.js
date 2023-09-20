const { Octokit } = require('octokit');

const octokit = new Octokit();

function parseGitHubRepositoryURL(urlOrSlug) {
  // Regular expression to extract the owner and repo from the URL or slug
  const match = urlOrSlug.match(/(?:github\.com\/|^)(?<owner>[a-zA-Z0-9\.\-\_]+)\/(?<repo>[a-zA-Z0-9\.\-\_]+)$/);

  if (match && match.length === 3) {
    return match.groups;
  }

  return null;
}

async function getLatestModVersion(repository) {
  let repoObject = parseGitHubRepositoryURL(repository)

  const response = await octokit.rest.repos.getLatestRelease(repoObject);
  return response.data.tag_name;
}

async function getLatestVersionDownload(id) {}

module.exports = {
  GH_getLatestModVersion: getLatestModVersion,
  GH_getLatestVersionDownload: getLatestVersionDownload
}
