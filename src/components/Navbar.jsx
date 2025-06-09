import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/image/sea.png';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar({ hiddenLinks = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', prefersDark);
    setDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#1D0036] shadow-sm transition-colors sticky top-0 z-40"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-300">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            <span className="ml-2 text-xl font-bold">REMS</span>
          </Link>

          {!hiddenLinks && (
            <div className="hidden md:flex space-x-6 ml-10">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/faq" className="nav-link">FAQ</Link>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="text-xl text-gray-600 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-300">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 rounded-full focus:outline-none text-sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <FaUserCircle className="h-8 w-8 text-gray-400 dark:text-gray-200" />
                  <span className="hidden sm:block text-gray-800 dark:text-white font-medium">{currentUser.name}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#2D2040] text-gray-800 dark:text-white rounded-lg shadow-lg z-30"
                    >
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                        Signed in as <strong>{currentUser.email}</strong>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3C1260]"
                      >
                        <FaUserCircle /> <span>Profile</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3C1260]"
                      >
                        <FaChartLine /> <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-[#3C1260] w-full text-left"
                      >
                        <FaSignOutAlt /> <span>Sign out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-outline">Log in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </div>
            )}

            {!hiddenLinks && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-200"
              >
                {mobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!hiddenLinks && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden px-4 py-3 space-y-2 bg-white dark:bg-[#1D0036] border-t border-gray-100 dark:border-gray-700"
          >
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block nav-link">Home</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block nav-link">About</Link>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block nav-link">FAQ</Link>
            {!currentUser && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block nav-link">Log in</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;