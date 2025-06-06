import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaPhone } from 'react-icons/fa'

function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const response = await fetch('/api/send-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Reset code has been sent to your phone number!'
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to send reset code'
        })
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      })
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your phone number and we'll send you a code to reset your password
        </p>
      </div>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-success-50 text-success-700'
            : 'bg-error-50 text-error-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="form-input pl-10"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter your phone number in international format (e.g., +1234567890)
          </p>
        </div>
        
        <div>
          <button
            type="submit"
            className={`w-full btn-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </div>
        
        <div className="text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ForgotPassword