/** GitHub repository the launcher is released from (configurable). */

export const GITHUB_REPO =
  process.env.NEXT_PUBLIC_GITHUB_REPO || 'johndoe6345789/pyracms_core'

export const repoUrl = (repo: string = GITHUB_REPO) =>
  `https://github.com/${repo}`
export const releasesUrl = (repo: string = GITHUB_REPO) =>
  `${repoUrl(repo)}/releases`
export const docsUrl = (repo: string = GITHUB_REPO) =>
  `${repoUrl(repo)}/tree/master/pyracms-cpp-port#readme`
export const licenseUrl = (repo: string = GITHUB_REPO) =>
  `${repoUrl(repo)}/tree/master/pyracms-cpp-port#license`
export const releasesApiUrl = (repo: string = GITHUB_REPO) =>
  `https://api.github.com/repos/${repo}/releases?per_page=30`
