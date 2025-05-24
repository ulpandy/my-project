import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

axios.defaults.baseURL = 'http://localhost:3000/api'

const ProjectsContext = createContext()

export function useProjects() {
  return useContext(ProjectsContext)
}

export function ProjectsProvider({ children }) {
  const { token } = useAuth()
  const [projects, setProjects] = useState([])

  // 🔄 Загрузка проектов
  const fetchProjects = useCallback(async () => {
    if (!token) return
    try {
      const res = await axios.get('/projects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('❌ Failed to fetch projects:', err)
      setProjects([])
    }
  }, [token])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // ➕ Создание проекта
  const createProject = async (projectData) => {
    try {
      const res = await axios.post('/projects', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const created = res.data
      setProjects(prev => [...prev, created])
      return { success: true, project: created }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Create failed'
      }
    }
  }

  // ✏️ Редактирование проекта
  const updateProject = async (id, updates) => {
    try {
      const res = await axios.put(`/projects/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updated = res.data
      setProjects(prev =>
        prev.map(project => (project.id === updated.id ? updated : project))
      )
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Update failed'
      }
    }
  }

  // 🗑️ Удаление проекта
  const deleteProject = async (id) => {
    try {
      await axios.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(prev => prev.filter(project => project.id !== id))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Delete failed'
      }
    }
  }

  const value = {
    projects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}
