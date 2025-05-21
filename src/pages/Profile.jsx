import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaUserCircle, FaEnvelope, FaUser, FaLock, FaSave } from 'react-icons/fa'

function Profile() {
  const { currentUser, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    
    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
        return
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' })
        return
      }
      
      if (!formData.oldPassword) {
        setMessage({ type: 'error', text: 'Current password is required' })
        return
      }
    }
    
    // Update profile
    const result = updateProfile({
      name: formData.name,
      bio: formData.bio,
      // In a real app, we would send the passwords to verify and update
    })
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-card rounded-lg overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              <FaUserCircle className="h-24 w-24 text-white opacity-80" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
              <p className="text-primary-100">
                {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
              </p>
              <p className="text-primary-100 flex items-center justify-center sm:justify-start mt-2">
                <FaEnvelope className="mr-2" />
                {currentUser?.email}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-auto">
              {!isEditing && (
                <button 
                  className="btn bg-white text-primary-700 hover:bg-primary-50"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile content */}
        <div className="p-6">
          {message.text && (
            <div className={`p-4 mb-6 rounded-md ${
              message.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
            }`}>
              {message.text}
            </div>
          )}
          
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="oldPassword"
                          id="oldPassword"
                          value={formData.oldPassword}
                          onChange={handleInputChange}
                          className="form-input pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="form-input pl-10"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to keep your current password.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="form-input pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                  >
                    <FaSave className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Information</h3>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="font-medium text-gray-500">Name</dt>
                    <dd className="text-gray-900">{currentUser?.name}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="font-medium text-gray-500">Email</dt>
                    <dd className="text-gray-900">{currentUser?.email}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="font-medium text-gray-500">Role</dt>
                    <dd className="text-gray-900">
                      {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="font-medium text-gray-500">Bio</dt>
                    <dd className="text-gray-900">
                      {currentUser?.bio || 'No bio provided'}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-500">
                  Your password was last changed on {new Date().toLocaleDateString()}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile