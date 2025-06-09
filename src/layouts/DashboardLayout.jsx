import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import NotificationSidebar from '../components/NotificationSidebar'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useActivityTracker } from '../hooks/useActivityTracker'

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser } = useAuth()
  const { startTracking, isTracking } = useActivityTracker()
  const [trackingConsent, setTrackingConsent] = useState(
    localStorage.getItem('trackingConsent') === 'true'
  )

  useEffect(() => {
    if (trackingConsent && !isTracking) {
      startTracking()
    }
  }, [trackingConsent, isTracking, startTracking])

  const handleTrackingConsent = () => {
    localStorage.setItem('trackingConsent', 'true')
    setTrackingConsent(true)
    startTracking()
  }

  return (
    <div className="min-h-screen bg-neutral-light dark:bg-dark-600 text-gray-900 dark:text-white">
      <Navbar hiddenLinks={true} />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          userRole={currentUser?.role || 'worker'}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />

          {!trackingConsent && (
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-400 shadow-glow p-4 z-50">
              <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-neutral-dark dark:text-neutral-light">
                  We would like to monitor your activity to improve your experience. This includes tracking mouse movements and keyboard inputs.
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow transition-all"
                    onClick={handleTrackingConsent}
                  >
                    Accept
                  </button>
                  <button className="px-4 py-2 border border-primary-500 text-primary-500 hover:bg-primary-100 rounded-lg transition-all">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <NotificationSidebar />
      </div>
    </div>
  )
}

export default DashboardLayout