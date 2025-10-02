import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ShoppingBagIcon,
    HeartIcon,
    ClockIcon,
    MapPinIcon,
    TruckIcon,
    StarIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import config from '../../api/config'

function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [nearbyShops, setNearbyShops] = useState([])
    const [allShops, setAllShops] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchText, setSearchText] = useState('')
    const [customerFullData, setCustomerFullData] = useState(null)
    const [stats, setStats] = useState([
        { id: 1, name: 'Active Orders', value: '0', icon: TruckIcon, color: 'bg-blue-100 text-blue-600' },
        { id: 2, name: 'Completed Orders', value: '0', icon: ShoppingBagIcon, color: 'bg-green-100 text-green-600' },
        { id: 3, name: 'Favorite Shops', value: '0', icon: HeartIcon, color: 'bg-red-100 text-red-600' },
        { id: 4, name: 'Saved Addresses', value: '1', icon: MapPinIcon, color: 'bg-purple-100 text-purple-600' }
    ])

    useEffect(() => {
        // Fetch user data
        const userData = localStorage.getItem('user')
        let userId = null

        if (userData) {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
            userId = parsedUser.id
        }

        // Fetch dashboard data if userId is available
        if (userId) {
            fetchShopCategories()
            fetchDashboardData(userId)
            getCustomerFullDetails(userId)
        } else {
            setIsLoading(false)
        }
    }, [])

    const getCustomerFullDetails = async (customerId) => {
        try {
            const response = await fetch(`${config.baseUrl}/customers/${customerId}`)
            const data = await response.json()
            if (data) {
                setCustomerFullData(data)
            }
        } catch (error) {
            console.error('Error fetching customer details:', error)
        }
    }

    const fetchShopCategories = async () => {
        try {
            const response = await fetch(`${config.baseUrl}/shopcategories`)
            const data = await response.json()
            if (data) {
                setCategories([{ id: 'all', name: 'All' }, ...data])
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchDashboardData = async (customerId) => {
        try {
            const response = await fetch(`${config.baseUrl}/customer/main-screen/${customerId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const data = await response.json()

            // Format shop data
            const formattedShops = data.map(shop => ({
                id: shop.branch_id,
                name: shop.shop_name,
                shopId: shop.shop_id,
                branchId: shop.branch_id,
                vendorId: shop.vendor_id,
                category: shop.shop_category_name,
                categoryId: shop.shopcategory_ID,
                rating: parseFloat(shop.avg_Rating).toFixed(1),
                distance: calculateDistance(shop.latitude, shop.longitude),
                image: shop.branch_picture,
                description: shop.shop_description,
                branchDescription: shop.branch_description,
                openingHours: shop.opening_hours,
                closingHours: shop.closing_hours,
                contact: shop.contact_number,
                reviews: shop.reviews_count
            }))

            setAllShops(formattedShops)
            setNearbyShops(formattedShops)
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setIsLoading(false)
        }
    }

    const navigateToBranch = (shopId, branchId, vendorId) => {
        navigate(`/customer/branch/${shopId}/${branchId}/${vendorId}`)
    }

    const filterShopsByCategory = (categoryId) => {
        setSelectedCategory(categoryId)

        if (categoryId === 'all') {
            setNearbyShops(allShops)
            return
        }

        const filtered = allShops.filter(
            shop => String(shop.categoryId) === String(categoryId)
        )

        setNearbyShops(filtered)
    }

    const handleSearch = (text) => {
        setSearchText(text)

        const filtered = allShops.filter(shop => 
            shop.name.toLowerCase().includes(text.toLowerCase()) ||
            shop.category.toLowerCase().includes(text.toLowerCase()) ||
            shop.description?.toLowerCase().includes(text.toLowerCase())
        )

        setNearbyShops(filtered)
    }

    // Helper function to calculate distance (placeholder)
    const calculateDistance = (lat, lng) => {
        // In a real app, you would calculate the actual distance between user's location and store
        // For now, we'll return a random distance
        return (Math.random() * 3).toFixed(1) + ' km'
    }

    const recentOrders = [
        {
            id: 'ORD-001',
            date: 'Coming soon',
            status: 'Available after first order',
            total: '--',
            items: []
        }
    ]

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Search and filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Search bar */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Search for shops..."
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Categories filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => filterShopsByCategory(category.id)}
                                className={`px-3 py-1 text-sm rounded-full ${selectedCategory === category.id
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shops Grid View */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold"></h2>
                    <button className=" text-sm font-medium hover:underline">View All</button>
                </div>

                {nearbyShops.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nearbyShops.map((shop) => (
                            <div 
                                key={shop.id}
                                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigateToBranch(shop.shopId, shop.branchId, shop.vendorId)}
                            >
                                <div className="h-40 overflow-hidden bg-gray-200">
                                    {shop.image ? (
                                        <img
                                            src={shop.image}
                                            alt={shop.name}
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <p className="text-gray-500">No image available</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{shop.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{shop.branchDescription}</p>
                                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-2">
                                                {shop.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-medium ml-1">{shop.rating}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{shop.distance}</span>
                                        {shop.reviews > 0 && (
                                            <span className="text-xs text-gray-500">({shop.reviews} reviews)</span>
                                        )}
                                    </div>
                                    <button 
                                        className="mt-3 w-full py-2 px-3 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigateToBranch(shop.shopId, shop.branchId, shop.vendorId);
                                        }}
                                    >
                                        View Shop
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No shops found</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard 