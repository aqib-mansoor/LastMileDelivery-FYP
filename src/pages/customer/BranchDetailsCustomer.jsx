import { useState, useEffect, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StarIcon, ClockIcon, MapPinIcon, PhoneIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import config from '../../api/config'
import { useCart } from '../../context/CartContext'

function useItemStocks(items, shopId, branchId, vendorId){
    const [stockData, setStockData] = useState({})
    const [isLoadingStocks, setIsLoadingStocks] = useState(false)

    useEffect(() => {
        const getItemStocks = async () => {
            if (!items || items.length === 0 || !shopId || !branchId || !vendorId) return

            setIsLoadingStocks(true)
            try {
                // Prepare the items array according to backend validation
                const itemsData = []
                
                items.forEach(item => {
                    if (item.variations && item.variations.length > 0) {
                        item.variations.forEach(variation => {
                            itemsData.push({
                                vendor_ID: parseInt(vendorId),
                                shop_ID: parseInt(shopId),
                                branch_ID: parseInt(branchId),
                                item_detail_ID: variation.id
                            })
                        })
                    }
                })

                if (itemsData.length === 0) return

                const response = await fetch(`${config.baseUrl}/customer/get-stock-for-items`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        items: itemsData
                    })
                })

                console.log("stocksResponse", response)
                
                if (response.ok) {
                    const data = await response.json()
                    console.log("item stocks", data)
                    setStockData(data)
                } else {
                    console.error('Failed to fetch stock data')
                }
            } catch (error) {
                console.error('Error fetching stock data:', error)
            } finally {
                setIsLoadingStocks(false)
            }
        }
        
        getItemStocks()
    }, [items, shopId, branchId, vendorId])

    return { stockData, isLoadingStocks }
}

function BranchDetailsCustomer() {
    const { shopId, branchId, vendorId } = useParams()
    const navigate = useNavigate()
    const { addToCart, isLoading: cartIsLoading } = useCart()
    const [branchDetails, setBranchDetails] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [itemCategories, setItemCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quantities, setQuantities] = useState({})
    const [selectedVariations, setSelectedVariations] = useState({})
    const [addingToCart, setAddingToCart] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [hideOutOfStock, setHideOutOfStock] = useState(true)
    
    const { stockData, isLoadingStocks } = useItemStocks(menuItems, shopId, branchId, vendorId)

    useEffect(() => {
        if (shopId && branchId && vendorId) {
            fetchBranchMenu()
        } else {
            setError('Missing required parameters')
            setIsLoading(false)
        }
    }, [shopId, branchId, vendorId])

    const fetchBranchMenu = async () => {
        try {
            const response = await fetch(`${config.baseUrl}/vendor/${vendorId}/shop/${shopId}/branch/${branchId}/menu`)

            if (!response.ok) {
                console.log("fetchBranchMenu", response)
                throw new Error('Failed to fetch branch menu')
            }

            const data = await response.json()

            // Handle empty response
            if (!data || data.length === 0) {
                setError('No menu items available for this branch')
                setIsLoading(false)
                return
            }

            // Extract branch details from the first item
            const firstItem = data[0]
            const branchInfo = {
                shop_name: firstItem.shop_name,
                shop_description: firstItem.shop_description,
                shop_category_name: firstItem.shop_category_name,
                branch_description: firstItem.branch_description,
                opening_hours: firstItem.opening_hours,
                closing_hours: firstItem.closing_hours,
                contact_number: firstItem.contact_number,
                branch_picture: firstItem.branch_picture,
                latitude: firstItem.latitude,
                longitude: firstItem.longitude,
                branch_status: firstItem.branch_status,
                branch_approval_status: firstItem.branch_approval_status,
                avg_Rating: 4.5, // This would need to be calculated or fetched
                reviews_count: 10, // This would need to be calculated or fetched
            }

            setBranchDetails(branchInfo)

            // Process menu items
            const processedItems = processMenuItems(data)
            setMenuItems(processedItems.items)
            setItemCategories([
                { id: 'all', name: 'All' },
                ...processedItems.categories
            ])

            // Initialize quantities and selected variations
            const initialQuantities = {}
            const initialVariations = {}

            processedItems.items.forEach(item => {
                initialQuantities[item.id] = 1
                if (item.variations && item.variations.length > 0) {
                    initialVariations[item.id] = item.variations[0].id
                }
            })

            setQuantities(initialQuantities)
            setSelectedVariations(initialVariations)

            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching branch menu:', error)
            setError('Could not load branch menu')
            setIsLoading(false)
        }
    }

    // Process and organize menu items and categories
    const processMenuItems = (data) => {
        const items = []
        const categoriesMap = new Map()

        // Group by item_id to handle variations and attributes
        const itemsMap = new Map()

        data.forEach(item => {
            if (!item.item_id) return // Skip items without ID

            // Add category to map if it doesn't exist
            if (item.item_category_name && !categoriesMap.has(item.category_ID)) {
                categoriesMap.set(item.category_ID, {
                    id: item.category_ID,
                    name: item.item_category_name
                })
            }

            // Create or update item in the map
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
                    attributes: [],
                    image: null // Default, will be updated if variations have pictures
                })
            }

            // Add variation if it exists
            if (item.item_detail_id) {
                const currentItem = itemsMap.get(item.item_id)

                // Check if variation already exists
                const existingVariation = currentItem.variations.find(v => v.id === item.item_detail_id)

                if (!existingVariation) {
                    const variation = {
                        id: item.item_detail_id,
                        name: item.variation_name || "Standard",
                        price: item.item_detail_price || item.price,
                        preparation_time: item.preparation_time,
                        timesensitive: item.timesensitive,
                        picture: item.picture,
                        additional_info: item.additional_info,
                        attributes: []
                    }

                    // If variation has a picture, update the item's image
                    if (item.picture) {
                        currentItem.image = item.picture
                    }

                    currentItem.variations.push(variation)
                }

                // Add attribute if it exists
                if (item.attribute_id) {
                    const variationIndex = currentItem.variations.findIndex(v => v.id === item.item_detail_id)

                    if (variationIndex >= 0) {
                        currentItem.variations[variationIndex].attributes.push({
                            id: item.attribute_id,
                            key: item.attribute_key,
                            value: item.attribute_value
                        })
                    }
                }
            }
        })

        // Convert items map to array
        itemsMap.forEach(item => {
            // If no variations, create a default one - our API requires itemdetails_id
            if (item.variations.length === 0) {
                // For logging purposes only
                console.warn(`Item ${item.id} (${item.name}) has no variations, creating default`)

                // Create a default variation using the item's ID + 1000 as a makeshift itemdetail_id
                // This assumes itemdetail_id exists in the backend matching this pattern
                item.variations.push({
                    id: item.id, // In a real app, this should be an actual itemdetails_id from backend
                    name: "Standard",
                    price: item.price,
                    preparation_time: "10-15 mins",
                    timesensitive: "No",
                    picture: item.itemPicture,
                    attributes: []
                })
            }

            // Use the first variation's price as the default if available
            if (item.variations.length > 0 && !item.price) {
                item.price = item.variations[0].price
            }

            items.push(item)
        })

        // Convert categories map to array
        const categories = Array.from(categoriesMap.values())

        return { items, categories }
    }

    const filterItemsByCategory = (categoryId) => {
        setSelectedCategory(categoryId)
    }

    const getFilteredItems = () => {
        if (selectedCategory === 'all') {
            return menuItems
        }

        return menuItems.filter(item => String(item.category_id) === String(selectedCategory))
    }

    const handleQuantityChange = (itemId, delta) => {
        setQuantities(prev => {
            const newQuantity = Math.max(1, (prev[itemId] || 1) + delta)
            return { ...prev, [itemId]: newQuantity }
        })
    }

    const handleVariationChange = (itemId, variationId) => {
        setSelectedVariations(prev => ({
            ...prev,
            [itemId]: variationId
        }))
    }

    const getSelectedVariation = (item) => {
        if (!item.variations || item.variations.length === 0) {
            return null
        }

        const selectedId = selectedVariations[item.id]
        return item.variations.find(v => v.id === selectedId) || item.variations[0]
    }

    const openAddToCartModal = (item) => {
        setSelectedItem(item)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setSelectedItem(null)
    }

    const handleAddToCart = async () => {
        if (!selectedItem) return

        setAddingToCart(true)

        try {
            const variation = getSelectedVariation(selectedItem)

            // If there's no variation, we can't add to cart because itemdetails_id is required
            if (!variation) {
                console.error('No item variation found')
                return
            }

            const itemToAdd = {
                vendorId: parseInt(vendorId),
                shopId: parseInt(shopId),
                branchId: parseInt(branchId),
                itemDetailId: variation.id, // This must be itemdetails_id
                quantity: quantities[selectedItem.id] || 1,
                price: variation.price || selectedItem.price
            }

            console.log('Adding to cart:', itemToAdd)

            const success = await addToCart(itemToAdd)

            if (success) {
                // Reset quantity after adding to cart
                setQuantities(prev => ({
                    ...prev,
                    [selectedItem.id]: 1
                }))
                closeModal()
            }
        } catch (error) {
            console.error('Error adding item to cart:', error)
        } finally {
            setAddingToCart(false)
        }
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <button 
                    onClick={() => navigate('/customer/dashboard')}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
                >
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <Fragment>
            <div className="max-w-7xl mx-auto">
                {/* Branch Header */}
                {branchDetails && (
                    <div className="mb-8">
                        <div className="h-48 w-full bg-gray-200 rounded-lg overflow-hidden">
                            {branchDetails.branch_picture ? (
                                <img
                                    src={branchDetails.branch_picture}
                                    alt={branchDetails.shop_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-gray-500">No image available</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <h1 className="text-2xl font-bold">{branchDetails.shop_name}</h1>
                            <p className="text-gray-600 mt-1">{branchDetails.branch_description}</p>

                            <div className="flex flex-wrap gap-4 mt-4">
                                <div className="flex items-center text-gray-600">
                                    <StarIcon className="h-5 w-5 mr-1" />
                                    <span>{branchDetails.avg_Rating} ({branchDetails.reviews_count} reviews)</span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                    <ClockIcon className="h-5 w-5 mr-1" />
                                    <span>{branchDetails.opening_hours} - {branchDetails.closing_hours}</span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                    <PhoneIcon className="h-5 w-5 mr-1" />
                                    <span>{branchDetails.contact_number}</span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                    <MapPinIcon className="h-5 w-5 mr-1" />
                                    <span>Branch Location</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Filter */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Menu</h2>
                    <div className="flex flex-wrap gap-2">
                        {itemCategories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => filterItemsByCategory(category.id)}
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

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {getFilteredItems().length > 0 ? (
                        getFilteredItems().map(item => (
                            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-40 bg-gray-200">
                                    {item.itemPicture ? (
                                        <img
                                            src={item.itemPicture}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <p className="text-gray-500">No image</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between mb-2">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <span className="font-medium text-primary">
                                            Rs.{item.variations && item.variations.length > 0
                                                ? item.variations[0].price
                                                : item.price}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                                    {/* Stock Information */}
                                    {!hideOutOfStock && (
                                        <div className="mb-3">
                                            {(() => {
                                                if (isLoadingStocks) {
                                                    return (
                                                        <div className="text-xs text-gray-500">
                                                            <span>Stock: Loading...</span>
                                                        </div>
                                                    )
                                                }

                                                if (item.variations && item.variations.length > 0) {
                                                    const firstVariation = item.variations[0]
                                                    const stockInfo = stockData?.data?.find(stock => stock.item_detail_ID === firstVariation.id)
                                                    
                                                    return (
                                                        <div className="text-xs">
                                                            <span className="text-gray-500">Stock: </span>
                                                            {stockInfo ? (
                                                                stockInfo.error ? (
                                                                    <span className="text-red-500">Out of Stock</span>
                                                                ) : stockInfo.stock_qty !== null ? (
                                                                    <span className={`font-medium ${
                                                                        stockInfo.stock_qty > 10 ? 'text-green-600' : 
                                                                        stockInfo.stock_qty > 0 ? 'text-yellow-600' : 
                                                                        'text-red-600'
                                                                    }`}>
                                                                        {stockInfo.stock_qty > 0 ? `${stockInfo.stock_qty} available` : 'Out of Stock'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-500">N/A</span>
                                                                )
                                                            ) : (
                                                                <span className="text-gray-500">Not available</span>
                                                            )}
                                                        </div>
                                                    )
                                                }
                                                return null
                                            })()}
                                        </div>
                                    )}

                                    {item.variations && item.variations.length > 1 && (
                                        <div className="text-xs text-gray-500 mb-3">
                                            Available in {item.variations.length} variations
                                        </div>
                                    )}

                                    {(() => {
                                        if (item.variations && item.variations.length > 0) {
                                            const firstVariation = item.variations[0]
                                            const stockInfo = stockData?.data?.find(stock => stock.item_detail_ID === firstVariation.id)
                                            const isOutOfStock = hideOutOfStock ? false : (stockInfo && (stockInfo.error || stockInfo.stock_qty === 0))
                                            
                                            return (
                                                <button 
                                                    className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                    onClick={() => openAddToCartModal(item)}
                                                    disabled={isOutOfStock}
                                                >
                                                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                                </button>
                                            )
                                        }
                                        
                                        return (
                                            <button 
                                                className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                                                onClick={() => openAddToCartModal(item)}
                                            >
                                                Add to Cart
                                            </button>
                                        )
                                    })()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">No items found in this category</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add to Cart Modal */}
            {modalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>

                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="flex justify-between items-center px-6 py-4 border-b">
                                <h3 className="text-lg font-medium">Add to Cart</h3>
                                <button
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={closeModal}
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex mb-4">
                                    <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden mr-4 flex-shrink-0">
                                        {selectedItem.itemPicture ? (
                                            <img
                                                src={selectedItem.itemPicture}
                                                alt={selectedItem.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <p className="text-gray-500 text-xs">No image</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{selectedItem.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>
                                    </div>
                                </div>

                                {/* Variations Section */}
                                {selectedItem.variations && selectedItem.variations.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Choose Variation
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md py-2 px-3"
                                            value={selectedVariations[selectedItem.id] || (selectedItem.variations[0]?.id || '')}
                                            onChange={(e) => handleVariationChange(selectedItem.id, parseInt(e.target.value))}
                                        >
                                            {selectedItem.variations.map(variation => {
                                                const stockInfo = stockData?.data?.find(stock => stock.item_detail_ID === variation.id)
                                                const stockText = hideOutOfStock ? '' : (stockInfo ? (
                                                    stockInfo.error ? ' (Out of Stock)' :
                                                    stockInfo.stock_qty !== null ? ` (${stockInfo.stock_qty} available)` : ''
                                                ) : '')
                                                
                                                return (
                                                    <option key={variation.id} value={variation.id}>
                                                        {variation.name} - Rs.{variation.price}{stockText}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                        
                                        {/* Stock status for selected variation */}
                                        {!hideOutOfStock && (() => {
                                            const selectedVariation = getSelectedVariation(selectedItem)
                                            if (!selectedVariation) return null
                                            
                                            const stockInfo = stockData?.data?.find(stock => stock.item_detail_ID === selectedVariation.id)
                                            
                                            if (isLoadingStocks) {
                                                return <div className="mt-2 text-sm text-gray-500">Loading stock information...</div>
                                            }
                                            
                                            if (stockInfo) {
                                                if (stockInfo.error) {
                                                    return <div className="mt-2 text-sm text-red-600">⚠️ This item is currently out of stock</div>
                                                } else if (stockInfo.stock_qty !== null) {
                                                    if (stockInfo.stock_qty === 0) {
                                                        return <div className="mt-2 text-sm text-red-600">⚠️ This item is currently out of stock</div>
                                                    } else if (stockInfo.stock_qty <= 5) {
                                                        return <div className="mt-2 text-sm text-yellow-600">⚠️ Only {stockInfo.stock_qty} left in stock</div>
                                                    } else {
                                                        return <div className="mt-2 text-sm text-green-600">✓ {stockInfo.stock_qty} available</div>
                                                    }
                                                }
                                            }
                                            return null
                                        })()}
                                    </div>
                                )}

                                {/* Quantity Section */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <div className="flex items-center">
                                        {(() => {
                                            const selectedVariation = getSelectedVariation(selectedItem)
                                            const stockInfo = stockData?.data?.find(stock => stock.item_detail_ID === selectedVariation?.id)
                                            const maxStock = hideOutOfStock ? 999 : (stockInfo && !stockInfo.error && stockInfo.stock_qty !== null ? stockInfo.stock_qty : 999)
                                            const isOutOfStock = hideOutOfStock ? false : (stockInfo && (stockInfo.error || stockInfo.stock_qty === 0))
                                            
                                            return (
                                                <>
                                                    <button
                                                        onClick={() => handleQuantityChange(selectedItem.id, -1)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-l-md border border-gray-300 disabled:opacity-50"
                                                        disabled={quantities[selectedItem.id] <= 1 || isOutOfStock}
                                                    >
                                                        <MinusIcon className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 py-2 border-t border-b border-gray-300 text-center min-w-[50px]">
                                                        {quantities[selectedItem.id] || 1}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(selectedItem.id, 1)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-r-md border border-gray-300 disabled:opacity-50"
                                                        disabled={(quantities[selectedItem.id] || 1) >= maxStock || isOutOfStock}
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                    </button>
                                                    
                                                    {!hideOutOfStock && maxStock < 999 && !isOutOfStock && (
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            (Max: {maxStock})
                                                        </span>
                                                    )}
                                                </>
                                            )
                                        })()}

                                        <div className="ml-auto text-right">
                                            <span className="block text-sm font-medium text-gray-700">Total:</span>
                                            <span className="text-lg font-semibold text-primary">
                                                Rs.{((getSelectedVariation(selectedItem)?.price || selectedItem.price) * (quantities[selectedItem.id] || 1)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {(() => {
                                    const selectedVariation = getSelectedVariation(selectedItem)
                                    const stockInfo = stockData?.data?.find(stock => stock.item_detail_ID === selectedVariation?.id)
                                    const isOutOfStock = hideOutOfStock ? false : (stockInfo && (stockInfo.error || stockInfo.stock_qty === 0))
                                    const isDisabled = addingToCart || isOutOfStock
                                    
                                    return (
                                        <button
                                            className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            onClick={handleAddToCart}
                                            disabled={isDisabled}
                                        >
                                            {addingToCart ? (
                                                <>
                                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                                    Adding to Cart...
                                                </>
                                            ) : isOutOfStock ? (
                                                'Out of Stock'
                                            ) : (
                                                'Add to Cart'
                                            )}
                                        </button>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    )
}

export default BranchDetailsCustomer 