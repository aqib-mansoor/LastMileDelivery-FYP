import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { XMarkIcon } from '@heroicons/react/24/outline'

function Cart() {
    const {
        cartItems,
        cartTotal,
        removeFromCart,
        clearCart,
        isLoading,
        error
    } = useCart()
    const [groupedItems, setGroupedItems] = useState({})
    const navigate = useNavigate()
    const [isRemoving, setIsRemoving] = useState(false)
    const [isClearing, setIsClearing] = useState(false)

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
                                                <div>
                                                    <span className="text-gray-700">${item.price.toFixed(2)} × {item.quantity}</span>
                                                </div>
                                                <div className="font-semibold mt-1 sm:mt-0">${(item.price * item.quantity).toFixed(2)}</div>
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
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>$0.00</span>
                            </div>
                            <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
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