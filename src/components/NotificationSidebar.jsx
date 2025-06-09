import { useEffect, useState } from 'react'
import { FaBell, FaComment, FaTimes } from 'react-icons/fa'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const socket = io('http://localhost:3000') // если другое: замените URL

function NotificationSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('notifications')
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  // Загрузка уведомлений
  useEffect(() => {
    if (!currentUser?.id) return

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setNotifications(data)
      } catch (error) {
        console.error('❌ Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [currentUser])

  // WebSocket-подписка на новые уведомления
  useEffect(() => {
    if (!currentUser?.id) return

    socket.on(`notification:${currentUser.id}`, (data) => {
      setNotifications(prev => [data, ...prev])
    })

    return () => {
      socket.off(`notification:${currentUser.id}`)
    }
  }, [currentUser])

  return (
    <>
      {/* 🔔 Кнопка открытия */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-20 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        <FaBell />
      </button>

      {/* 📬 Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-[#1D0036] text-black dark:text-white shadow-xl transform transition-transform z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* 🔻 Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab('notifications')} className={`p-2 rounded-md ${activeTab === 'notifications' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 dark:text-white/70'}`}>
              <FaBell />
            </button>
            <button disabled className="p-2 text-gray-400">
              <FaComment />
            </button>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-300 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* 📥 Контент */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-lg ${n.isRead ? 'bg-gray-100 dark:bg-[#2D2040]' : 'bg-primary-50 dark:bg-[#3C1260]'}`}>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default NotificationSidebar
