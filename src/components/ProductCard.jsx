import { useState, useEffect } from 'react'
import { StarIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '../context/CartContext'
import config from '../api/config'

function ProductCard({ 
    item, 
    shopInfo, 
    showShopInfo = false,
    onShopClick = null,
    className = "",
    hideOutOfStock = true
}) {
    const { addToCart } = useCart()
    const [quantities, setQuantities] = useState({})
    const [selectedVariations, setSelectedVariations] = useState({})
    const [stockData, setStockData] = useState({})
    const [isLoadingStock, setIsLoadingStock] = useState(false)
    const [addingToCart, setAddingToCart] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        // Initialize quantities and selected variations
        const initialQuantities = {}
        const initialVariations = {}

        initialQuantities[item.id] = 1
        if (item.variations && item.variations.length > 0) {
            initialVariations[item.id] = item.variations[0].id
        }

        setQuantities(initialQuantities)
        setSelectedVariations(initialVariations)

        // Fetch stock data
        if (shopInfo && item.variations && item.variations.length > 0) {
            fetchStockData()
        }
    }, [item, shopInfo])

    const fetchStockData = async () => {
        if (!shopInfo || !item.variations || item.variations.length === 0) return

        setIsLoadingStock(true)
        try {
            const itemsData = item.variations.map(variation => ({
                vendor_ID: parseInt(shopInfo.vendorId),
                shop_ID: parseInt(shopInfo.shopId),
                branch_ID: parseInt(shopInfo.branchId),
                item_detail_ID: variation.id
            }))

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

            if (response.ok) {
                const data = await response.json()
                setStockData(data)
            }
        } catch (error) {
            console.error('Error fetching stock data:', error)
        } finally {
            setIsLoadingStock(false)
        }
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

    const getStockInfo = (variationId) => {
        return stockData?.data?.find(stock => stock.item_detail_ID === variationId)
    }

    const isOutOfStock = (variationId) => {
        const stockInfo = getStockInfo(variationId)
        return stockInfo && (stockInfo.error || stockInfo.stock_qty === 0)
    }

    const openAddToCartModal = () => {
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
    }

    const handleAddToCart = async () => {
        if (!shopInfo) return

        setAddingToCart(true)

        try {
            const variation = getSelectedVariation(item)

            if (!variation) {
                console.error('No item variation found')
                return
            }

            const itemToAdd = {
                vendorId: parseInt(shopInfo.vendorId),
                shopId: parseInt(shopInfo.shopId),
                branchId: parseInt(shopInfo.branchId),
                itemDetailId: variation.id,
                quantity: quantities[item.id] || 1,
                price: variation.price || item.price
            }

            const success = await addToCart(itemToAdd)

            if (success) {
                setQuantities(prev => ({
                    ...prev,
                    [item.id]: 1
                }))
                closeModal()
            }
        } catch (error) {
            console.error('Error adding item to cart:', error)
        } finally {
            setAddingToCart(false)
        }
    }

    const selectedVariation = getSelectedVariation(item)
    const stockInfo = selectedVariation ? getStockInfo(selectedVariation.id) : null
    const outOfStock = hideOutOfStock ? false : (selectedVariation ? isOutOfStock(selectedVariation.id) : false)

    const getStockColorClass = (stockQty) => {
        if (stockQty > 10) return 'text-green-600'
        if (stockQty > 0) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <>
            <div className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
                <div className="h-40 bg-gray-200">
                    {item.itemPicture || item.image ? (
                        <img
                            src={item.itemPicture || item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-gray-500 text-xs">No image</p>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    {/* Shop info header */}
                    {showShopInfo && shopInfo && (
                        <div className="mb-3 pb-2 border-b border-gray-100">
                            <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => onShopClick && onShopClick(shopInfo)}
                            >
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">{shopInfo.name}</h4>
                                    <p className="text-xs text-gray-500">{shopInfo.branchDescription}</p>
                                </div>
                                <div className="flex items-center">
                                    <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                                    <span className="text-xs ml-1">{shopInfo.rating}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product info */}
                    <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <span className="font-medium text-primary">
                            Rs.{selectedVariation ? selectedVariation.price : item.price}
                        </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                    {/* Stock Information */}
                    {!hideOutOfStock && (
                        <div className="mb-3">
                            {isLoadingStock ? (
                                <div className="text-xs text-gray-500">
                                    <span>Stock: Loading...</span>
                                </div>
                            ) : stockInfo ? (
                                <div className="text-xs">
                                    <span className="text-gray-500">Stock: </span>
                                    {stockInfo.error ? (
                                        <span className="text-red-500">Out of Stock</span>
                                    ) : stockInfo.stock_qty !== null ? (
                                        <span className={`font-medium ${getStockColorClass(stockInfo.stock_qty)}`}>
                                            {stockInfo.stock_qty > 0 ? `${stockInfo.stock_qty} available` : 'Out of Stock'}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500">Stock: Not available</div>
                            )}
                        </div>
                    )}

                    {/* Variations info */}
                    {item.variations && item.variations.length > 1 && (
                        <div className="text-xs text-gray-500 mb-3">
                            Available in {item.variations.length} variations
                        </div>
                    )}

                    {/* Add to cart button */}
                    <button 
                        className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                        onClick={openAddToCartModal}
                        disabled={outOfStock}
                    >
                        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            {/* Add to Cart Modal */}
            {modalOpen && (
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
                                {/* Shop info in modal */}
                                {showShopInfo && shopInfo && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                        <h4 className="font-medium text-gray-900">{shopInfo.name}</h4>
                                        <p className="text-sm text-gray-600">{shopInfo.branchDescription}</p>
                                    </div>
                                )}

                                {/* Product info */}
                                <div className="flex mb-4">
                                    <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden mr-4 flex-shrink-0">
                                        {item.itemPicture || item.image ? (
                                            <img
                                                src={item.itemPicture || item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <p className="text-gray-500 text-xs">No image</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    </div>
                                </div>

                                {/* Variations Section */}
                                {item.variations && item.variations.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Choose Variation
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md py-2 px-3"
                                            value={selectedVariations[item.id] || (item.variations[0]?.id || '')}
                                            onChange={(e) => handleVariationChange(item.id, parseInt(e.target.value))}
                                        >
                                            {item.variations.map(variation => {
                                                const stockInfo = getStockInfo(variation.id)
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
                                            const selectedVariation = getSelectedVariation(item)
                                            if (!selectedVariation) return null
                                            
                                            const stockInfo = getStockInfo(selectedVariation.id)
                                            
                                            if (isLoadingStock) {
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
                                            const selectedVariation = getSelectedVariation(item)
                                            const stockInfo = getStockInfo(selectedVariation?.id)
                                            const maxStock = hideOutOfStock ? 999 : (stockInfo && !stockInfo.error && stockInfo.stock_qty !== null ? stockInfo.stock_qty : 999)
                                            const isOutOfStock = hideOutOfStock ? false : (stockInfo && (stockInfo.error || stockInfo.stock_qty === 0))
                                            
                                            return (
                                                <>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, -1)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-l-md border border-gray-300 disabled:opacity-50"
                                                        disabled={quantities[item.id] <= 1 || isOutOfStock}
                                                    >
                                                        <MinusIcon className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 py-2 border-t border-b border-gray-300 text-center min-w-[50px]">
                                                        {quantities[item.id] || 1}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, 1)}
                                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-r-md border border-gray-300 disabled:opacity-50"
                                                        disabled={(quantities[item.id] || 1) >= maxStock || isOutOfStock}
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
                                                Rs.{((getSelectedVariation(item)?.price || item.price) * (quantities[item.id] || 1)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Add to cart button */}
                                <button
                                    className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || outOfStock}
                                >
                                    {addingToCart ? (
                                        <>
                                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                            Adding to Cart...
                                        </>
                                    ) : outOfStock ? (
                                        'Out of Stock'
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProductCard 