import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import config from '../../api/config'

function Orders() {
    const navigate = useNavigate()
    const { customerData } = useCart()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchOrders(customerData)
    }, [customerData])

    const fetchOrders = async (customerData) => {
        if (!customerData || !customerData.customer_id) {
            setIsLoading(false)
            setError('Customer information not available')
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`${config.baseUrl}/customers/${customerData.customer_id}/orders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 404) {
                    // No orders found, that's okay
                    setOrders([])
                    setIsLoading(false)
                    return
                }
                throw new Error(data.message || 'Failed to fetch orders')
            }

            const sortedOrders = data.data || [];
            sortedOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

            setOrders(sortedOrders);
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError(err.message || 'Error fetching orders')
        } finally {
            setIsLoading(false)
        }
    }

    const getAllStatuses = () => {
        const statuses = new Set()
        orders.forEach(order => {
            if (order.order_status) {
                statuses.add(order.order_status)
            }
        })
        return Array.from(statuses).sort()
    }

    const getOrderCountForStatus = (status) => {
        if (status === 'all') {
            return orders.length
        }
        return orders.filter(order => order.order_status === status).length
    }

    const getFilteredOrders = () => {
        if (statusFilter === 'all') {
            return orders
        }
        return orders.filter(order => order.order_status === statusFilter)
    }

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'processing':
                return 'bg-blue-100 text-blue-800'
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Your Orders</h1>
                <button
                    onClick={() => navigate('/customer/dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Continue Shopping
                </button>
            </div>

            {/* Status Filter Tabs */}
            {orders.length > 0 && (
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
            )}

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
                    <p className="text-gray-500 mb-6">Start shopping to create your first order</p>
                    <button
                        onClick={() => navigate('/customer/dashboard')}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Browse Shops
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {getFilteredOrders().map((order, index) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/customer/orders/${order.id}`)}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.order_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Rs.{parseFloat(order.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.payment_method || 'N/A'}
                                            {order.payment_status && (
                                                <span className={`ml-2 px-2 py-0.5 text-xs rounded ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.payment_status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Orders 