import { useState, useEffect } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import {
    HomeIcon,
    ShoppingCartIcon,
    HeartIcon,
    ClockIcon,
    UserCircleIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightStartOnRectangleIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'
import CartIcon from '../../components/CartIcon'

function CustomerLayout() {
    const [user, setUser] = useState(null)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData)
                if (parsedUser.role !== 'customer') {
                    navigate('/login')
                    return
                }
                setUser(parsedUser)
            } catch (e) {
                navigate('/login')
            }
        } else {
            navigate('/login')
        }
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        navigate('/login')
    }

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu)
    }

    const navItems = [
        { path: '/customer/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/customer/orders', name: 'My Orders', icon: ClockIcon },
        { path: '/customer/about', name: 'About App', icon: InformationCircleIcon },
        { path: '/customer/privacy', name: 'Privacy Policy', icon: ShieldCheckIcon },
        { path: '/customer/terms', name: 'Terms of Conditions', icon: DocumentTextIcon },
        // { path: '/customer/favorites', name: 'Favorites', icon: HeartIcon },
        // { path: '/customer/history', name: 'History', icon: ShoppingCartIcon },
        // { path: '/customer/profile', name: 'Profile', icon: UserCircleIcon }
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex md:flex-col md:w-64 border-r shadow-sm md:sticky md:top-0 md:h-screen bg-white">
                <div className="flex-shrink-0 h-16 flex items-center justify-center border-b">
                    <h1 className="text-xl font-bold text-primary">LMD Customer</h1>
                </div>
                <div className="flex-1 overflow-y-auto py-4 min-h-0">
                    <nav className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-primary'}`} />
                                        <span className={
                                            `text-sm ${isActive ? 'text-white' : 'text-gray-700'}`
                                        }>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <div className="flex-shrink-0 p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3" />
                        Log Out
                    </button>
                    {user && (
                        <div className="mt-4 flex items-center px-4">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium overflow-hidden">
                                {user.profile_picture ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.name?.charAt(0)
                                )}
                            </div>
                            <div className="ml-2">
                                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="h-16 flex items-center justify-between border-b bg-white px-4 md:px-6">
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-gray-600 focus:outline-none"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="ml-2 text-lg font-semibold text-primary">LMD Customer</h1>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        {user && (
                            <span className="text-sm font-medium text-gray-600">
                                Welcome, {user.name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <CartIcon />

                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                            {user?.profile_picture ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}`}
                                    alt={user?.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name?.charAt(0)
                            )}
                        </div>
                    </div>
                </header>

                {/* Mobile sidebar */}
                {showMobileMenu && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-gray-600 bg-opacity-75"
                            onClick={toggleMobileMenu}
                        ></div>

                        {/* Sidebar */}
                        <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white">
                            <div className="h-16 flex items-center justify-between px-4 border-b">
                                <h1 className="text-lg font-bold text-primary">LMD Customer</h1>
                                <button onClick={toggleMobileMenu}>
                                    <XMarkIcon className="h-6 w-6 text-gray-600" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-4 min-h-0">
                                <nav className="space-y-1 px-2">
                                    {navItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`
                                            }
                                            onClick={toggleMobileMenu}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-primary'}`} />
                                                    <span className={`text-sm ${isActive ? 'text-white' : 'text-gray-700'}`}>{item.name}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </nav>
                            </div>
                            <div className="flex-shrink-0 p-4 border-t">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3" />
                                    Log Out
                                </button>
                                {user && (
                                    <div className="mt-4 flex items-center px-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium overflow-hidden">
                                            {user.profile_picture ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                user.name?.charAt(0)
                                            )}
                                        </div>
                                        <div className="ml-2">
                                            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Page content */}
                <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default CustomerLayout 