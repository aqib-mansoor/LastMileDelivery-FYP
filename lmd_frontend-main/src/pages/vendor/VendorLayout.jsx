import { useState, useEffect } from 'react'
import { useNavigate, Link, Outlet } from 'react-router-dom'

function VendorLayout() {
    const [user, setUser] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if user is logged in and is a vendor
        const userData = localStorage.getItem('user')
        if (!userData) {
            navigate('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'vendor') {
            navigate('/')
            return
        }

        setUser(parsedUser)
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('user')
        navigate('/login')
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
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
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}>
                <div className="flex items-center justify-between p-4 border-b bg-primary-600 text-white">
                    <h2 className="text-xl font-bold">LMD System</h2>
                    <button className="p-2 rounded-full hover:bg-primary-700 lg:hidden" onClick={toggleSidebar}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center py-6 px-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                Vendor
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-3 py-2">
                    <div className="text-xs uppercase font-semibold text-gray-400 tracking-wider mb-2 px-3">
                        Menu
                    </div>
                    <nav className="space-y-10">
                        <Link to="/vendor/dashboard" className="group flex items-center px-3 py-2.5 text-base font-medium rounded-lg text-primary hover:bg-gray-100 hover:text-primary-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <div className="text-primary">Dashboard</div>
                        </Link>

                        <Link to="/vendor/orders" className="group flex items-center px-3 py-2.5 text-base font-medium rounded-lg text-primary hover:bg-gray-100 hover:text-primary-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <div className="text-primary">Orders</div>
                        </Link>

                        <Link to="/vendor/organizations" className="group flex items-center px-3 py-2.5 text-base font-medium rounded-lg text-primary hover:bg-gray-100 hover:text-primary-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <div className="text-primary">Organizations</div>
                        </Link>

                        <div className="pt-5 mt-5 border-t border-gray-200">
                            <div className="text-xs uppercase font-semibold text-gray-400 tracking-wider mb-2 px-3">
                                Account
                            </div>

                            <button onClick={handleLogout} className="w-full group flex items-center px-3 py-2.5 text-base font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-white group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <div className="text-white">Logout</div>
                            </button>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'ml-0'}`}>
                <header className="flex items-center justify-between bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex items-center">
                        <button className="p-2 rounded-md hover:bg-gray-200 lg:hidden" onClick={toggleSidebar}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Child routes render here */}
                <Outlet context={{ user, navigate, toggleSidebar }} />
            </main>
        </div>
    )
}

export default VendorLayout 