import { useState } from 'react'
import { FaBell, FaComment, FaTimes } from 'react-icons/fa'

function NotificationSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')
  
  // Mock data - in a real app, this would come from your backend
  const notifications = [
    {
      id: 1,
      type: 'task',
      message: 'New task assigned: Update user interface',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'system',
      message: 'System maintenance scheduled for tonight',
      time: '1 hour ago',
      read: true
    }
  ]
  
  const messages = [
    {
      id: 1,
      sender: 'John Doe',
      message: 'Hey, how&#39;s the progress on the new feature?',
      time: '10 minutes ago',
      read: false
    },
    {
      id: 2,
      sender: 'Jane Smith',
      message: 'Team meeting at 3 PM today',
      time: '2 hours ago',
      read: true
    }
  ]
  
  return (
    <>
      {/* Toggle button */}
      <button
        className="fixed right-4 top-20 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        {activeTab === 'notifications' ? <FaBell /> : <FaComment />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
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
        
        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {activeTab === 'notifications' ? (
            <div className="p-4 space-y-4">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.read ? 'bg-gray-50' : 'bg-primary-50'
                  }`}
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.read ? 'bg-gray-50' : 'bg-primary-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800">
                    {message.sender}
                  </p>
                  <p className="text-sm text-gray-600">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default NotificationSidebar