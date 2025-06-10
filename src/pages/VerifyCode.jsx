import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaKey } from 'react-icons/fa'

function VerifyCode() {
  const email = localStorage.getItem('resetEmail')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('resetCode', code)
        setMessage({ type: 'success', text: 'Code verified! Redirecting...' })
        setTimeout(() => navigate('/reset-password'), 1000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid or expired code' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Unexpected error occurred' })
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-[#2D2040] rounded-xl shadow-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Reset Code</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.
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
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Verification Code
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaKey className="text-gray-400" />
            </div>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
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
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default VerifyCode
