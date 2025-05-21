import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

// Initial mock data
const initialTasks = [
  {
    id: '1',
    title: 'Create project plan',
    description: 'Draft the initial project plan and timeline',
    status: 'todo',
    assignedTo: '2', // manager
    createdBy: '1', // admin
    priority: 'high'
  },
  {
    id: '2',
    title: 'Design UI mockups',
    description: 'Create initial UI design for the dashboard',
    status: 'inprogress',
    assignedTo: '3', // worker
    createdBy: '2', // manager
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Setup development environment',
    description: 'Install necessary tools and configure the environment',
    status: 'done',
    assignedTo: '3', // worker
    createdBy: '2', // manager
    priority: 'low'
  },
  {
    id: '4',
    title: 'Review code standards',
    description: 'Establish coding standards for the team',
    status: 'frozen',
    assignedTo: '2', // manager
    createdBy: '1', // admin
    priority: 'medium'
  }
]

const TasksContext = createContext()

export function useTasks() {
  return useContext(TasksContext)
}

export function TasksProvider({ children }) {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState(() => {
    // Try to load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks')
    return savedTasks ? JSON.parse(savedTasks) : initialTasks
  })
  
  // Save tasks to localStorage whenever they change
  const saveTasksToStorage = useCallback((updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }, [])
  
  // Create a new task
  const createTask = (taskData) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' }
    
    // Check if user has permission to create tasks
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return { success: false, error: 'Permission denied' }
    }
    
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      status: 'todo',
      createdBy: currentUser.id
    }
    
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)
    
    return { success: true, task: newTask }
  }
  
  // Update a task
  const updateTask = (id, updates) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' }
    
    const taskIndex = tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) return { success: false, error: 'Task not found' }
    
    const task = tasks[taskIndex]
    
    // Check permissions for status updates
    if (updates.status && currentUser.role === 'worker') {
      // Workers can only move their own tasks
      if (task.assignedTo !== currentUser.id) {
        return { success: false, error: 'Permission denied' }
      }
    }
    
    // Check permissions for other updates
    if ((updates.title || updates.description || updates.assignedTo) && 
        !['admin', 'manager'].includes(currentUser.role)) {
      return { success: false, error: 'Permission denied' }
    }
    
    const updatedTask = { ...task, ...updates }
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = updatedTask
    
    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)
    
    return { success: true, task: updatedTask }
  }
  
  // Delete a task
  const deleteTask = (id) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' }
    
    // Check if user has permission to delete tasks
    if (!['admin', 'manager'].includes(currentUser.role)) {
      return { success: false, error: 'Permission denied' }
    }
    
    const taskIndex = tasks.findIndex(task => task.id === id)
    if (taskIndex === -1) return { success: false, error: 'Task not found' }
    
    const updatedTasks = tasks.filter(task => task.id !== id)
    setTasks(updatedTasks)
    saveTasksToStorage(updatedTasks)
    
    return { success: true }
  }
  
  // Get tasks filtered by user's role/permissions
  const getFilteredTasks = useCallback(() => {
    if (!currentUser) return []
    
    if (currentUser.role === 'admin') {
      // Admins can see all tasks
      return tasks
    } else if (currentUser.role === 'manager') {
      // Managers can see tasks they created or that are assigned to them
      return tasks.filter(task => 
        task.createdBy === currentUser.id || task.assignedTo === currentUser.id
      )
    } else {
      // Workers can only see tasks assigned to them
      return tasks.filter(task => task.assignedTo === currentUser.id)
    }
  }, [currentUser, tasks])
  
  // Get tasks grouped by status
  const getTasksByStatus = useCallback(() => {
    const filteredTasks = getFilteredTasks()
    
    return {
      todo: filteredTasks.filter(task => task.status === 'todo'),
      inprogress: filteredTasks.filter(task => task.status === 'inprogress'),
      done: filteredTasks.filter(task => task.status === 'done'),
      frozen: filteredTasks.filter(task => task.status === 'frozen')
    }
  }, [getFilteredTasks])
  
  const value = {
    tasks,
    getFilteredTasks,
    getTasksByStatus,
    createTask,
    updateTask,
    deleteTask
  }
  
  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  )
}