import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom'
import {
    HomeIcon,
    UserGroupIcon,
    BuildingStorefrontIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    CodeBracketIcon,
    CogIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline'

function AdminDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const sidebarRef = useRef(null)

    useEffect(() => {
        // Check if user is logged in and is admin
        const userData = localStorage.getItem('user')
        if (!userData) {
            navigate('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'admin') {
            navigate('/')
            return
        }

        setUser(parsedUser)

        // If we're at the root admin path, redirect to vendors list
        if (location.pathname === '/admin') {
            navigate('/admin/vendors')
        }
    }, [navigate, location.pathname])

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
                setSidebarOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [sidebarOpen])

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setSidebarOpen(false)
    }, [location.pathname])

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleLogout = () => {
        localStorage.removeItem('user')
        navigate('/login')
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, current: location.pathname.includes('/admin/dashboard') },
        { name: 'Vendors', href: '/admin/vendors', icon: UserGroupIcon, current: location.pathname.includes('/admin/vendors') },
        { name: 'Branches', href: '/admin/branches', icon: BuildingStorefrontIcon, current: location.pathname.includes('/admin/branches') },
        { name: 'API Vendors', href: '/admin/api-vendors', icon: CodeBracketIcon, current: location.pathname.includes('/admin/api-vendors') },
        { name: 'Variables', href: '/admin/variables', icon: CogIcon, current: location.pathname.includes('/admin/variables') },
        { name: 'LMD Settings', href: '/admin/lmd-settings', icon: CogIcon, current: location.pathname.includes('/admin/lmd-settings') },
        { name: 'LMD Earnings', href: '/admin/lmd-earnings', icon: CurrencyDollarIcon, current: location.pathname.includes('/admin/lmd-earnings') },
    ]

    return (
        <div className="min-h-screen flex bg-gray-100">


            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:inset-auto lg:h-screen lg:sticky lg:top-0`}
            >
                <div className="flex flex-col h-screen">
                    {/* Sidebar header */}
                    <div className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
                        <div className="mt-1 text-sm text-gray-600">{user.name || user.email}</div>
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
                                    className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                                        }`}
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
                            className="w-full flex items-center bg-primary text-white px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm z-20">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                {/* Mobile sidebar toggle */}
                                <button
                                    type="button"
                                    className="lg:hidden mr-3 text-gray-600 hover:text-gray-900 focus:outline-none"
                                    onClick={toggleSidebar}
                                >
                                    {sidebarOpen ? (
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                    )}
                                </button>
                                <h1 className="text-xl font-semibold text-gray-800">
                                    {location.pathname.includes('/vendors') && !location.pathname.includes('/api-vendors') ? 'Vendor Management' :
                                        location.pathname.includes('/branches') ? 'Branch Management' : 
                                        location.pathname.includes('/api-vendors') ? 'API Vendor Management' :
                                        location.pathname.includes('/variables') ? 'Variables Management' : 'Dashboard'}
                                </h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminDashboard 