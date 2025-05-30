import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
  
  // Sample credentials info for demo purposes
  const sampleCredentials = [
    { role: 'Admin', email: 'admintest@gmail.com', password: '3224212mM!' },
    { role: 'Manager', email: 'testmanager@gmail.com', password: '3224212mM!' },
    { role: 'Worker', email: 'zhasulan@z', password: '3224212mM!' }
  ]
  
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Log in to your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
            create a new account
          </Link>
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input mt-1"
          />
        </div>
        
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input mt-1 pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500 font-medium">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className={`w-full btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </div>
      </form>
      
      {/* Sample credentials for demo */}
      <div className="mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Sample credentials for demo:
        </h3>
        <div className="text-xs text-gray-600 space-y-1">
          {sampleCredentials.map((cred, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-1">
              <div>
                <span className="font-semibold">{cred.role}:</span> {cred.email}
              </div>
              <div>
                Password: <code className="bg-gray-200 px-1 rounded">{cred.password}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Login