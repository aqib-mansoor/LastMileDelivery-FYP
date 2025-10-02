import config from '@/api/config'
import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function useOrganizationStats(organizationId){
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if(organizationId){
        const getOrganizationStats = async () => {
            setLoading(true)
            try {
                const response = await fetch(`${config.baseUrl}/organizations/${organizationId}/organization-stats`)
                const data = await response.json()
                setStats(data)
            } catch (error) {
                console.error('Error fetching organization stats:', error)
            } finally {
                setLoading(false)
            }
        }
        getOrganizationStats()
      }
    }, [organizationId])

    return { stats, loading }
}

function OrganizationLayout() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { stats, loading } = useOrganizationStats(user?.organization_id)

  useEffect(() => {
    // Check if organization is logged in
    const organization = localStorage.getItem('organization')
    if (!organization) {
      navigate('/login')
      return
    }

    try {
      const parsedOrganization = JSON.parse(organization)
      setUser(parsedOrganization)
    } catch (error) {
      console.error('Error parsing organization data:', error)
      localStorage.removeItem('organization')
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('organization')
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
      <div className="hidden md:flex md:flex-shrink-0 md:sticky md:top-0 md:h-screen">
        <div className="flex flex-col w-64 bg-primary-800 text-primary h-screen">
          <div className="flex-shrink-0 flex items-center justify-center h-16 px-4">
            <h1 className="text-xl font-bold">Organization Portal</h1>
          </div>
          <div className="flex flex-col flex-grow px-4 py-4 min-h-0">
            <div className="flex flex-col items-center mb-6 pb-6 border-b border-primary-700">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold mb-2">
                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <h2 className="text-lg font-medium">{user.name}</h2>
              <p className="text-sm text-primary-300">{user.email}</p>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto min-h-0">
              <Link
                to="/organization/dashboard"
                className="flex items-center px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-md group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                to="/organization/vendor-requests"
                className="flex items-center px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-md group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Vendor Requests
              </Link>
              <Link
                to="/organization/riders"
                className="flex items-center px-4 py-2 text-primary-100 hover:bg-primary-700 rounded-md group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Riders
              </Link>
            </nav>
            <div className="flex-shrink-0 pt-4 mt-6 border-t border-primary-700">
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
        <div className="md:hidden bg-primary-800 text-primary shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <h1 className="text-lg font-bold">Organization Portal</h1>
            </div>
            <button 
              onClick={toggleMenu} 
              className="p-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          {isMenuOpen && (
            <div className="border-t border-primary-700 bg-primary">
              {/* User info on mobile */}
              <div className="flex-shrink-0 px-4 py-4 border-b border-primary-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-lg font-bold mr-3">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-white">{user.name}</h2>
                    <p className="text-xs text-primary-300">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation links */}
              <div className="px-2 py-3 space-y-1">
                <Link
                  to="/organization/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/organization/vendor-requests"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Vendor Requests
                </Link>
                <Link
                  to="/organization/riders"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Riders
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 min-w-0">
          <div className="py-4 sm:py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
              <Outlet context={{ user, navigate, stats, statsLoading: loading }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default OrganizationLayout
