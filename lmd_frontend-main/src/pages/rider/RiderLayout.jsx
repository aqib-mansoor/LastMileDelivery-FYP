import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function RiderLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Check if rider is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))

    // try {
    //   const parsedUser = JSON.parse(userData)
    //   if (parsedUser.role !== 'rider') {
    //     navigate('/login')
    //     return
    //   }
    //   setUser(parsedUser)
    // } catch (error) {
    //   console.error('Error parsing rider data:', error)
    //   localStorage.removeItem('user')
    //   navigate('/login')
    // }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-primary-800 text-primary">
          <div className="flex items-center justify-center h-16 px-4 bg-primary-900">
            <h1 className="text-xl font-bold">Rider Portal</h1>
          </div>
          <div className="flex flex-col flex-grow px-4 py-4">
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-primary-700">
              <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold mb-2">
                {user.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <h2 className="text-lg font-medium">{user.name}</h2>
              <p className="text-sm text-primary-300">{user.email}</p>
            </div>
            <nav className="flex-1 space-y-1">
              <Link
                to="/rider/dashboard"
                className="flex items-center px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-md group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/rider/ready-orders"
                className="flex items-center px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-md group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Ready Orders
              </Link>
              <Link
                to="/rider/assigned-orders"
                className="flex items-center px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-md group"
              >
                Assigned Orders
              </Link>
            </nav>
            <div className="pt-4 mt-6 border-t border-primary-700">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden bg-primary-800 text-primary">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <h1 className="text-lg font-bold">Rider Portal</h1>
            </div>
            <button onClick={toggleMenu} className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {isMenuOpen && (
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/rider/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/rider/ready-orders"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Ready Orders
              </Link>
              <Link
                to="/rider/assigned-orders"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Assigned Orders
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <Outlet context={{ user, navigate }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default RiderLayout
