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
import ProductCard from '../../components/ProductCard'

function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [nearbyShops, setNearbyShops] = useState([])
    const [allShops, setAllShops] = useState([])
    const [allMenuItems, setAllMenuItems] = useState([])
    const [matchingProducts, setMatchingProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchText, setSearchText] = useState('')
    const [customerFullData, setCustomerFullData] = useState(null)
    const [isLoadingMenus, setIsLoadingMenus] = useState(false)
    const [viewMode, setViewMode] = useState('shops') // 'shops' or 'products'
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

    // Apply filters whenever search text or category changes
    useEffect(() => {
        applyFilters()
    }, [searchText, selectedCategory, allShops, allMenuItems])

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

            console.log("dashboard data", data)

            // Format shop data based on the actual API response structure
            const formattedShops = data.map(shop => ({
                id: shop.branch_id,
                name: shop.shop_name,
                shopId: shop.shop_id,
                branchId: shop.branch_id,
                vendorId: shop.vendor_id,
                category: shop.shop_category_name,
                categoryId: shop.shopcategory_ID,
                rating: parseFloat(shop.avg_Rating || 0).toFixed(1),
                distance: calculateDistance(shop.latitude, shop.longitude),
                image: shop.branch_picture,
                description: shop.shop_description,
                branchDescription: shop.branch_description,
                openingHours: shop.opening_hours,
                closingHours: shop.closing_hours,
                contact: shop.contact_number,
                reviews: shop.reviews_count || 0,
                vendorType: shop.vendor_type,
                latitude: shop.latitude,
                longitude: shop.longitude,
                branchStatus: shop.branch_status,
                approvalStatus: shop.approval_status
            }))

            setAllShops(formattedShops)
            
            // Fetch menu items for all shops
            fetchAllMenuItems(formattedShops)
            
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setIsLoading(false)
        }
    }

    const fetchAllMenuItems = async (shops) => {
        setIsLoadingMenus(true)
        try {
            const menuPromises = shops.map(shop => 
                fetchShopMenu(shop.vendorId, shop.shopId, shop.branchId)
                    .then(menuItems => ({ shop, menuItems }))
                    .catch(error => {
                        console.error(`Error fetching menu for shop ${shop.name}:`, error)
                        return { shop, menuItems: [] }
                    })
            )

            const menuResults = await Promise.all(menuPromises)
            
            // Flatten all menu items with shop information
            const allItems = []
            menuResults.forEach(({ shop, menuItems }) => {
                menuItems.forEach(item => {
                    allItems.push({
                        ...item,
                        shopInfo: shop
                    })
                })
            })

            setAllMenuItems(allItems)
        } catch (error) {
            console.error('Error fetching menu items:', error)
        } finally {
            setIsLoadingMenus(false)
        }
    }

    const fetchShopMenu = async (vendorId, shopId, branchId) => {
        try {
            const response = await fetch(`${config.baseUrl}/vendor/${vendorId}/shop/${shopId}/branch/${branchId}/menu`)
            
            if (!response.ok) {
                console.error("fetchShopMenu", response)
                throw new Error('Failed to fetch menu')
            }

            const data = await response.json()
            
            if (!data || data.length === 0) {
                return []
            }

            // Process menu items similar to BranchDetailsCustomer
            return processMenuItems(data)
        } catch (error) {
            console.error('Error fetching shop menu:', error)
            return []
        }
    }

    const processMenuItems = (data) => {
        const items = []
        const itemsMap = new Map()

        data.forEach(item => {
            if (!item.item_id) return

            if (!itemsMap.has(item.item_id)) {
                itemsMap.set(item.item_id, {
                    id: item.item_id,
                    name: item.item_name,
                    itemPicture: item.itemPicture,
                    price: item.price,
                    description: item.item_description,
                    category_id: item.category_ID,
                    category_name: item.item_category_name,
                    variations: [],
                    image: null
                })
            }

            if (item.item_detail_id) {
                const currentItem = itemsMap.get(item.item_id)
                const existingVariation = currentItem.variations.find(v => v.id === item.item_detail_id)

                if (!existingVariation) {
                    const variation = {
                        id: item.item_detail_id,
                        name: item.variation_name || "Standard",
                        price: item.item_detail_price || item.price,
                        preparation_time: item.preparation_time,
                        picture: item.picture,
                        additional_info: item.additional_info
                    }

                    if (item.picture) {
                        currentItem.image = item.picture
                    }

                    currentItem.variations.push(variation)
                }
            }
        })

        itemsMap.forEach(item => {
            if (item.variations.length === 0) {
                item.variations.push({
                    id: item.id,
                    name: "Standard",
                    price: item.price,
                    picture: item.itemPicture
                })
            }

            if (item.variations.length > 0 && !item.price) {
                item.price = item.variations[0].price
            }

            items.push(item)
        })

        return items
    }

    const navigateToBranch = (shopId, branchId, vendorId) => {
        navigate(`/customer/branch/${shopId}/${branchId}/${vendorId}`)
    }

    const handleShopClick = (shopInfo) => {
        navigateToBranch(shopInfo.shopId, shopInfo.branchId, shopInfo.vendorId)
    }

    const filterShopsByCategory = (categoryId) => {
        setSelectedCategory(categoryId)
    }

    const handleSearch = (text) => {
        setSearchText(text)
    }

    const applyFilters = () => {
        if (!searchText.trim() && selectedCategory === 'all') {
            // Show all shops when no search or filter is applied
            setNearbyShops(allShops)
            setMatchingProducts([])
            setViewMode('shops')
            return
        }

        if (searchText.trim()) {
            // Search through menu items
            const searchLower = searchText.toLowerCase().trim()
            const matchingItems = allMenuItems.filter(item => 
                item.name.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower) ||
                item.category_name?.toLowerCase().includes(searchLower) ||
                item.variations?.some(variation => 
                    variation.name.toLowerCase().includes(searchLower)
                )
            )

            // Apply category filter to matching items
            const filteredItems = selectedCategory !== 'all' 
                ? matchingItems.filter(item => 
                    String(item.shopInfo.categoryId) === String(selectedCategory)
                )
                : matchingItems

            setMatchingProducts(filteredItems)

            // Group matching items by shop
            const shopsWithItems = new Map()
            filteredItems.forEach(item => {
                const shopKey = `${item.shopInfo.vendorId}-${item.shopInfo.shopId}-${item.shopInfo.branchId}`
                if (!shopsWithItems.has(shopKey)) {
                    shopsWithItems.set(shopKey, {
                        ...item.shopInfo,
                        matchingItems: []
                    })
                }
                shopsWithItems.get(shopKey).matchingItems.push(item)
            })

            setNearbyShops(Array.from(shopsWithItems.values()))
            setViewMode('products')
        } else {
            // Only category filter is applied
            const filtered = allShops.filter(
                shop => String(shop.categoryId) === String(selectedCategory)
            )
            setNearbyShops(filtered)
            setMatchingProducts([])
            setViewMode('shops')
        }
    }

    // Helper function to calculate distance (placeholder)
    const calculateDistance = (lat, lng) => {
        // In a real app, you would calculate the actual distance between user's location and store
        // For now, we'll return a random distance
        return (Math.random() * 3).toFixed(1) + ' km'
    }

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
                            placeholder="Search for products, items, or food..."
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {isLoadingMenus && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Categories filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => filterShopsByCategory(category.id)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedCategory === category.id
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View mode toggle for search results */}
                {searchText.trim() && matchingProducts.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setViewMode('products')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${viewMode === 'products'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Products ({matchingProducts.length})
                        </button>
                        <button
                            onClick={() => setViewMode('shops')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${viewMode === 'shops'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Shops ({nearbyShops.length})
                        </button>
                    </div>
                )}

                {/* Search results summary */}
                {searchText.trim() && (
                    <div className="text-sm text-gray-600 mb-2">
                        {matchingProducts.length} product{matchingProducts.length !== 1 ? 's' : ''} found matching "{searchText}" 
                        in {nearbyShops.length} shop{nearbyShops.length !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Category filter summary */}
                {selectedCategory !== 'all' && !searchText.trim() && (
                    <div className="text-sm text-gray-600 mb-2">
                        Showing {nearbyShops.length} shop{nearbyShops.length !== 1 ? 's' : ''} in {categories.find(c => c.id === selectedCategory)?.name} category
                    </div>
                )}

                {/* Loading indicator */}
                {isLoadingMenus && (
                    <div className="text-sm text-blue-600 mb-2">
                        Loading menu items for better search results...
                    </div>
                )}
            </div>

            {/* Products Grid View (when searching) */}
            {viewMode === 'products' && matchingProducts.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Matching Products</h2>
                        <span className="text-sm text-gray-500">{matchingProducts.length} products found</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matchingProducts.map((item) => (
                            <ProductCard
                                key={`${item.shopInfo.vendorId}-${item.shopInfo.shopId}-${item.shopInfo.branchId}-${item.id}`}
                                item={item}
                                shopInfo={item.shopInfo}
                                showShopInfo={true}
                                onShopClick={handleShopClick}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Shops Grid View */}
            {(viewMode === 'shops' || !searchText.trim()) && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                            {searchText.trim() ? 'Shops with Matching Products' : 
                             selectedCategory !== 'all' ? `${categories.find(c => c.id === selectedCategory)?.name} Shops` : 
                             'Available Shops'}
                        </h2>
                        {!searchText.trim() && selectedCategory === 'all' && (
                            <button className="text-primary text-sm font-medium hover:underline">View All</button>
                        )}
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
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{shop.branchDescription}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                        {shop.category}
                                                    </span>
                                                    {shop.vendorType && (
                                                        <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                                                            {shop.vendorType}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-medium ml-1">{shop.rating}</span>
                                            </div>
                                        </div>

                                        {/* Show matching items if it's a search result */}
                                        {shop.matchingItems && shop.matchingItems.length > 0 && (
                                            <div className="mt-3 p-2 bg-green-50 rounded-md">
                                                <p className="text-xs text-green-700 font-medium mb-1">
                                                    {shop.matchingItems.length} matching product{shop.matchingItems.length !== 1 ? 's' : ''}:
                                                </p>
                                                <div className="text-xs text-green-600">
                                                    {shop.matchingItems.slice(0, 3).map(item => item.name).join(', ')}
                                                    {shop.matchingItems.length > 3 && ` +${shop.matchingItems.length - 3} more`}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                            <span>{shop.distance}</span>
                                            <span>{shop.openingHours} - {shop.closingHours}</span>
                                            {shop.reviews > 0 && (
                                                <span>({shop.reviews} reviews)</span>
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
                            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">
                                {searchText.trim() ? 'No products found' : 'No shops available'}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {searchText.trim() 
                                    ? `Try searching for different product names or browse all categories`
                                    : 'Check back later for available shops in your area'
                                }
                            </p>
                            {(searchText.trim() || selectedCategory !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchText('')
                                        setSelectedCategory('all')
                                    }}
                                    className="mt-4 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Dashboard 