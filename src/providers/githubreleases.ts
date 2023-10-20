import { Octokit } from 'octokit'

const octokit = new Octokit()

function parseGitHubRepositoryURL(urlOrSlug: string) {
  // Regular expression to extract the owner and repo from the URL or slug
  const match = urlOrSlug.match(/(?:github\.com\/|^)(?<owner>[a-zA-Z0-9\.\-\_]+)\/(?<repo>[a-zA-Z0-9\.\-\_]+)$/)

  if (match && match.length === 3) {
    return match.groups
  }

  return null
}

export async function getLatestModVersionByGitHub(repository: string) {
  const repoObject = parseGitHubRepositoryURL(repository)

  // @ts-ignore disable temporary
  const response = await octokit.rest.repos.getLatestRelease(repoObject)
  return response.data.tag_name
}

export async function getLatestVersionDownload() {}
