import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useActivityTracker } from './hooks/useActivityTracker' 
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ProjectsProvider } from './context/ProjectsContext'

// Layout
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import TeamAnalytics from './pages/TeamAnalytics'
import ProjectAnalytics from './pages/ProjectAnalytics'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import Users from './pages/Users'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import VerifyCode from './pages/VerifyCode'
import ResetPassword from './pages/ResetPassword'

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { checkAuth } = useAuth()
  const { startTracking, stopTracking } = useActivityTracker() 

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    startTracking() 
    return () => stopTracking() 
  }, [startTracking, stopTracking])

  return (
  <ProjectsProvider>
    <DndProvider backend={HTML5Backend}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/team" element={<TeamAnalytics />} />
            <Route path="/analytics/projects" element={<ProjectAnalytics />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DndProvider>
  </ProjectsProvider>
)
}

export default App
