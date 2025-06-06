import { useState, useEffect } from 'react'
import { FaBell, FaComment, FaTimes } from 'react-icons/fa'

function NotificationSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ Загрузка уведомлений с backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
  }, [])

  return (
    <>
      {/* 🔔 Кнопка открытия */}
      <button
        className="fixed right-4 top-20 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <FaBell />
      </button>

      {/* 📬 Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 🔻 Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              className={`p-2 rounded-md ${
                activeTab === 'notifications'
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell />
            </button>
            <button
              className={`p-2 rounded-md ${
                activeTab === 'messages'
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <FaComment />
            </button>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        {/* 📥 Контент */}
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {activeTab === 'notifications' ? (
            <div className="p-4 space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="text-gray-500">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg ${
                      n.read ? 'bg-gray-50' : 'bg-primary-50'
                    }`}
                  >
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-4 text-gray-500">Messages not connected yet</div>
          )}
        </div>
      </div>
    </>
  )
}

export default NotificationSidebar
