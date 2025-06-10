import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  FaEnvelope, FaUser, FaLock, FaSave, FaEye, FaEyeSlash
} from 'react-icons/fa'
import apiClient from '../utils/apiClient'

// 🔧 Генерация аватарки с инициалами
function generateAvatarWithInitials(name = 'U') {
  const initials = name
    .split(' ')
    .map(n => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2)

  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#743AA6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = 'bold 64px sans-serif'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, canvas.width / 2, canvas.height / 2)

  return canvas.toDataURL('image/png')
}

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
    avatarPreview: currentUser?.avatar || generateAvatarWithInitials(currentUser?.name),
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        return setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      }
      if (formData.newPassword !== formData.confirmPassword) {
        return setMessage({ type: 'error', text: 'Passwords do not match' })
      }
      if (!formData.oldPassword) {
        return setMessage({ type: 'error', text: 'Current password is required' })
      }
    }

    let avatarUrl = formData.avatar
    if (formData.avatarFile) {
      const uploadData = new FormData()
      uploadData.append('avatar', formData.avatarFile)

      try {
        const res = await apiClient.patch('/users/avatar', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        avatarUrl = res.data.avatar
      } catch {
        return setMessage({ type: 'error', text: 'Failed to upload avatar' })
      }
    }

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
      setFormData(prev => ({
        ...prev,
        avatar: avatarUrl,
        avatarPreview: avatarUrl || generateAvatarWithInitials(prev.name),
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white dark:bg-[#1E1E2F] shadow-md rounded-lg overflow-hidden transition">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-[#380A60] dark:to-[#3C1260] px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="relative group cursor-pointer mb-4 sm:mb-0 sm:mr-6">
              <img
                src={formData.avatarPreview}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-4 border-white object-cover group-hover:opacity-80 transition"
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
                      avatarPreview: URL.createObjectURL(file)
                    }))
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      avatarFile: null,
                      avatarPreview: generateAvatarWithInitials(prev.name)
                    }))
                  }
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
              <p className="text-sm text-primary-100 dark:text-purple-200">
                {currentUser?.role?.[0].toUpperCase() + currentUser?.role?.slice(1)}
              </p>
              <p className="text-sm flex items-center justify-center sm:justify-start mt-1 text-primary-100 dark:text-purple-300">
                <FaEnvelope className="mr-2" /> {currentUser?.email}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-auto">
              {!isEditing && (
                <button
                  className="btn bg-white text-primary-700 hover:bg-primary-50 dark:bg-[#2D2040] dark:text-white dark:hover:bg-[#3C1260]"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {message.text && (
            <div
              className={`p-4 mb-6 rounded-md text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-200/10 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-200/10 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <div className="relative">
                    <FaUser className="absolute top-3 left-3 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                  <h3 className="text-lg font-semibold dark:text-white">Change Password</h3>
                  {['oldPassword', 'newPassword', 'confirmPassword'].map((field, index) => (
                    <div key={index}>
                      <label className="label capitalize">{field.replace(/Password/, ' Password')}</label>
                      <div className="relative">
                        <FaLock className="absolute top-3 left-3 text-gray-400" />
                        <input
                          type={showPasswords[field] ? 'text' : 'password'}
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          className="form-input pl-10 pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                          onClick={() => togglePasswordVisibility(field)}
                        >
                          {showPasswords[field] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center">
                  <FaSave className="mr-2" /> Save
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-sm text-gray-800 dark:text-gray-200">
              <div>
                <h3 className="text-lg font-semibold">Profile Information</h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <p className="py-2">Name: {currentUser?.name}</p>
                  <p className="py-2">Email: {currentUser?.email}</p>
                  <p className="py-2">Role: {currentUser?.role}</p>
                  <p className="py-2">Bio: {currentUser?.bio || 'No bio provided'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Security</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Last password change: {new Date().toLocaleDateString()}
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
