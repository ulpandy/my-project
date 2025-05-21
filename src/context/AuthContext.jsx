import { createContext, useContext, useState, useCallback } from 'react'
import Cookies from 'js-cookie'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Check if user is authenticated (from cookie/localStorage)
  const checkAuth = useCallback(() => {
    try {
      // In a real app, you would verify the token with the backend
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
      }
    } catch (err) {
      console.error('Error checking authentication:', err)
    } finally {
      setLoading(false)
    }
  }, [])
  
  // Login function
  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        }
        
        setCurrentUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        // Set auth cookie (in real app this would be set by the server)
        Cookies.set('authToken', 'mock-jwt-token', { expires: 7 })
        
        return { success: true }
      } else if (email === 'manager@example.com' && password === 'password') {
        const userData = {
          id: '2',
          email: 'manager@example.com',
          name: 'Manager User',
          role: 'manager'
        }
        
        setCurrentUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        Cookies.set('authToken', 'mock-jwt-token', { expires: 7 })
        
        return { success: true }
      } else if (email === 'worker@example.com' && password === 'password') {
        const userData = {
          id: '3',
          email: 'worker@example.com',
          name: 'Worker User',
          role: 'worker'
        }
        
        setCurrentUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        Cookies.set('authToken', 'mock-jwt-token', { expires: 7 })
        
        return { success: true }
      }
      
      setError('Invalid email or password')
      return { success: false, error: 'Invalid email or password' }
    } catch (err) {
      setError(err.message || 'An error occurred during login')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }
  
  // Register function
  const register = async (email, password, name) => {
    setLoading(true)
    setError(null)
    
    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      if (email && password && name) {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          role: 'worker' // Default role for new users
        }
        
        setCurrentUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        Cookies.set('authToken', 'mock-jwt-token', { expires: 7 })
        
        return { success: true }
      }
      
      setError('Invalid registration data')
      return { success: false, error: 'Invalid registration data' }
    } catch (err) {
      setError(err.message || 'An error occurred during registration')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }
  
  // Logout function
  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('user')
    Cookies.remove('authToken')
  }
  
  // Update user profile
  const updateProfile = (userData) => {
    try {
      // In a real app, you would make an API call to your backend
      const updatedUser = { ...currentUser, ...userData }
      setCurrentUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return { success: true }
    } catch (err) {
      setError(err.message || 'An error occurred updating profile')
      return { success: false, error: err.message }
    }
  }
  
  const value = {
    currentUser,
    loading,
    error,
    checkAuth,
    login,
    register,
    logout,
    updateProfile
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}