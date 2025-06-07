import { useState, useEffect } from 'react'
import { FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaFilePdf } from 'react-icons/fa'
import axios from 'axios'
import { saveAs } from 'file-saver'

function Users() {
  const [users, setUsers] = useState([])
  const [sortOrder, setSortOrder] = useState([])
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'worker',
    password: ''
  })

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

  const handleAddUser = () => {
    const user = {
      id: users.length + 1,
      ...newUser,
      status: 'active',
      lastActive: 'Just now'
    }
    setUsers([...users, user])
    setIsAddingUser(false)
    setNewUser({ name: '', email: '', role: 'worker', password: '' })
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  const downloadUserPdf = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const startDate = '2025-06-01'
      const endDate = '2025-06-07'

      const response = await axios.get('http://localhost:3000/api/activity/pdf', {
        params: { userId, startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' })
      saveAs(pdfBlob, `activity-${userId}.pdf`)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download user activity PDF')
    }
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  const multiSort = (data, criteria) => {
    return [...data].sort((a, b) => {
      for (let key of criteria) {
        let result = 0;
        if (key === 'role') {
          result = a.role.localeCompare(b.role);
        } else if (key === 'status') {
          result = (b.is_logged_in ? 1 : 0) - (a.is_logged_in ? 1 : 0);
        } else if (key === 'last_active') {
          const aTime = a.last_active ? new Date(a.last_active).getTime() : 0;
          const bTime = b.last_active ? new Date(b.last_active).getTime() : 0;
          result = bTime - aTime;
        }
        if (result !== 0) return result;
      }
      return 0;
    });
  }

  const toggleSortKey = (key) => {
    setSortOrder(prev => {
      const newOrder = [...prev];
      if (!newOrder.includes(key)) {
        newOrder.push(key);
      } else {
        return newOrder.filter(k => k !== key);
      }
      return newOrder;
    })
  }

  const sortedUsers = multiSort(users, sortOrder)

  const isActiveSort = (key) => sortOrder.includes(key);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button className="btn-primary flex items-center" onClick={() => setIsAddingUser(true)}>
          <FaUserPlus className="mr-2" /> Add User
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={`btn-outline ${isActiveSort('role') ? 'bg-blue-100 border-blue-500 text-blue-800' : ''}`} onClick={() => toggleSortKey('role')}>Sort by Role</button>
        <button className={`btn-outline ${isActiveSort('last_active') ? 'bg-blue-100 border-blue-500 text-blue-800' : ''}`} onClick={() => toggleSortKey('last_active')}>Sort by Activity</button>
        <button className={`btn-outline ${isActiveSort('status') ? 'bg-blue-100 border-blue-500 text-blue-800' : ''}`} onClick={() => toggleSortKey('status')}>Sort by Status</button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                    'bg-green-100 text-green-800'}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeAgo(user.last_active)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`flex items-center ${user.is_logged_in ? 'text-green-500' : 'text-red-500'}`}>
                    {user.is_logged_in ? <FaCheck className="mr-1.5 h-2 w-2" /> : <FaTimes className="mr-1.5 h-2 w-2" />} {user.is_logged_in ? 'online' : 'offline'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                  <button onClick={() => downloadUserPdf(user.id)} className="hover:underline flex items-center">
                    <FaFilePdf className="mr-1" /> PDF
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900 mr-3" onClick={() => {/* Handle edit */}}><FaEdit /></button>
                  <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteUser(user.id)}><FaTrash /></button>
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