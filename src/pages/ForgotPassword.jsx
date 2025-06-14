import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope } from 'react-icons/fa'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/auth/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('resetEmail', email)
        setMessage({
          type: 'success',
          text: 'Reset code has been sent to your email address!',
        })
        setTimeout(() => navigate('/verify-code'), 1500)
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to send reset code',
        })
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      })
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-[#2D2040] rounded-xl shadow-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Enter your email address and we’ll send you a code to reset your password
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="form-input w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#3C2E56] dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter the email address you used during registration
          </p>
        </div>

        <div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 transition ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </div>

        <div className="text-center">
          <Link to="/login" className="text-sm text-purple-600 hover:text-purple-500">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ForgotPassword
