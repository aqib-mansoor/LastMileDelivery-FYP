import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
import config from '../../api/config'

function Checkout() {
    const navigate = useNavigate()
    const { cartItems, cartTotal, isLoading, error: cartError, clearCart, customerData } = useCart()
    const [suborders, setSuborders] = useState([])
    console.log(suborders)
    const [allShops, setAllShops] = useState([])
    const [addresses, setAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [orderPlaced, setOrderPlaced] = useState(false)
    const [placedOrderId, setPlacedOrderId] = useState(null)
    const [placedOrderDetails, setPlacedOrderDetails] = useState(null)
    const [showAddAddressForm, setShowAddAddressForm] = useState(false)
    const [newAddressData, setNewAddressData] = useState({
        address_type: 'Home',
        street: '',
        city: '',
        zip_code: '',
        country: 'Pakistan',
        latitude: null,
        longitude: null
    })

    useEffect(() => {
        if (customerData && customerData.customer_id) {
            fetchShopsData(customerData.customer_id)
        }
    }, [customerData])

    const fetchShopsData = async (customerId) => {
        try {
            const response = await fetch(`${config.baseUrl}/customer/main-screen/${customerId}`)

            if (!response.ok) {
                throw new Error('Failed to fetch shops data')
            }

            const data = await response.json()

            // Format shop data to include shop details
            const formattedShops = data.map(shop => ({
                id: shop.branch_id,
                name: shop.shop_name,
                shopId: shop.shop_id,
                branchId: shop.branch_id,
                vendorId: shop.vendor_id,
                branchDescription: shop.branch_description
            }))

            setAllShops(formattedShops)
        } catch (error) {
            console.error('Error fetching shops data:', error)
        }
    }

    useEffect(() => {
        // Group items by suborder (vendor/shop/branch)
        if (cartItems.length > 0) {
            const groupedItems = {}

            cartItems.forEach(item => {
                const suborderId = item.cart_suborders_ID
                if (!groupedItems[suborderId]) {
                    groupedItems[suborderId] = {
                        id: suborderId,
                        items: [],
                        ...item,
                    }
                }
                groupedItems[suborderId].items.push(item)
            })

            setSuborders(Object.values(groupedItems))
        } else {
            setSuborders([])
        }
    }, [cartItems])

    useEffect(() => {
        fetchAddresses()
    }, [customerData])

    const fetchAddresses = async () => {
        if (!customerData || !customerData.customer_id) return

        try {
            const response = await fetch(`${config.baseUrl}/customers/${customerData.customer_id}/addresses`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (response.status === 404) {
                setAddresses([])
                setShowAddAddressForm(true)
                return
            }

            if (!response.ok) {
                throw new Error('Failed to fetch addresses')
            }

            setAddresses(data.addresses || [])
            if (data.addresses && data.addresses.length > 0) {
                setSelectedAddressId(data.addresses[0].id)
            } else {
                setShowAddAddressForm(true)
            }
        } catch (err) {
            console.error('Error fetching addresses:', err)
            setAddresses([])
            setShowAddAddressForm(true)
        }
    }

    const handleAddressChange = (e) => {
        setSelectedAddressId(e.target.value)
    }

    const handleBackToCart = () => {
        navigate('/customer/cart')
    }

    const handleNewAddressChange = (e) => {
        const { name, value } = e.target
        setNewAddressData({
            ...newAddressData,
            [name]: value
        })
    }

    const handleAddAddress = async (e) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            if (!customerData || !customerData.customer_id) {
                throw new Error('Customer information not available')
            }

            const response = await fetch(`${config.baseUrl}/customers/${customerData.customer_id}/add-address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newAddressData)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.message || 'Failed to add address')
            }

            // Reset form and fetch updated addresses
            setNewAddressData({
                address_type: 'Home',
                street: '',
                city: '',
                zip_code: '',
                country: 'Pakistan',
                latitude: null,
                longitude: null
            })
            await fetchAddresses()
            setShowAddAddressForm(false)
        } catch (err) {
            console.error('Error adding address:', err)
            setError(err.message || 'Failed to add address')
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await fetch(`${config.baseUrl}/orders/${orderId}/details`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order details')
            }

            setPlacedOrderDetails({
                id: data.order_id,
                order_date: data.order_date,
                total_amount: data.order_total_amount,
                suborders: data.suborders.map(suborder => ({
                    id: suborder.suborder_id,
                    shop_name: getShopName(suborder.shop_ID) || `Shop #${suborder.shop_ID}`,
                    total_amount: suborder.suborder_total_amount,
                    items: suborder.items.map(item => ({
                        id: item.item_detail_id,
                        name: item.item_name,
                        quantity: item.item_quantity,
                        price: item.price || item.item_price,
                        image: item.itemPicture,
                        variation: item.variation_name
                    }))
                }))
            })
        } catch (err) {
            console.error('Error fetching order details:', err)
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault()
        if (!selectedAddressId) {
            setError('Please select a delivery address')
            return
        }

        if (!customerData || !customerData.customer_id) {
            setError('Customer information not available')
            return
        }

        setError(null)
        setSuccess(null)
        setIsSubmitting(true)

        try {
            // Format the order details as required by the API
            const orderDetails = cartItems.map(item => ({
                vendor_id: item.vendor_id,
                shop_id: item.shop_id,
                branch_id: item.branch_id,
                item_detail_id: item.item_detail_id,
                price: parseFloat(item.price),
                quantity: item.quantity
            }))

            const orderData = {
                customer_id: customerData.customer_id,
                delivery_address_id: parseInt(selectedAddressId),
                order_details: orderDetails
            }

            console.log('Sending order data:', orderData)

            const response = await fetch(`${config.baseUrl}/customer/place-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to place order')
            }

            setSuccess('Order placed successfully!')
            setOrderPlaced(true)
            setPlacedOrderId(data.order_id)
            
            // Fetch order details to display in confirmation
            await fetchOrderDetails(data.order_id)
            await clearCart()
        } catch (err) {
            console.error('Error placing order:', err)
            setError(err.message || 'An error occurred while placing your order')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Find shop name by shop_id
    const getShopName = (shopId) => {
        const shop = allShops.find(shop => shop.shopId === shopId)
        return shop ? shop.name : 'Shop'
    }

    if (orderPlaced) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-6">Thank you for your order. Your order has been placed and is being processed.</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                        <div className="font-medium mb-4">Order Summary</div>
                        
                        {placedOrderDetails ? (
                            <>
                                {placedOrderDetails.suborders.map(suborder => (
                                    <div key={suborder.id} className="mb-3 pb-3 border-b border-gray-200">
                                        <div className="font-medium text-sm mb-2">{suborder.shop_name}</div>
                                        {suborder.items.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm py-1">
                                                <span>{item.name} {item.variation ? `(${item.variation})` : ''} × {item.quantity}</span>
                                                <span>Rs.{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-sm font-medium mt-1">
                                            <span>Subtotal</span>
                                            <span>Rs.{parseFloat(suborder.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between font-semibold pt-2">
                                    <span>Total Amount:</span>
                                    <span>Rs.{parseFloat(placedOrderDetails.total_amount).toFixed(2)}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-500 text-sm">Loading order details...</p>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={() => navigate(`/customer/orders/${placedOrderId}`)}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors mb-4 w-full"
                    >
                        View Order Details
                    </button>
                    
                    <button
                        onClick={() => navigate('/customer/dashboard')}
                        className="text-gray-600 hover:text-primary transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    if (cartItems.length === 0 && !success) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add items to your cart before checkout</p>
                    <button
                        onClick={() => navigate('/customer/dashboard')}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Browse Shops
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBackToCart}
                    className="flex items-center text-gray-600 hover:text-primary transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    <span>Back to Cart</span>
                </button>
                <h1 className="text-2xl font-bold text-center flex-1">Checkout</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {cartError && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {cartError}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Order Summary - Left Side */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                        {suborders.map((suborder) => {
                            const suborderTotal = suborder.items.reduce((sum, item) =>
                                sum + (item.quantity * parseFloat(item.price)), 0
                            )
                            const shopName = getShopName(suborder.shop_id)

                            return (
                                <div key={suborder.id} className="mb-6 border rounded-lg p-4">
                                    <h3 className="font-medium text-gray-700 mb-3 pb-2 border-b">{shopName}</h3>
                                    <div className="divide-y divide-gray-100">
                                        {suborder.items.map((item) => (
                                            <div key={item.id} className="py-3 flex items-start gap-3">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {item.itemPicture ? (
                                                        <img
                                                            src={item.itemPicture}
                                                            alt={item.item_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                            <span className="text-gray-400 text-xs">No image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm">{item.item_name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.variation_name && `${item.variation_name}`} × {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium">Rs.{(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                                        <span className="font-medium">Shop Subtotal</span>
                                        <span className="font-medium">Rs.{suborderTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            )
                        })}

                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center py-2 text-gray-600">
                                <span>Total</span>
                                <span>Rs.{cartTotal}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 text-gray-600">
                                <span>Delivery Fee</span>
                                <span>Rs.{config.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 font-semibold text-lg border-t border-gray-100 mt-2 pt-2">
                                <span>Grand Total</span>
                                <span>Rs.{(parseFloat(cartTotal) + config.deliveryFee).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Address - Right Side */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>

                        {!showAddAddressForm && addresses.length > 0 ? (
                            <div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Delivery Address</label>
                                    <select
                                        value={selectedAddressId}
                                        onChange={handleAddressChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                        required
                                    >
                                        {addresses.map(address => (
                                            <option key={address.id} value={address.id}>
                                                {address.street}, {address.city}, {address.zip_code}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddAddressForm(true)}
                                        className="flex items-center "
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add New Address
                                    </button>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isSubmitting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary/90'
                                        }`}
                                >
                                    {isSubmitting ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <form onSubmit={handleAddAddress} className="mb-6">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                                        <select
                                            name="address_type"
                                            value={newAddressData.address_type}
                                            onChange={handleNewAddressChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                            required
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Work">Work</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={newAddressData.street}
                                            onChange={handleNewAddressChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={newAddressData.city}
                                                onChange={handleNewAddressChange}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                                            <input
                                                type="text"
                                                name="zip_code"
                                                value={newAddressData.zip_code}
                                                onChange={handleNewAddressChange}
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={newAddressData.country}
                                            onChange={handleNewAddressChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        {addresses.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAddAddressForm(false)}
                                                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${isSubmitting
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary text-white hover:bg-primary/90'
                                                }`}
                                        >
                                            {isSubmitting ? 'Adding...' : 'Add Address'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout 