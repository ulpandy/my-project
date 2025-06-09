import { Link, useLocation } from 'react-router-dom';
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
} from 'react-icons/fa';

function Sidebar({ isOpen, setIsOpen, userRole }) {
  const location = useLocation();

  const sidebarLinks = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, to: '/dashboard', visible: true },
    { name: 'Projects', icon: <FaProjectDiagram />, to: '/projects', visible: ['admin', 'manager'].includes(userRole) },
    { name: 'Tasks', icon: <FaTasks />, to: '/tasks', visible: ['admin', 'manager'].includes(userRole) },
    { name: 'Team Analytics', icon: <FaUserFriends />, to: '/analytics/team', visible: ['admin', 'manager'].includes(userRole) },
    { name: 'Project Analytics', icon: <FaChartLine />, to: '/analytics/projects', visible: ['admin', 'manager'].includes(userRole) },
    { name: 'My Analytics', icon: <FaChartLine />, to: '/analytics', visible: userRole === 'worker' },
    { name: 'Profile', icon: <FaUserCircle />, to: '/profile', visible: true },
    { name: 'Users', icon: <FaUsers />, to: '/users', visible: userRole === 'admin' }
  ];

  const filteredLinks = sidebarLinks.filter(link => link.visible);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`
          fixed md:sticky top-0 md:top-16 h-full md:h-[calc(100vh-4rem)]
          w-64 bg-gradient-to-b from-[#1D0036] to-[#3C1260] text-white z-30 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex justify-between items-center p-4 md:hidden">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 border-b border-white/20 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white text-primary-700 font-bold flex items-center justify-center text-lg">
              {userRole.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium truncate text-white">
              {userRole === 'admin' && '👑 '}
              {userRole === 'manager' && '🔶 '}
              {userRole === 'worker' && '🔹 '}
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>
        </div>

        <nav className="px-2 space-y-1">
          {filteredLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.name}
                to={link.to}
                className={`
                  flex items-center px-4 py-2 rounded-lg transition-colors gap-3
                  ${isActive ? 'bg-white text-primary-700 font-semibold' : 'hover:bg-white/10 text-white'}
                `}
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <div className="flex items-center">
            <span className="rounded-full w-3 h-3 bg-green-400 mr-2"></span>
            <span className="text-sm text-white/70">
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
  );
}

export default Sidebar;