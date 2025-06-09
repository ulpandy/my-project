import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa';
import logo from '../assets/image/sea.png';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-[#1D0036] text-gray-800 dark:text-white py-8 transition-colors duration-300">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="ml-2 text-xl font-bold">REMS</span>
            </Link>
            <p className="mt-2 text-gray-500 dark:text-gray-300 text-sm">
              Streamline your workflow with our powerful task management platform.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500">
                <FaLinkedin />
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-500">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-500 dark:text-gray-300 hover:text-primary-600">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-500 dark:text-gray-300 hover:text-primary-600">About</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-500 dark:text-gray-300 hover:text-primary-600">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-500 dark:text-gray-300 hover:text-primary-600">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-500 dark:text-gray-300 hover:text-primary-600">Register</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-500 dark:text-gray-300 hover:text-primary-600">Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-500 dark:text-gray-300">
              <p>Expo avenue</p>
              <p>Astana IT University</p>
              <p className="mt-2">remshelper@gmail.com</p>
            </address>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {year} REMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;