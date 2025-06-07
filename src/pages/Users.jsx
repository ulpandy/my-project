import { useState, useEffect } from 'react'
import { FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaFilePdf } from 'react-icons/fa'
import axios from 'axios'
import { saveAs } from 'file-saver'

function Users() {
  const [users, setUsers] = useState([])
  const [sortOrder, setSortOrder] = useState([])
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'worker', password: '' })
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/users/with-activity', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error('Error loading users:', err)
      }
    }
    fetchUsers()
  }, [])

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email)

  const handleAddUser = async () => {
    if (!validateEmail(newUser.email)) {
      setEmailError('Invalid email format')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('http://localhost:3000/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(prev => [...prev, res.data])
      setNewUser({ name: '', email: '', role: 'worker', password: '' })
      setEmailError('')
      setIsAddingUser(false)
    } catch (err) {
      console.error('Error adding user:', err)
      if (err.response?.data?.message) {
        setEmailError(err.response.data.message)
      } else {
        setEmailError('Failed to add user')
      }
    }
  }

  const downloadUserPdf = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:3000/api/activity/pdf', {
        params: { userId, startDate: '2025-06-01', endDate: '2025-06-07' },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      const pdfBlob = new Blob([res.data], { type: 'application/pdf' })
      saveAs(pdfBlob, `activity-${userId}.pdf`)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download user activity PDF')
    }
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A'
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(mins / 60)
    const days = Math.floor(hrs / 24)
    return mins < 1 ? 'just now'
         : mins < 60 ? `${mins} minute${mins === 1 ? '' : 's'} ago`
         : hrs < 24 ? `${hrs} hour${hrs === 1 ? '' : 's'} ago`
         : `${days} day${days === 1 ? '' : 's'} ago`
  }

  const toggleSortKey = (key) => {
    setSortOrder(prev => (
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    ))
  }

  const multiSort = (data, keys) => {
    return [...data].sort((a, b) => {
      for (let key of keys) {
        let result = 0
        if (key === 'role') result = a.role.localeCompare(b.role)
        else if (key === 'last_active') {
          const at = a.last_active ? new Date(a.last_active).getTime() : 0
          const bt = b.last_active ? new Date(b.last_active).getTime() : 0
          result = bt - at
        } else if (key === 'status') result = (b.is_logged_in ? 1 : 0) - (a.is_logged_in ? 1 : 0)
        if (result !== 0) return result
      }
      return 0
    })
  }

  const sortedUsers = multiSort(users, sortOrder)
  const isActiveSort = (key) => sortOrder.includes(key)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button className="btn-primary flex items-center" onClick={() => setIsAddingUser(true)}>
          <FaUserPlus className="mr-2" /> Add User
        </button>
      </div>

      {isAddingUser && (
        <div className="card bg-white p-4 space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="form-input w-full"
            value={newUser.name}
            onChange={e => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="form-input w-full"
            value={newUser.email}
            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          <select
            className="form-input w-full"
            value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="worker">Worker</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            className="form-input w-full"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
          />
          <div className="flex justify-end space-x-2">
            <button className="btn-outline" onClick={() => {
              setIsAddingUser(false)
              setEmailError('')
            }}>Cancel</button>
            <button className="btn-primary" onClick={handleAddUser}>Add</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button className={`btn-outline ${isActiveSort('role') ? 'bg-blue-100 border-blue-500 text-blue-800' : ''}`} onClick={() => toggleSortKey('role')}>Sort by Role</button>
        <button className={`btn-outline ${isActiveSort('last_active') ? 'bg-blue-100 border-blue-500 text-blue-800' : ''}`} onClick={() => toggleSortKey('last_active')}>Sort by Activity</button>
        <button className={`btn-outline ${isActiveSort('status') ? 'bg-blue-100 border-blue-500 text-blue-800' : ''}`} onClick={() => toggleSortKey('status')}>Sort by Status</button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">{user.name[0]}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeAgo(user.last_active)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`flex items-center ${user.is_logged_in ? 'text-green-500' : 'text-red-500'}`}>
                    {user.is_logged_in ? <FaCheck className="mr-1.5 h-2 w-2" /> : <FaTimes className="mr-1.5 h-2 w-2" />} 
                    {user.is_logged_in ? 'online' : 'offline'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                  <button onClick={() => downloadUserPdf(user.id)} className="hover:underline flex items-center">
                    <FaFilePdf className="mr-1" /> PDF
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900 mr-3"><FaEdit /></button>
                  <button className="text-red-600 hover:text-red-900" onClick={() => setUsers(users.filter(u => u.id !== user.id))}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users
