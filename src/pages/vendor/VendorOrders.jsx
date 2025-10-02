import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '../../api/config'

function VendorOrders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [shops, setShops] = useState({}) // Map of shop_id to shop details
    const [expandedShops, setExpandedShops] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [updatedStatus, setUpdatedStatus] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateError, setUpdateError] = useState(null)
    const [deliveryBoy, setDeliveryBoy] = useState(null)
    const [orderItems, setOrderItems] = useState([])
    const [isLoadingItems, setIsLoadingItems] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchVendorOrders()
    }, [])

    const fetchVendorOrders = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const vendor = JSON.parse(localStorage.getItem('vendor'))
            if (!vendor || !vendor.vendor_id) {
                throw new Error('Vendor information not found')
            }

            // Fetch orders
            const ordersResponse = await fetch(`${config.baseUrl}/vendor/${vendor.vendor_id}/suborders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!ordersResponse.ok) {
                if (ordersResponse.status === 404) {
                    setOrders([])
                    setIsLoading(false)
                    return
                }
                throw new Error('Failed to fetch orders')
            }

            const ordersData = await ordersResponse.json()
            setOrders(ordersData.orders || [])

            // Get unique shop IDs from orders
            const shopIds = new Set()
            ordersData.orders.forEach(order => {
                order.suborders.forEach(suborder => {
                    shopIds.add(suborder.shop_id)
                })
            })

            // Fetch shop details
            const shopsResponse = await fetch(`${config.baseUrl}/vendor/${vendor.vendor_id}/shops`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (shopsResponse.ok) {
                const shopsData = await shopsResponse.json()
                const shopsMap = {}
                shopsData.shops.forEach(shop => {
                    shopsMap[shop.id] = shop
                })
                setShops(shopsMap)

                // Initialize expanded states
                const initialShopStates = {}
                shopIds.forEach(id => {
                    initialShopStates[id] = false
                })
                setExpandedShops(initialShopStates)
            }

        } catch (err) {
            console.error('Error fetching data:', err)
            setError(err.message || 'Error fetching data')
        } finally {
            setIsLoading(false)
        }
    }

    const toggleShop = (shopId) => {
        setExpandedShops(prev => ({
            ...prev,
            [shopId]: !prev[shopId]
        }))
    }

    const getUniqueShops = () => {
        const uniqueShops = new Set()
        orders.forEach(order => {
            order.suborders.forEach(suborder => {
                uniqueShops.add(suborder.shop_id)
            })
        })
        return Array.from(uniqueShops)
    }

    const getOrdersForShop = (shopId) => {
        let filteredOrders = orders.filter(order =>
            order.suborders.some(suborder => suborder.shop_id === shopId)
        )

        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => {
                return order.suborders.some(suborder => 
                    suborder.shop_id === shopId && suborder.status === statusFilter
                )
            })
        }

        return filteredOrders
    }

    const getAllStatuses = () => {
        const statuses = new Set()
        orders.forEach(order => {
            order.suborders.forEach(suborder => {
                if (suborder.status) {
                    statuses.add(suborder.status)
                }
            })
        })
        return Array.from(statuses).sort()
    }

    const getOrderCountForStatus = (status) => {
        if (status === 'all') {
            return orders.length
        }
        return orders.filter(order =>
            order.suborders.some(suborder => suborder.status === status)
        ).length
    }

    const openStatusModal = (order, suborder) => {
        setSelectedOrder({ order, suborder })
        setUpdatedStatus(suborder.status)
        setIsModalOpen(true)
        setUpdateError(null)
        setDeliveryBoy(null) // Reset delivery boy info
        setOrderItems([]) // Reset order items

        // If the order has been picked up, try to fetch delivery boy info
        if (suborder.status === 'picked_up' && suborder.delivery_boy_id) {
            fetchDeliveryBoyInfo(suborder.delivery_boy_id)
        }

        // Fetch order items for verification
        fetchOrderItems(suborder.suborder_id)
    }

    const fetchDeliveryBoyInfo = async (deliveryBoyId) => {
        try {
            const response = await fetch(`${config.baseUrl}/deliveryboy/${deliveryBoyId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setDeliveryBoy(data.deliveryBoy || null)
            }
        } catch (error) {
            console.error('Error fetching delivery boy info:', error)
            // Don't set an error state, just fail silently as this is additional info
        }
    }

    const fetchOrderItems = async (suborderId) => {
        setIsLoadingItems(true)
        try {
            const vendor = JSON.parse(localStorage.getItem('vendor'))
            if (!vendor || !vendor.vendor_id) return

            // We need to find the shop and branch for this suborder
            const shopId = selectedOrder?.suborder?.shop_id
            if (!shopId) return

            const branchId = selectedOrder?.suborder?.branch_id
            if (!branchId) return

            const response = await fetch(`${config.baseUrl}/vendor/ordered-items/${vendor.vendor_id}/${shopId}/${branchId}/${suborderId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setOrderItems(data.ordered_items || [])
            }
        } catch (error) {
            console.error('Error fetching order items:', error)
        } finally {
            setIsLoadingItems(false)
        }
    }

    const closeStatusModal = () => {
        setIsModalOpen(false)
        setSelectedOrder(null)
        setUpdatedStatus('')
        setIsUpdating(false)
        setUpdateError(null)
        setDeliveryBoy(null)
        setOrderItems([])
    }

    const updateOrderStatus = async (status) => {
        if (!selectedOrder) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            const token = localStorage.getItem('token');
            const statusEndpoints = {
                'in_progress': `/vendor/order/${selectedOrder.suborder.suborder_id}/in-progress`,
                'ready': `/vendor/order/${selectedOrder.suborder.suborder_id}/ready`,
                'handover_confirmed': `/vendor/order/${selectedOrder.suborder.suborder_id}/handover`
            };

            if (!statusEndpoints[status]) {
                throw new Error('Invalid status selected');
            }

            const response = await fetch(`${config.baseUrl}${statusEndpoints[status]}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update order status');
            }

            // Update order in local state
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.order_id === selectedOrder.order.order_id) {
                    return {
                        ...order,
                        suborders: order.suborders.map(suborder =>
                            suborder.suborder_id === selectedOrder.suborder.suborder_id
                                ? { ...suborder, status: status }
                                : suborder
                        )
                    };
                }
                return order;
            }));

            // Show confirmation for handover
            if (status === 'handover_confirmed') {
            // Close modal and show toast or alert
                closeStatusModal();
                alert('Order successfully handed over to delivery boy. Order status updated to in-transit.');
                // Refresh orders to get the latest status
                fetchVendorOrders();
            } else {
                closeStatusModal();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setUpdateError(error.message || 'Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    const confirmPayment = async () => {
        if (!selectedOrder) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.baseUrl}/vendor/confirm-payment/${selectedOrder.suborder.suborder_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to confirm payment');
            }

            // Update order in local state
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.order_id === selectedOrder.order.order_id) {
                    return {
                        ...order,
                        suborders: order.suborders.map(suborder =>
                            suborder.suborder_id === selectedOrder.suborder.suborder_id
                                ? { ...suborder, payment_status: 'confirmed_by_vendor' }
                                : suborder
                        )
                    };
                }
                return order;
            }));

            closeStatusModal();
        } catch (error) {
            console.error('Error confirming payment:', error);
            setUpdateError(error.message || 'Failed to confirm payment');
        } finally {
            setIsUpdating(false);
        }
    };

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

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'processing':
                return 'bg-blue-100 text-blue-800'
            case 'in_progress':
                return 'bg-blue-100 text-blue-800'
            case 'ready':
                return 'bg-green-100 text-green-800'
            case 'picked_up':
                return 'bg-purple-100 text-purple-800'
            case 'handover_confirmed':
                return 'bg-indigo-100 text-indigo-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">All Orders</h1>
                <button
                    onClick={fetchVendorOrders}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Refresh Orders
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <div
                        onClick={() => setStatusFilter('all')}
                        className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            statusFilter === 'all'
                                ? 'bg-primary border border-primary text-white'
                                : 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white'
                        }`}
                    >
                        All ({getOrderCountForStatus('all')})
                    </div>
                    {getAllStatuses().map(status => (
                        <div
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                                statusFilter === status
                                    ? 'bg-primary border border-primary text-white'
                                    : 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white'
                            }`}
                        >
                            {status.replace('_', ' ')} ({getOrderCountForStatus(status)})
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-gray-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-medium mb-2">No orders yet</h2>
                    <p className="text-gray-500">When customers place orders, they'll appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {getUniqueShops().map(shopId => (
                        <div key={shopId} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div
                                className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b cursor-pointer flex justify-between items-center hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
                                onClick={() => toggleShop(shopId)}
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {shops[shopId]?.name ? shops[shopId].name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                    <div className="ml-3">
                                        <h2 className="text-lg font-semibold text-gray-900">{shops[shopId]?.name || `Shop #${shopId}`}</h2>
                                        <p className="text-sm text-gray-500">{getOrdersForShop(shopId).length} orders</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                        {getOrdersForShop(shopId).length}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 transform transition-transform duration-200 ${expandedShops[shopId] ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {expandedShops[shopId] && (
                                <div className="p-4">
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {getOrdersForShop(shopId).map(order => (
                                            <div key={order.order_id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                                                <div className="p-4">
                                                    {/* Order Header */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">#{order.order_id}</h3>
                                                                <p className="text-xs text-gray-500">{formatDate(order.order_date)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-gray-900">Rs.{parseFloat(order.total_amount).toFixed(2)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Customer Info */}
                                                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                            {order.customer.picture ? (
                                                                <img src={order.customer.picture} alt={order.customer.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span className="text-sm font-medium text-gray-500">
                                                                    {order.customer.name.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{order.customer.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{order.customer.email}</p>
                                                        </div>
                                                    </div>

                                                    {/* Status and Actions */}
                                                    <div className="space-y-3">
                                                        {order.suborders
                                                            .filter(suborder => {
                                                                if (statusFilter === 'all') {
                                                                    return suborder.shop_id === shopId
                                                                }
                                                                return suborder.shop_id === shopId && suborder.status === statusFilter
                                                            })
                                                            .map(suborder => (
                                                                <div key={suborder.suborder_id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(suborder.status)}`}>
                                                                            {suborder.status?.replace('_', ' ').toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => openStatusModal(order, suborder)}
                                                                        className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center space-x-1"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        <span>Update</span>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                    </div>

                                                    {/* Order Summary */}
                                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-500">Order Total</span>
                                                            <span className="font-semibold text-gray-900">Rs.{parseFloat(order.total_amount).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Status Update Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Update Order Status</h3>
                            <button onClick={closeStatusModal} className="text-gray-400 hover:text-gray-500">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">Order #{selectedOrder.order.order_id}</p>
                            <div className="bg-gray-50 p-3 rounded-md mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Current Status:</span>
                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(selectedOrder.suborder.status)}`}>
                                        {selectedOrder.suborder.status || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            {/* Delivery Boy Information */}
                            {selectedOrder.suborder.status === 'picked_up' && deliveryBoy && (
                                <div className="bg-gray-50 p-3 rounded-md mb-3">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Delivery Boy Information</h4>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {deliveryBoy.picture ? (
                                                <img src={deliveryBoy.picture} alt={deliveryBoy.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-500">
                                                    {deliveryBoy.name ? deliveryBoy.name.charAt(0) : 'D'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{deliveryBoy.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{deliveryBoy.phone || 'No phone available'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center">
                                        <a href={`tel:${deliveryBoy.phone}`} className="text-sm text-primary flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Call Delivery Agent
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Order Items Section */}
                            {selectedOrder.suborder.status === 'picked_up' && (
                                <div className="mt-4 bg-gray-50 p-3 rounded-md">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items for Handover</h4>
                                    {isLoadingItems ? (
                                        <div className="flex justify-center py-3">
                                            <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                                        </div>
                                    ) : orderItems.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {orderItems.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                    <div className="flex items-center">
                                                        <div className="text-gray-700 text-sm font-medium">{item.item_name}</div>
                                                        <div className="ml-2 text-xs text-gray-500">x{item.quantity}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-700 font-medium">Rs.{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-2">No items found for this order</p>
                                    )}
                                    <div className="flex items-center justify-between border-t border-gray-200 mt-2 pt-2">
                                        <span className="text-sm font-medium text-gray-700">Total</span>
                                        <span className="text-sm font-bold text-gray-900">Rs.{selectedOrder.suborder.total_amount}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {selectedOrder.suborder.status === 'pending' && (
                                    <button
                                        onClick={() => updateOrderStatus('in_progress')}
                                        disabled={isUpdating}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                Start Preparing Order
                                            </>
                                        )}
                                    </button>
                                )}

                                {selectedOrder.suborder.status === 'in_progress' && (
                                    <button
                                        onClick={() => updateOrderStatus('ready')}
                                        disabled={isUpdating}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Mark as Ready for Pickup
                                            </>
                                        )}
                                    </button>
                                )}

                                {selectedOrder.suborder.status === 'picked_up' && (
                                    <button
                                        onClick={() => updateOrderStatus('handover_confirmed')}
                                        disabled={isUpdating}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Confirm Handover to Delivery
                                            </>
                                        )}
                                    </button>
                                )}

                                {selectedOrder.suborder.status === 'picked_up' && (
                                    <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-sm rounded">
                                        <p className="flex items-center">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Confirming handover will transfer the order to the delivery boy. Please verify all items are packed properly before confirming.
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.suborder.payment_status === 'confirmed_by_deliveryboy' && (
                                    <button
                                        onClick={confirmPayment}
                                        disabled={isUpdating}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Confirming...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 002-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Confirm Payment Receipt
                                            </>
                                        )}
                                    </button>
                                )}

                                {(selectedOrder.suborder.status !== 'pending' &&
                                    selectedOrder.suborder.status !== 'in_progress' &&
                                    selectedOrder.suborder.status !== 'picked_up' &&
                                    selectedOrder.suborder.payment_status !== 'confirmed_by_deliveryboy') && (
                                        <div className="text-center py-2 text-gray-500">
                                            No status change options available for this order.
                                        </div>
                                    )}
                            </div>
                        </div>

                        {updateError && (
                            <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">
                                {updateError}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeStatusModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorOrders 