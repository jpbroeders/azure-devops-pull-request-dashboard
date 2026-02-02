export interface PullRequest {
  id: number
  title: string
  description?: string
  status: 'active' | 'completed' | 'abandoned'
  isDraft: boolean
  createdBy: {
    id: string
    displayName: string
    imageUrl?: string
  }
  creationDate: string
  repository: {
    id: string
    name: string
    project: {
      id: string
      name: string
    }
  }
  sourceRefName: string
  targetRefName: string
  reviewers: Reviewer[]
  url: string
  webUrl: string
}

export interface Reviewer {
  id: string
  displayName: string
  imageUrl?: string
  vote: number // -10=rejected, -5=waiting, 0=none, 5=approved-suggestions, 10=approved
  isRequired: boolean
}

export interface DashboardState {
  pullRequests: PullRequest[]
  loading: boolean
  error: string | null
  currentUserId: string
}

export type TabValue = 'needs-review' | 'created-by-me' | 'all'
