import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import config from '../../api/config'

function Cart() {
    const {
        cartItems,
        cartTotal,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        isLoading,
        error
    } = useCart()
    const [groupedItems, setGroupedItems] = useState({})
    const navigate = useNavigate()
    const [isRemoving, setIsRemoving] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const [quantityChanging, setQuantityChanging] = useState({})

    useEffect(() => {
        // Group items by shop/branch
        const grouped = cartItems.reduce((acc, item) => {
            const key = `${item.vendor_id}_${item.shop_id}_${item.branch_id}`
            if (!acc[key]) {
                acc[key] = {
                    vendor_id: item.vendor_id,
                    shop_id: item.shop_id,
                    branch_id: item.branch_id,
                    shop_name: item.shop_name || 'Shop',
                    items: []
                }
            }
          acc[key].items.push(item)
          return acc
      }, {})

        setGroupedItems(grouped)
    }, [cartItems])

    const handleRemoveItem = async (itemId) => {
        setIsRemoving(true)
        await removeFromCart(itemId)
        setIsRemoving(false)
    }

    const handleIncreaseQuantity = async (itemId) => {
        setQuantityChanging(prev => ({ ...prev, [itemId]: true }))
        await increaseQuantity(itemId)
        setQuantityChanging(prev => ({ ...prev, [itemId]: false }))
    }

    const handleDecreaseQuantity = async (itemId) => {
        setQuantityChanging(prev => ({ ...prev, [itemId]: true }))
        await decreaseQuantity(itemId)
        setQuantityChanging(prev => ({ ...prev, [itemId]: false }))
    }

    const handleClearCart = async () => {
        setIsClearing(true)
        await clearCart()
        setIsClearing(false)
    }

    const handleCheckout = () => {
        navigate('/customer/checkout')
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (error) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
            </div>
        </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-lg mb-4">Your cart is empty</p>
                    <button 
                        onClick={() => navigate('/customer/dashboard')}
                        className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    {Object.values(groupedItems).map((group, groupIndex) => (
                        <div key={groupIndex} className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">{group.shop_name || 'Shop'}</h2>

                            <div className="divide-y">
                                {group.items.map((item) => (
                                    <div key={item.id} className="py-3 sm:py-4 flex items-center flex-col sm:flex-row text-sm sm:text-base">
                                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-0">
                                            {item.itemPicture ? (
                                                <img
                                                    src={item.itemPicture}
                                                    alt={item.item_name} 
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-gray-500 text-xs">No image</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="sm:ml-4 flex-grow w-full sm:w-auto text-center sm:text-left">
                                            <h3 className="font-medium">{item.item_name}</h3>
                                            {item.variation_name && (
                                                <p className="text-xs sm:text-sm text-gray-600">Variation: {item.variation_name}</p>
                                            )}
                                            <div className="mt-1 flex flex-col sm:flex-row sm:justify-between items-center sm:items-start">
                                                <div className="flex flex-col items-center sm:items-start">
                                                    <span className="text-gray-700 mb-2">PKR {parseFloat(`${item.price}`).toFixed(2)} each</span>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleDecreaseQuantity(item.id)}
                                                            disabled={quantityChanging[item.id] || item.quantity <= 1}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <MinusIcon className="h-4 w-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleIncreaseQuantity(item.id)}
                                                            disabled={quantityChanging[item.id]}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <PlusIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="font-semibold mt-1 sm:mt-0">PKR {(item.price * item.quantity).toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={isRemoving}
                                            className="sm:ml-4 mt-2 sm:mt-0 text-gray-500 hover:text-red-500 disabled:opacity-50"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1 order-first lg:order-none">
                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 sticky top-6 w-full max-w-full">
                        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Order Summary</h2>

                        <div className="space-y-2 mb-3 sm:mb-4 text-sm sm:text-base">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>PKR {cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>PKR {config.deliveryFee}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                                <span>Total</span>
                                <span>PKR {(cartTotal + config.deliveryFee)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleClearCart}
                            disabled={isLoading || isClearing || cartItems.length === 0}
                            className="w-full mb-2 sm:mb-3 bg-red-500 text-white py-2 sm:py-2.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            {isClearing ? 'Clearing...' : 'Clear Cart'}
                        </button>

                        <button
                            onClick={handleCheckout}
                            disabled={isLoading || cartItems.length === 0}
                            className="w-full bg-primary text-white py-2.5 sm:py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart 