import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import config from '../../api/config'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'

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

    // Rating dialog state
    const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
    const [ratingData, setRatingData] = useState({
        suborders_ID: '',
        itemdetails_ID: '',
        rating_stars: 0,
        comments: '',
        images: []
    })
    const [isSubmittingRating, setIsSubmittingRating] = useState(false)

    // Delivery boy rating dialog state
    const [isDeliveryRatingDialogOpen, setIsDeliveryRatingDialogOpen] = useState(false)
    const [deliveryRatingData, setDeliveryRatingData] = useState({
        suborder_ID: '',
        rating_stars: 0,
        comments: ''
    })
    const [isSubmittingDeliveryRating, setIsSubmittingDeliveryRating] = useState(false)

    // Track submitted ratings
    const [submittedItemRatings, setSubmittedItemRatings] = useState(new Set())
    const [submittedDeliveryRatings, setSubmittedDeliveryRatings] = useState(new Set())

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

    const openRatingDialog = (suborderId, itemId) => {
        setRatingData({
            suborders_ID: suborderId,
            itemdetails_ID: itemId,
            rating_stars: 0,
            comments: '',
            images: []
        })
        setIsRatingDialogOpen(true)
    }

    const openDeliveryRatingDialog = (suborderId) => {
        setDeliveryRatingData({
            suborder_ID: suborderId,
            rating_stars: 0,
            comments: ''
        })
        setIsDeliveryRatingDialogOpen(true)
    }

    const handleRatingSubmit = async () => {
        if (ratingData.rating_stars === 0) {
            alert('Please select a rating')
            return
        }

        try {
            setIsSubmittingRating(true)

            const formData = new FormData()
            formData.append('suborders_ID', ratingData.suborders_ID)
            formData.append('itemdetails_ID', ratingData.itemdetails_ID)
            formData.append('rating_stars', ratingData.rating_stars)
            formData.append('comments', ratingData.comments)

            // Append images if any
            ratingData.images.forEach((image, index) => {
                formData.append('images', image)
            })

            const response = await fetch(`${config.baseUrl}/itemrating`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            })

            const data = await response.json()
            console.log("rating data", data)

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit rating')
            }

            setConfirmationMessage('Rating submitted successfully!')
            setIsRatingDialogOpen(false)
            setSubmittedItemRatings(prev => new Set([...prev, `${ratingData.suborders_ID}-${ratingData.itemdetails_ID}`]))

        } catch (err) {
            console.error('Error submitting rating:', err)
            setConfirmationMessage(err.message || 'Error submitting rating')
        } finally {
            setIsSubmittingRating(false)
        }
    }

    const handleDeliveryRatingSubmit = async () => {
        if (deliveryRatingData.rating_stars === 0) {
            alert('Please select a rating')
            return
        }

        try {
            setIsSubmittingDeliveryRating(true)

            const response = await fetch(`${config.baseUrl}/customer/rate-delivery-boy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    suborder_ID: deliveryRatingData.suborder_ID,
                    rating_stars: deliveryRatingData.rating_stars,
                    comments: deliveryRatingData.comments
                })
            })

            const data = await response.json()
            console.log("delivery rating data", data)

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit delivery rating')
            }

            setConfirmationMessage('Delivery rating submitted successfully!')
            setIsDeliveryRatingDialogOpen(false)
            setSubmittedDeliveryRatings(prev => new Set([...prev, deliveryRatingData.suborder_ID]))

        } catch (err) {
            console.error('Error submitting delivery rating:', err)
            setConfirmationMessage(err.message || 'Error submitting delivery rating')
        } finally {
            setIsSubmittingDeliveryRating(false)
        }
    }

    const handleStarClick = (stars) => {
        setRatingData(prev => ({ ...prev, rating_stars: stars }))
    }

    const handleDeliveryStarClick = (stars) => {
        setDeliveryRatingData(prev => ({ ...prev, rating_stars: stars }))
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        setRatingData(prev => ({ ...prev, images: files }))
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
        <>
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 013.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            Track Rider
                                        </button>
                                    )}
                                    {(suborder.status === 'delivered' || suborder.status === 'completed') && (
                                        !submittedDeliveryRatings.has(suborder.id) && (
                                            <button
                                                onClick={() => openDeliveryRatingDialog(suborder.id)}
                                                className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Rate Delivery Boy
                                            </button>
                                        )
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
                                        <div className="flex-shrink-0">
                                            {!submittedItemRatings.has(`${suborder.id}-${item.id}`) && (
                                                <button
                                                    onClick={() => openRatingDialog(suborder.id, item.id)}
                                                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                                                >
                                                    Rate Item
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Rating Dialog */}
            <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rate Item</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Rating *</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleStarClick(star)}
                                        className={`text-2xl transition-colors ${star <= ratingData.rating_stars
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Comments</label>
                            <textarea
                                value={ratingData.comments}
                                onChange={(e) => setRatingData(prev => ({ ...prev, comments: e.target.value }))}
                                placeholder="Share your experience..."
                                maxLength={255}
                                className="w-full p-2 border border-gray-300 rounded-lg resize-none h-20"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {ratingData.comments.length}/255 characters
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Upload Images (Optional)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                onChange={handleImageUpload}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Max 2MB per image. Formats: JPEG, PNG, JPG, GIF
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => setIsRatingDialogOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRatingSubmit}
                                disabled={isSubmittingRating || ratingData.rating_stars === 0 || submittedItemRatings.has(`${ratingData.suborders_ID}-${ratingData.itemdetails_ID}`)}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delivery Boy Rating Dialog */}
            <Dialog open={isDeliveryRatingDialogOpen} onOpenChange={setIsDeliveryRatingDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Rate Delivery Boy</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Rating *</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleDeliveryStarClick(star)}
                                        className={`text-2xl transition-colors ${star <= deliveryRatingData.rating_stars
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Comments</label>
                            <textarea
                                value={deliveryRatingData.comments}
                                onChange={(e) => setDeliveryRatingData(prev => ({ ...prev, comments: e.target.value }))}
                                placeholder="Share your experience with the delivery..."
                                maxLength={255}
                                className="w-full p-2 border border-gray-300 rounded-lg resize-none h-20"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {deliveryRatingData.comments.length}/255 characters
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => setIsDeliveryRatingDialogOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeliveryRatingSubmit}
                                disabled={isSubmittingDeliveryRating || deliveryRatingData.rating_stars === 0 || submittedDeliveryRatings.has(deliveryRatingData.suborder_ID)}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingDeliveryRating ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </>
    )
}

export default OrderDetail