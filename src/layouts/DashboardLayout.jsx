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
    <div className="min-h-screen bg-gray-50">
      <Navbar hiddenLinks={true}/>
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          userRole={currentUser?.role || 'worker'} 
        />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
          
          {!trackingConsent && (
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
              <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  We would like to monitor your activity to improve your experience. This includes tracking mouse movements and keyboard inputs.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="btn-primary"
                    onClick={handleTrackingConsent}
                  >
                    Accept
                  </button>
                  <button className="btn-outline">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <NotificationSidebar />
      </div>
    </div>
  )
}

export default DashboardLayout