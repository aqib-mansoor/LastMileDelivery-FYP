import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import VendorSidebar from '../components/VendorSidebar'
import config from '../api/config'

function VendorLayout() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        // Check if user is logged in and is a vendor
        const userData = localStorage.getItem('user')
        if (!userData) {
            navigate('/login')
            return
        }

        try {
            const parsedUser = JSON.parse(userData)
            if (parsedUser.role !== 'vendor') {
                navigate('/')
                return
            }

            setUser(parsedUser)
        } catch (error) {
            console.error('Error parsing user data:', error)
            navigate('/login')
        } finally {
            setIsLoading(false)
        }
    }, [navigate])

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        navigate('/login')
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg">Loading...</span>
            </div>
        )
    }

    // If no user after loading, navigate to login
    if (!isLoading && !user) {
        navigate('/login')
        return null
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <VendorSidebar
                user={user}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Hamburger menu for mobile */}
                <div className="lg:hidden flex items-center p-4 border-b bg-white">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="ml-4 text-xl font-semibold text-gray-800">LMD Vendor Dashboard</h1>
                </div>

                {/* Outlet for nested routes */}
                <Outlet context={{ user, handleLogout }} />
            </main>
        </div>
    )
}

export default VendorLayout 