import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { 
    HomeIcon, 
    BuildingStorefrontIcon, 
    ShoppingBagIcon, 
    CogIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import config from '../api/config'

function VendorLayout() {
    const navigate = useNavigate()
    const location = useLocation()
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

    const navigation = [
        { name: 'Dashboard', href: '/vendor/dashboard', icon: HomeIcon, current: location.pathname.includes('/vendor/dashboard') },
        { name: 'Shops', href: '/vendor/shops', icon: BuildingStorefrontIcon, current: location.pathname.includes('/vendor/shops') },
        { name: 'Orders', href: '/vendor/orders', icon: ShoppingBagIcon, current: location.pathname.includes('/vendor/orders') },
        { name: 'Settings', href: '/vendor/settings', icon: CogIcon, current: location.pathname.includes('/vendor/settings') }
    ]

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
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:inset-auto lg:h-screen lg:sticky lg:top-0`}>
                <div className="flex flex-col h-screen">
                    {/* Sidebar header */}
                    <div className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Vendor Panel</h2>
                        <div className="mt-1 text-sm text-gray-600">{user?.name || user?.email}</div>
                    </div>

                    {/* Sidebar navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${item.current
                                    ? 'bg-primary text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}
                                    aria-hidden="true"
                                />
                                <div className={`${item.current ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                    </nav>

                    {/* Logout button */}
                    <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center bg-primary text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-primary-dark"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col">
                {/* Hamburger menu for mobile */}
                <div className="lg:hidden flex items-center p-4 border-b bg-white">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-gray-200"
                    >
                        {sidebarOpen ? (
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                    <h1 className="ml-4 text-xl font-semibold text-gray-800">LMD Vendor Dashboard</h1>
                </div>

                {/* Outlet for nested routes */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet context={{ user, handleLogout }} />
                </div>
            </main>
        </div>
    )
}

export default VendorLayout 