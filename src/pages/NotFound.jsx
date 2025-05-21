import { Link } from 'react-router-dom'
import logo from '../assets/image/sea.png';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              </Link>
      
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
        
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/" className="btn-primary">
            Go to Homepage
          </Link>
          <Link to="/dashboard" className="btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound