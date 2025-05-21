import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaChartLine } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/image/sea.png';


function Navbar({ hiddenLinks = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="ml-2 text-xl font-bold">REMS</span>
            </Link>
          </div>

          {/* Main Navigation (desktop) */}
          {!hiddenLinks && (
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link to="/" className="px-3 py-2 text-gray-700 hover:text-primary-600 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link to="/about" className="px-3 py-2 text-gray-700 hover:text-primary-600 rounded-md text-sm font-medium">
                  About
                </Link>
                <Link to="/faq" className="px-3 py-2 text-gray-700 hover:text-primary-600 rounded-md text-sm font-medium">
                  FAQ
                </Link>
              </div>
            </div>
          )}

          {/* User menu / Login buttons */}
          <div className="flex items-center">
            {currentUser ? (
              <div className="relative ml-3">
                <button
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center">
                    <FaUserCircle className="h-8 w-8 text-gray-400" />
                    <span className="ml-2 text-gray-700 font-medium hidden sm:block">
                      {currentUser.name}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg z-20 slide-down">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b">
                      Signed in as <span className="font-semibold">{currentUser.email}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaUserCircle className="mr-2" />
                        Profile
                      </div>
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <FaChartLine className="mr-2" />
                        Dashboard
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <div className="flex items-center">
                        <FaSignOutAlt className="mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline hidden sm:block">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {!hiddenLinks && (
              <div className="flex md:hidden ml-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <FaTimes className="block h-6 w-6" />
                  ) : (
                    <FaBars className="block h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {!hiddenLinks && mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/faq"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            {!currentUser && (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
