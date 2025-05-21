import { Link } from 'react-router-dom'
import { 
  FaTachometerAlt, 
  FaUserCircle, 
  FaUsers, 
  FaTasks, 
  FaChartLine,
  FaCog,
  FaTimes,
  FaProjectDiagram,
  FaUserFriends
} from 'react-icons/fa'

function Sidebar({ isOpen, setIsOpen, userRole }) {
  // Define sidebar links based on user role
  const sidebarLinks = [
    {
      name: 'Dashboard',
      icon: <FaTachometerAlt />,
      to: '/dashboard',
      visible: true
    },
    {
      name: 'Projects',
      icon: <FaProjectDiagram />,
      to: '/projects',
      visible: ['admin', 'manager'].includes(userRole)
    },
    {
      name: 'Tasks',
      icon: <FaTasks />,
      to: '/tasks',
      visible: ['admin', 'manager'].includes(userRole)
    },
    {
      name: 'Team Analytics',
      icon: <FaUserFriends />,
      to: '/analytics/team',
      visible: ['admin', 'manager'].includes(userRole)
    },
    {
      name: 'Project Analytics',
      icon: <FaChartLine />,
      to: '/analytics/projects',
      visible: ['admin', 'manager'].includes(userRole)
    },
    {
      name: 'My Analytics',
      icon: <FaChartLine />,
      to: '/analytics',
      visible: userRole === 'worker'
    },
    {
      name: 'Profile',
      icon: <FaUserCircle />,
      to: '/profile',
      visible: true
    },
    {
      name: 'Users',
      icon: <FaUsers />,
      to: '/users',
      visible: userRole === 'admin'
    },
    
  ]
  
  // Filter links based on user role
  const filteredLinks = sidebarLinks.filter(link => link.visible)
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 md:top-16 h-full md:h-[calc(100vh-4rem)] 
          w-64 bg-gray-800 text-white z-30 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="flex justify-end p-4 md:hidden">
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-gray-700 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FaUserCircle className="h-8 w-8 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate">
                {userRole === 'admin' && '👑 '}
                {userRole === 'manager' && '🔶 '}
                {userRole === 'worker' && '🔹 '}
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="px-2 space-y-1">
          {filteredLinks.map(link => (
            <Link
              key={link.name}
              to={link.to}
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-300">
                {link.icon}
              </span>
              {link.name}
            </Link>
          ))}
        </nav>
        
        {/* Role indicator */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full w-3 h-3 bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-400">
              {userRole === 'admin' 
                ? 'Administrator' 
                : userRole === 'manager' 
                  ? 'Manager' 
                  : 'Worker'}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar