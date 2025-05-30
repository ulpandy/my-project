import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaUserCircle, FaEnvelope, FaUser, FaLock, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'

function Profile() {
  const { currentUser, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef()
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  })
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || '',
    avatarFile: null,
    avatarPreview: currentUser?.avatar || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = async (e) => {
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

    let avatarUrl = formData.avatar

    // Upload new avatar if selected
    if (formData.avatarFile) {
      const uploadData = new FormData()
      uploadData.append('avatar', formData.avatarFile)

      try {
        const token = localStorage.getItem('token')
        const res = await axios.patch('/users/avatar', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        })

        avatarUrl = res.data.avatar
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to upload avatar' })
        return
      }
    }

    // Update profile
    const result = await updateProfile({
      name: formData.name,
      bio: formData.bio,
      avatar: avatarUrl,
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    })

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
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
            <div className="mb-4 sm:mb-0 sm:mr-6 relative group cursor-pointer">
              <img
                src={formData.avatarPreview || currentUser?.avatar || '/default-avatar.png'}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-4 border-white object-cover group-hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current.click()}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    setFormData(prev => ({
                      ...prev,
                      avatarFile: file,
                      avatarPreview: URL.createObjectURL(file),
                    }))
                  }
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
              <p className="text-primary-100">
                {currentUser?.role?.charAt(0)?.toUpperCase() + currentUser?.role?.slice(1)}
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
                          type={showPasswords.oldPassword ? "text" : "password"}
                          name="oldPassword"
                          id="oldPassword"
                          value={formData.oldPassword}
                          onChange={handleInputChange}
                          className="form-input pl-10 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility('oldPassword')}
                        >
                          {showPasswords.oldPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          )}
                        </button>
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
                          type={showPasswords.newPassword ? "text" : "password"}
                          name="newPassword"
                          id="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="form-input pl-10 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility('newPassword')}
                        >
                          {showPasswords.newPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          )}
                        </button>
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
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="form-input pl-10 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                          {showPasswords.confirmPassword ? (
                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          ) : (
                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                          )}
                        </button>
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
                      {currentUser?.role?.charAt(0)?.toUpperCase() + currentUser?.role?.slice(1)}
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