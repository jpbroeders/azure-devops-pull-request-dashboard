import { useState, useEffect, useCallback } from 'react'
import { PRDashboard } from './components/PRDashboard'
import { fetchPullRequests, fetchProjects, getMockData, initSDK, type Project } from './services/azureDevOps'
import type { DashboardState, PullRequest } from './types'

// Check if running in Azure DevOps (iframe)
const isAzureDevOps = window.parent !== window

export default function App() {
  const [state, setState] = useState<DashboardState>({
    pullRequests: [],
    loading: true,
    error: null,
    currentUserId: ''
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [initialized, setInitialized] = useState(false)

  const handleProgress = useCallback((prs: PullRequest[], done: boolean) => {
    setState(s => ({
      ...s,
      pullRequests: [...prs].sort((a, b) =>
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
      ),
      loading: !done
    }))
  }, [])

  // Initial SDK setup
  useEffect(() => {
    initializeApp()
  }, [])

  // Fetch PRs when project selection changes
  useEffect(() => {
    if (initialized) {
      loadPullRequests()
    }
  }, [selectedProject, initialized])

  async function initializeApp() {
    try {
      if (!isAzureDevOps) {
        // Dev mode - instant mock data
        const data = getMockData()
        setState({
          pullRequests: data.pullRequests,
          currentUserId: data.currentUserId,
          loading: false,
          error: null
        })
        setInitialized(true)
        return
      }

      // Production - init SDK
      const { userId, currentProject } = await initSDK()
      setState(s => ({ ...s, currentUserId: userId }))

      // Fetch available projects
      const allProjects = await fetchProjects()
      setProjects(allProjects)

      // Set current project as default
      if (currentProject) {
        const found = allProjects.find(p => p.id === currentProject.id)
        setSelectedProject(found || currentProject)
      } else if (allProjects.length > 0) {
        setSelectedProject(allProjects[0])
      }

      setInitialized(true)
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to initialize'
      }))
    }
  }

  async function loadPullRequests() {
    setState(s => ({ ...s, loading: true, error: null, pullRequests: [] }))
    try {
      await fetchPullRequests(selectedProject, handleProgress)
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load'
      }))
    }
  }

  function handleProjectChange(project: Project | null) {
    setSelectedProject(project)
  }

  return (
    <PRDashboard
      pullRequests={state.pullRequests}
      currentUserId={state.currentUserId}
      onRefresh={loadPullRequests}
      isLoading={state.loading}
      error={state.error}
      projects={projects}
      selectedProject={selectedProject}
      onProjectChange={handleProjectChange}
    />
  )
}
