import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Please enter both email and password')
      setIsLoading(false)
      return
    }

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Failed to log in')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const sampleCredentials = [
    { role: 'Admin', email: 'admintest@gmail.com', password: '3224212mM!' },
    { role: 'Manager', email: 'testmanager@gmail.com', password: '3224212mM!' },
    { role: 'Worker', email: 'zhasulan@z', password: '3224212mM!' }
  ]

  return (
    <motion.div
      className="max-w-md mx-auto px-6 py-12 bg-white dark:bg-[#2D2040] rounded-2xl shadow-lg mt-12"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-primary-700 dark:text-white">Log in to your account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Or{' '}
          <Link to="/register" className="text-accent-600 hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input mt-1"
            required
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input mt-1 pr-10"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
            onClick={() => setShowPassword(!showPassword)}>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" className="form-checkbox text-primary-600" />
            <span className="ml-2">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-accent-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className={`btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-[#3C1260]">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Sample credentials for demo:</h3>
        <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
          {sampleCredentials.map((cred, i) => (
            <li key={i} className="flex flex-col sm:flex-row justify-between">
              <div><strong>{cred.role}</strong>: {cred.email}</div>
              <div>Password: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{cred.password}</code></div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default Login