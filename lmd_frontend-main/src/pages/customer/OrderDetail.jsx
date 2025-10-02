import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import config from '../../api/config'


function OrderDetail() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const { customerData } = useCart()

    const [order, setOrder] = useState(null)
    const [suborders, setSuborders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [confirmingDelivery, setConfirmingDelivery] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')
    const [confirmingSuborderId, setConfirmingSuborderId] = useState(null)
    const [confirmingPayment, setConfirmingPayment] = useState(false)
    const [confirmingPaymentSuborderId, setConfirmingPaymentSuborderId] = useState(null)

    useEffect(() => {
        fetchOrderDetails()
    }, [orderId])

    const fetchOrderDetails = async () => {
        if (!orderId) {
            setIsLoading(false)
            setError('Order ID not available')
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`${config.baseUrl}/orders/${orderId}/details`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch order details')
            }

            console.log(data)

            setOrder({
                id: data.order_id,
                order_date: data.order_date,
                order_status: data.order_status,
                total_amount: data.order_total_amount
            })
            setSuborders(data.suborders.map(suborder => ({
                id: suborder.suborder_id,
                status: suborder.suborder_status,
                payment_status: suborder.suborder_payment_status,
                total_amount: suborder.suborder_total_amount,
                shop_name: `Shop #${suborder.shop_ID}`,
                items: suborder.items.map(item => ({
                    id: item.item_detail_id,
                    name: item.item_name,
                    quantity: item.item_quantity,
                    price: item.price || item.item_price,
                    image: item.itemPicture,
                    variation: item.variation_name
                }))
            })))
        } catch (err) {
            console.error('Error fetching order details:', err)
            setError(err.message || 'Error fetching order details')
        } finally {
            setIsLoading(false)
        }
    }

    const confirmDelivery = async (suborderId) => {
        if (!suborderId) return

        try {
            setConfirmingDelivery(true)
            setConfirmingSuborderId(suborderId)
            setConfirmationMessage('')

            const response = await fetch(`${config.baseUrl}/customer/order/${suborderId}/confirm-delivery`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to confirm delivery')
            }

            // Update the local state of this suborder
            const updatedSuborders = suborders.map(so =>
                so.id === suborderId ? { ...so, status: 'delivered' } : so
            )

            setSuborders(updatedSuborders)
            setConfirmationMessage('Delivery confirmed successfully!')

            // Refresh the entire order after a short delay
            setTimeout(() => {
                fetchOrderDetails()
            }, 2000)

        } catch (err) {
            console.error('Error confirming delivery:', err)
            setConfirmationMessage(err.message || 'Error confirming delivery')
        } finally {
            setConfirmingDelivery(false)
            setConfirmingSuborderId(null)
        }
    }

    const confirmPayment = async (suborderId) => {
        if (!suborderId) return
        try {
            setConfirmingPayment(true)
            setConfirmingPaymentSuborderId(suborderId)
            setConfirmationMessage('')
            const response = await fetch(`${config.baseUrl}/customer/confirm-payment/${suborderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to confirm payment')
            }
            // Update local state
            const updatedSuborders = suborders.map(so =>
                so.id === suborderId ? { ...so, payment_status: 'confirmed_by_customer' } : so
            )
            setSuborders(updatedSuborders)
            setConfirmationMessage('Payment confirmed successfully!')
            setTimeout(() => {
                fetchOrderDetails()
            }, 2000)
        } catch (err) {
            setConfirmationMessage(err.message || 'Error confirming payment')
        } finally {
            setConfirmingPayment(false)
            setConfirmingPaymentSuborderId(null)
        }
    }

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'processing':
            case 'in_progress':
                return 'bg-blue-100 text-blue-800'
            case 'in_transit':
                return 'bg-purple-100 text-purple-800'
            case 'handover_confirmed':
                return 'bg-indigo-100 text-indigo-800'
            case 'ready':
                return 'bg-teal-100 text-teal-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        })
    }

    const canConfirmDelivery = (status) => {
        return status === 'in_transit' || status === 'handover_confirmed'
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/customer/orders')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Back to Orders
                </button>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
                    Order not found
                </div>
                <button
                    onClick={() => navigate('/customer/orders')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Back to Orders
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Order #{order.id}</h1>
                <button
                    onClick={() => navigate('/customer/orders')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Back to Orders
                </button>
            </div>

            {confirmationMessage && (
                <div className={`border px-4 py-3 rounded mb-6 ${confirmationMessage.includes('Error') ? 'bg-red-100 border-red-200 text-red-700' : 'bg-green-100 border-green-200 text-green-700'}`}>
                    {confirmationMessage}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold mb-4">Order Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-medium">{formatDate(order.order_date)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.order_status)}`}>
                                {order.order_status}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-medium">Rs.{parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            {suborders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">No items found for this order</p>
                </div>
            ) : (
                suborders.map((suborder) => (
                    <div key={suborder.id} className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{suborder.shop_name || 'Shop'}</h3>
                                <p className="text-sm text-gray-600">Suborder #{suborder.id}</p>
                            </div>
                            <div className="flex items-center">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(suborder.status)}`}>
                                    {suborder.status}
                                </span>
                                {canConfirmDelivery(suborder.status) && (
                                    <button
                                        onClick={() => confirmDelivery(suborder.id)}
                                        disabled={confirmingDelivery}
                                        className="ml-4 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {confirmingDelivery && confirmingSuborderId === suborder.id ? 'Confirming...' : 'Confirm Delivery'}
                                    </button>
                                )}
                                {suborder.payment_status === 'pending' && (
                                    <button
                                        onClick={() => confirmPayment(suborder.id)}
                                        disabled={confirmingPayment}
                                        className="ml-4 px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {confirmingPayment && confirmingPaymentSuborderId === suborder.id ? 'Confirming...' : 'Confirm Payment'}
                                    </button>
                                )}
                                {(suborder.status === 'in_transit' || suborder.status === 'handover_confirmed') && (
                                    <button
                                        onClick={() => {
                                            window.open(`/tracking/${suborder.id}`, '_blank')
                                        }}
                                        className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Track Rider
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {suborder.items?.map((item) => (
                                <div key={item.id} className="p-4 flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <span className="text-gray-400 text-xs">No image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.variation && `${item.variation}`} × {item.quantity}
                                        </p>
                                        <p className="text-sm font-medium mt-1">
                                            Rs.{(item.quantity * parseFloat(item.price)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default OrderDetail 