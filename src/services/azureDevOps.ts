import * as SDK from 'azure-devops-extension-sdk'
import type { PullRequest } from '../types'

export interface Project {
  id: string
  name: string
}

let cachedBaseUrl: string | null = null
let cachedToken: string | null = null

// Direct REST API calls instead of SDK clients (avoids SDK conflict)
async function fetchApi<T>(path: string): Promise<T> {
  if (!cachedToken) {
    cachedToken = await SDK.getAccessToken()
  }
  if (!cachedBaseUrl) {
    const host = SDK.getHost()
    cachedBaseUrl = `https://dev.azure.com/${host.name}`
  }

  const response = await fetch(`${cachedBaseUrl}${path}`, {
    headers: {
      'Authorization': `Bearer ${cachedToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Initialize SDK - call once at app start
let sdkInitialized = false

export async function initSDK(): Promise<{ userId: string; currentProject: Project | null }> {
  if (!sdkInitialized) {
    await SDK.init({ loaded: true })
    sdkInitialized = true
  }

  await SDK.ready()

  const user = SDK.getUser()

  // Get current project context from the page
  let currentProject: Project | null = null
  try {
    const webContext = SDK.getWebContext()
    if (webContext?.project) {
      currentProject = {
        id: webContext.project.id,
        name: webContext.project.name
      }
    }
  } catch {
    // Not in a project context
  }

  return { userId: user?.id || '', currentProject }
}

// Fetch all available projects
export async function fetchProjects(): Promise<Project[]> {
  const response = await fetchApi<{ value: Project[] }>('/_apis/projects?api-version=7.0')
  return response.value.sort((a, b) => a.name.localeCompare(b.name))
}

// Mock data for development
export function getMockProjects(): Project[] {
  return [
    { id: 'proj-1', name: 'Platform' },
    { id: 'proj-2', name: 'WebApp' }
  ]
}

export function getMockData(): { pullRequests: PullRequest[], currentUserId: string } {
  const currentUserId = 'user-1'
  
  const pullRequests: PullRequest[] = [
    {
      id: 1234,
      title: 'feat: Add new authentication flow',
      description: 'Implements OAuth2 with PKCE',
      status: 'active',
      createdBy: { id: 'user-2', displayName: 'Alice Developer' },
      creationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      repository: { id: 'repo-1', name: 'backend-api', project: { id: 'proj-1', name: 'Platform' } },
      sourceRefName: 'feature/auth-flow',
      targetRefName: 'main',
      reviewers: [
        { id: 'user-1', displayName: 'You', vote: 0, isRequired: true },
        { id: 'user-3', displayName: 'Bob Reviewer', vote: 10, isRequired: false }
      ],
      url: '#',
      webUrl: '#'
    },
    {
      id: 1235,
      title: 'fix: Resolve memory leak in worker service',
      status: 'active',
      createdBy: { id: 'user-1', displayName: 'You' },
      creationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      repository: { id: 'repo-2', name: 'worker-service', project: { id: 'proj-1', name: 'Platform' } },
      sourceRefName: 'fix/memory-leak',
      targetRefName: 'main',
      reviewers: [
        { id: 'user-2', displayName: 'Alice Developer', vote: 5, isRequired: true },
        { id: 'user-4', displayName: 'Carol Lead', vote: 0, isRequired: true }
      ],
      url: '#',
      webUrl: '#'
    },
    {
      id: 1236,
      title: 'chore: Update dependencies to latest versions',
      status: 'active',
      createdBy: { id: 'user-3', displayName: 'Bob Reviewer' },
      creationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      repository: { id: 'repo-3', name: 'frontend-app', project: { id: 'proj-2', name: 'WebApp' } },
      sourceRefName: 'chore/deps',
      targetRefName: 'develop',
      reviewers: [
        { id: 'user-1', displayName: 'You', vote: 0, isRequired: false }
      ],
      url: '#',
      webUrl: '#'
    },
    {
      id: 1237,
      title: 'feat: Implement dark mode support',
      status: 'active',
      createdBy: { id: 'user-4', displayName: 'Carol Lead' },
      creationDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      repository: { id: 'repo-3', name: 'frontend-app', project: { id: 'proj-2', name: 'WebApp' } },
      sourceRefName: 'feature/dark-mode',
      targetRefName: 'main',
      reviewers: [
        { id: 'user-2', displayName: 'Alice Developer', vote: -5, isRequired: true },
        { id: 'user-3', displayName: 'Bob Reviewer', vote: 10, isRequired: false }
      ],
      url: '#',
      webUrl: '#'
    },
    {
      id: 1238,
      title: 'refactor: Extract shared components to library',
      status: 'active',
      createdBy: { id: 'user-2', displayName: 'Alice Developer' },
      creationDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      repository: { id: 'repo-4', name: 'ui-components', project: { id: 'proj-2', name: 'WebApp' } },
      sourceRefName: 'refactor/shared-lib',
      targetRefName: 'main',
      reviewers: [
        { id: 'user-1', displayName: 'You', vote: 0, isRequired: true },
        { id: 'user-4', displayName: 'Carol Lead', vote: -10, isRequired: true }
      ],
      url: '#',
      webUrl: '#'
    }
  ]
  
  return { pullRequests, currentUserId }
}

// Progressive loading callback type
export type OnPRsLoaded = (prs: PullRequest[], done: boolean) => void

interface RepoRef { id: string; name: string }
interface PRResponse {
  pullRequestId: number
  title: string
  description?: string
  createdBy: { id: string; displayName: string; imageUrl?: string }
  creationDate: string
  sourceRefName: string
  targetRefName: string
  reviewers?: { id: string; displayName: string; imageUrl?: string; vote: number; isRequired?: boolean }[]
  url: string
}

// Fetch PRs for a single project
async function fetchProjectPRs(
  project: Project,
  orgUrl: string,
  onProgress?: OnPRsLoaded,
  existingPRs: PullRequest[] = []
): Promise<PullRequest[]> {
  const allPRs = [...existingPRs]

  try {
    const reposResponse = await fetchApi<{ value: RepoRef[] }>(
      `/${project.name}/_apis/git/repositories?api-version=7.0`
    )

    for (const repo of reposResponse.value) {
      try {
        const prsResponse = await fetchApi<{ value: PRResponse[] }>(
          `/${project.name}/_apis/git/repositories/${repo.id}/pullrequests?searchCriteria.status=active&api-version=7.0`
        )

        for (const pr of prsResponse.value) {
          allPRs.push({
            id: pr.pullRequestId,
            title: pr.title,
            description: pr.description,
            status: 'active',
            createdBy: {
              id: pr.createdBy.id,
              displayName: pr.createdBy.displayName,
              imageUrl: pr.createdBy.imageUrl
            },
            creationDate: pr.creationDate,
            repository: {
              id: repo.id,
              name: repo.name,
              project: {
                id: project.id,
                name: project.name
              }
            },
            sourceRefName: pr.sourceRefName.replace('refs/heads/', ''),
            targetRefName: pr.targetRefName.replace('refs/heads/', ''),
            reviewers: (pr.reviewers || []).map(r => ({
              id: r.id,
              displayName: r.displayName,
              imageUrl: r.imageUrl,
              vote: r.vote,
              isRequired: r.isRequired || false
            })),
            url: pr.url,
            webUrl: `${orgUrl}/${project.name}/_git/${repo.name}/pullrequest/${pr.pullRequestId}`
          })
        }

        if (onProgress && prsResponse.value.length > 0) {
          onProgress([...allPRs], false)
        }
      } catch {
        // Skip repos we don't have access to
      }
    }
  } catch {
    // Skip projects we don't have access to
  }

  return allPRs
}

// Fetch PRs - optionally filtered by project
export async function fetchPullRequests(
  projectFilter: Project | null,
  onProgress?: OnPRsLoaded
): Promise<PullRequest[]> {
  const host = SDK.getHost()
  const orgUrl = `https://dev.azure.com/${host.name}`

  let projects: Project[]
  if (projectFilter) {
    projects = [projectFilter]
  } else {
    const response = await fetchApi<{ value: Project[] }>('/_apis/projects?api-version=7.0')
    projects = response.value
  }

  let allPRs: PullRequest[] = []
  for (const project of projects) {
    allPRs = await fetchProjectPRs(project, orgUrl, onProgress, allPRs)
  }

  if (onProgress) {
    onProgress(allPRs, true)
  }

  return allPRs
}
