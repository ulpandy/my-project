import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLock } from 'react-icons/fa'

function ResetPassword() {
  const navigate = useNavigate()
  const email = localStorage.getItem('resetEmail')
  const code = localStorage.getItem('resetCode')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/reset-password/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.removeItem('resetEmail')
        localStorage.removeItem('resetCode')
        setMessage({ type: 'success', text: 'Password reset successfully!' })
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to reset password' })
      }
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'Unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-[#2D2040] rounded-xl shadow-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set a New Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Enter a new password for your account.
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
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            New Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="form-input w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#3C2E56] dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Confirm Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="form-input w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#3C2E56] dark:text-white"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 transition ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword
