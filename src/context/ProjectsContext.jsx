import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import apiClient from '../utils/apiClient'
import { useAuth } from './AuthContext'



export const ProjectsContext = createContext()

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}

export function ProjectsProvider({ children }) {
  const { token } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Add auth token to all requests
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor)
    }
  }, [token])

  // Fetch projects with proper loading/error states
  const fetchProjects = useCallback(async () => {
    if (!token) return
    
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/projects')
      setProjects(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects')
      console.error('Project fetch error:', err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [token])

  // Initial fetch
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Create project with optimistic updates
  const createProject = async (projectData) => {
    try {
      setError(null)
      const res = await apiClient.post('/projects', projectData)
      const created = res.data
      setProjects(prev => [...prev, created])
      return { success: true, project: created }
    } catch (err) {
      setError(err.response?.data?.message || 'Create project failed')
      return { success: false, error: err.response?.data }
    }
  }

  // Update project with optimistic updates
  const updateProject = async (id, updates) => {
    try {
      setError(null)
      const res = await apiClient.put(`/projects/${id}`, updates)
      const updated = res.data
      setProjects(prev =>
        prev.map(project => (project._id === updated._id ? updated : project))
      )
      return { success: true, project: updated }
    } catch (err) {
      setError(err.response?.data?.message || 'Update project failed')
      return { success: false, error: err.response?.data }
    }
  }

  // Delete project with optimistic updates
  const deleteProject = async (id) => {
    try {
      setError(null)
      await apiClient.delete(`/projects/${id}`)
      setProjects(prev => prev.filter(project => project._id !== id))
      return { success: true }
    } catch (err) {
      setError(err.response?.data?.message || 'Delete project failed')
      return { success: false, error: err.response?.data }
    }
  }

  const value = {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    // Consider adding:
    // - selectedProject state
    // - project filtering/sorting methods
    // - refresh function
  }

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}