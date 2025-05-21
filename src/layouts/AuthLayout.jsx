import { Outlet, Link } from 'react-router-dom'
import { FaBolt } from 'react-icons/fa'

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center text-primary-600 hover:text-primary-700">
            <FaBolt className="h-10 w-10" />
            <span className="ml-2 text-2xl font-bold">Bolt</span>
          </Link>
        </div>
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout