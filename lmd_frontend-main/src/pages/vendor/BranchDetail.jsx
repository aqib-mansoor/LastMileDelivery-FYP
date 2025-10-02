import { useState, useEffect } from 'react'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import config from '../../api/config'
import { useVendorShops } from '../../hooks'

function BranchDetail() {
    const { branchId, shopId } = useParams()
    const { user } = useOutletContext()
    const { shops, loading: loadingShops, error: shopsError } = useVendorShops()
    const shopCategoryId = shops.find(shop => shop.id.toString() === shopId)?.shopcategory_ID
    console.log(shopId, shops)

    const [items, setItems] = useState([])
    const [isLoadingItems, setIsLoadingItems] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('items')
    const [branchOrders, setBranchOrders] = useState([])
    const [isLoadingOrders, setIsLoadingOrders] = useState(false)
    const [orderError, setOrderError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [updatedStatus, setUpdatedStatus] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateError, setUpdateError] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        variation_name: '',
        preparation_time: '',
        timesensitive: 'No',
        category_ID: '',
        branches_ID: branchId,
        additional_info: '',
        itemPicture: null,
        attributes: [{ key: '', value: '' }]
    })
    const [categories, setCategories] = useState([])
    const [variations, setVariations] = useState([])
    const [predefinedAttributes, setPredefinedAttributes] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    useEffect(() => {
        // Get shopId from URL or use a default value
        if (user && user.id && shopId) {
            fetchItems(shopId, branchId)
            fetchCategories(shopCategoryId)
            if (activeTab === 'orders') {
                fetchBranchOrders(shopId, branchId)
            }
        }
    }, [branchId, user, shopId, shopCategoryId, activeTab])

    const fetchCategories = async (shopCategoryId) => {
        if (!shopCategoryId) {
            console.log('No shop category ID found')
            setCategories([])
            return
        }
        try {
            // Use the vendor endpoint with shopCategoryId
            const response = await fetch(`${config.baseUrl}/itemcategories/${shopCategoryId}`)
            console.log(response)

            if (response.ok) {
                const data = await response.json()
                if (data.categories) {
                    setCategories(data.categories)
                } else {
                    console.log('No categories returned from API, using defaults')
                    setDefaultCategories()
                }
            } else {
                console.log(response)
                console.log('Categories API returned error, using defaults')
                setDefaultCategories()
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            setDefaultCategories()
        }
    }

    const setDefaultCategories = () => {
        // Fallback categories
        setCategories([])
    }

    const fetchItems = async (shopId, branchId) => {
        const vendor = JSON.parse(localStorage.getItem('vendor'))
        setIsLoadingItems(true)
        try {
            const response = await fetch(`${config.baseUrl}/vendor/${vendor.vendor_id}/shop/${shopId}/branch/${branchId}/items`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setItems(data)
            } else {
                console.error('Failed to fetch items')
                setError('Failed to load items. Please try again.')
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            setError('An error occurred while fetching items.')
        } finally {
            setIsLoadingItems(false)
        }
    }

    const fetchBranchOrders = async (shopId, branchId) => {
        const vendor = JSON.parse(localStorage.getItem('vendor'))
        setIsLoadingOrders(true)
        setOrderError(null)

        try {
            const response = await fetch(`${config.baseUrl}/vendors/${vendor.vendor_id}/shops/${shopId}/branches/${branchId}/suborders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                if (response.status === 404) {
                    // No orders found, that's okay
                    setBranchOrders([])
                    setIsLoadingOrders(false)
                    return
                }
                throw new Error('Failed to fetch branch orders')
            }

            const data = await response.json()
            setBranchOrders(data.suborders || [])
        } catch (err) {
            console.error('Error fetching branch orders:', err)
            setOrderError(err.message || 'Error fetching branch orders')
        } finally {
            setIsLoadingOrders(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type } = e.target

        if (type === 'file') {
            setFormData({
                ...formData,
                itemPicture: e.target.files[0]
            })
        } else {
            setFormData({
                ...formData,
                [name]: value
            })
        }

        // If category changed, fetch variations and reset variation_name
        if (name === 'category_ID') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                variation_name: ''
            }))
        }
    }

    const fetchVariations = async (categoryId) => {
        if (!categoryId) {
            setVariations([])
            return
        }

        try {
            const response = await fetch(`${config.baseUrl}/item-variations/${categoryId}`)

            if (response.ok) {
                const data = await response.json()
                if (data.variations) {
                    setVariations(data.variations)
                } else {
                    setVariations([])
                }
            } else {
                console.log('Variations API returned error')
                setVariations([])
            }
        } catch (error) {
            console.error('Error fetching variations:', error)
            setVariations([])
        }
    }

    const fetchPredefinedAttributes = async (categoryId) => {
        if (!categoryId) {
            setPredefinedAttributes({})
            return
        }

        try {
            const response = await fetch(`${config.baseUrl}/PredefinedAttributes/${categoryId}`)

            if (response.ok) {
                const data = await response.json()
                if (data.attributes) {
                    setPredefinedAttributes(data.attributes)

                    // Reset attributes with first predefined keys
                    const predefinedKeys = Object.keys(data.attributes)
                    if (predefinedKeys.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            attributes: predefinedKeys.map(key => ({
                                key,
                                value: ''
                            }))
                        }))
                    }
                } else {
                    setPredefinedAttributes({})
                }
            } else {
                console.log('Predefined attributes API returned error')
                setPredefinedAttributes({})
            }
        } catch (error) {
            console.error('Error fetching predefined attributes:', error)
            setPredefinedAttributes({})
        }
    }

    const handleAttributeChange = (index, field, value) => {
        const updatedAttributes = [...formData.attributes]
        updatedAttributes[index][field] = value
        setFormData({
            ...formData,
            attributes: updatedAttributes
        })
    }

    const addAttributeField = () => {
        setFormData({
            ...formData,
            attributes: [...formData.attributes, { key: '', value: '' }]
        })
    }

    const removeAttributeField = (index) => {
        const updatedAttributes = [...formData.attributes]
        updatedAttributes.splice(index, 1)
        setFormData({
            ...formData,
            attributes: updatedAttributes
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(false)

        try {
            // Create FormData for file upload
            const form = new FormData()

            // Add all regular fields
            Object.keys(formData).forEach(key => {
                if (key !== 'attributes' && key !== 'itemPicture') {
                    form.append(key, formData[key])
                }
            })

            // Add file if exists
            if (formData.itemPicture) {
                form.append('itemPicture', formData.itemPicture)
            }

            // Add attributes
            formData.attributes.forEach((attr, index) => {
                if (attr.key && attr.value) {
                    form.append(`attributes[${index}][key]`, attr.key)
                    form.append(`attributes[${index}][value]`, attr.value)
                }
            })

            const vendor = JSON.parse(localStorage.getItem('vendor'))

            const response = await fetch(`${config.baseUrl}/vendor/${vendor.vendor_id}/shop/${shopId}/branch/${branchId}/item`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: form
            })

            const data = await response.json()

            if (response.ok) {
                setSubmitSuccess(true)
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    variation_name: '',
                    preparation_time: '',
                    timesensitive: 'No',
                    category_ID: '',
                    branches_ID: branchId,
                    additional_info: '',
                    itemPicture: null,
                    attributes: [{ key: '', value: '' }]
                })
                // Refresh items list
                fetchItems(shopId, branchId)
                // Close modal after short delay
                setTimeout(() => {
                    setIsModalOpen(false)
                    setSubmitSuccess(false)
                }, 1500)
            } else {
                setSubmitError(data.message || 'Failed to add item. Please try again.')
            }
        } catch (error) {
            console.error('Error adding item:', error)
            setSubmitError('An error occurred while adding the item.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const openStatusModal = (order) => {
        setSelectedOrder(order)
        setUpdatedStatus(order.suborder_status)
        setIsModalOpen(true)
        setUpdateError(null)
    }

    const closeStatusModal = () => {
        setIsModalOpen(false)
        setSelectedOrder(null)
        setUpdatedStatus('')
        setIsUpdating(false)
        setUpdateError(null)
    }

    const updateOrderStatus = async (status) => {
        if (!selectedOrder) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            const token = localStorage.getItem('token');
            const statusEndpoints = {
                'in_progress': `/vendor/order/${selectedOrder.suborder_id}/in-progress`,
                'ready': `/vendor/order/${selectedOrder.suborder_id}/ready`,
                'handover_confirmed': `/vendor/order/${selectedOrder.suborder_id}/handover`
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
            setBranchOrders(prevOrders => prevOrders.map(order =>
                order.suborder_id === selectedOrder.suborder_id
                    ? { ...order, suborder_status: status }
                    : order
            ));

            closeStatusModal();
        } catch (error) {
            console.error('Error updating order status:', error);
            setUpdateError(error.message || 'Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    // Add a function to confirm payment
    const confirmPayment = async () => {
        if (!selectedOrder) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.baseUrl}/vendor/confirm-payment/${selectedOrder.suborder_id}`, {
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
            setBranchOrders(prevOrders => prevOrders.map(order =>
                order.suborder_id === selectedOrder.suborder_id
                    ? { ...order, payment_status: 'confirmed_by_vendor' }
                    : order
            ));

            closeStatusModal();
        } catch (error) {
            console.error('Error confirming payment:', error);
            setUpdateError(error.message || 'Failed to confirm payment');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between bg-white p-4 border-b">
                <div className="flex items-center">
                    <Link to="/vendor/dashboard" className="text-gray-500 hover:text-primary-600">Dashboard</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <Link to={`/vendor/shop/${shopId}`} className="text-gray-500 hover:text-primary-600">Shop</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-800 font-semibold">Branch #{branchId}</span>
                </div>
                <div>
                    {!loadingShops && !shopsError && shops.length > 0 && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg flex items-center shadow-md transition-all hover:shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Item
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4">
                {/* Shops Loading or Error State */}
                {loadingShops && (
                    <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading shops...</span>
                    </div>
                )}

                {shopsError && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="bg-red-50 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{shopsError}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Shops Found */}
                {!loadingShops && !shopsError && shops.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-lg text-gray-600 mb-4">You don't have any shops yet.</p>
                        <Link to="/vendor/dashboard"
                            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all inline-block">
                            Create a Shop
                        </Link>
                    </div>
                )}

                {/* Tabs Section - Only show if shops exist */}
                {!loadingShops && !shopsError && shops.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Branch #{branchId}</h2>
                                {activeTab === 'items' && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg flex items-center shadow-md transition-all hover:shadow-lg"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Item
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <div className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('items')}
                                        className={`flex items-center py-4 px-4 font-medium text-base relative transition-colors ${activeTab === 'items'
                                            ? 'text-primary-600'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === 'items' ? 'text-primary-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                        </svg>
                                        Items
                                        {activeTab === 'items' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-md"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`flex items-center py-4 px-4 font-medium text-base relative transition-colors ${activeTab === 'orders'
                                            ? 'text-primary-600'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === 'orders' ? 'text-primary-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Orders
                                        {activeTab === 'orders' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-md"></div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Items Tab Content */}
                            {activeTab === 'items' && (
                                <>
                                    {error && (
                                        <div className="bg-red-50 p-4 rounded-md mb-6">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-red-700">{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isLoadingItems ? (
                                        <div className="flex justify-center items-center h-32">
                                            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Loading items...</span>
                                        </div>
                                    ) : items.length === 0 ? (
                                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                                            <p className="text-lg text-gray-600 mb-4">No items found for this branch.</p>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
                                                Add Your First Item
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {items.map(item => (
                                                <div key={item.item_id} className="bg-white border rounded-lg shadow overflow-hidden">
                                                    {item.picture && (
                                                        <div className="h-48 bg-gray-200 overflow-hidden">
                                                            <img
                                                                src={item.picture}
                                                                alt={item.item_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-800">{item.item_name}</h4>
                                                            <span className="text-primary-600 font-medium">
                                                                {item.price ? `Rs.${parseFloat(item.price).toFixed(2)}` : 'N/A'}
                                                            </span>
                                                        </div>

                                                        {item.variation_name && (
                                                            <div className="mb-2">
                                                                <span className="text-sm text-gray-500">Variation:</span>
                                                                <span className="ml-1 text-sm text-gray-700">{item.variation_name}</span>
                                                            </div>
                                                        )}

                                                        {item.item_description && (
                                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.item_description}</p>
                                                        )}

                                                        {item.timesensitive === 1 && item.preparation_time && (
                                                            <div className="flex items-center text-xs text-gray-500 mt-2">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Prep time: {item.preparation_time} min
                                                            </div>
                                                        )}

                                                        {item.timesensitive === 1 && (
                                                            <div className="flex items-center text-xs text-yellow-600 mt-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                </svg>
                                                                Time-sensitive item
                                                            </div>
                                                        )}

                                                        {item.attributes && item.attributes.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                                <span className="text-xs font-medium text-gray-500">Attributes:</span>
                                                                <div className="mt-1 space-y-1">
                                                                    {item.attributes.map((attr, index) => (
                                                                        <div key={index} className="flex text-xs">
                                                                            <span className="text-gray-500">{attr.key}:</span>
                                                                            <span className="ml-1 text-gray-700">{attr.value}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-gray-50 p-3 border-t text-right">
                                                        <button className="text-primary-600 hover:bg-primary-50 font-medium text-sm px-3 py-1 rounded transition-colors">
                                                            Edit Item
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Orders Tab Content */}
                            {activeTab === 'orders' && (
                                <>
                                    {orderError && (
                                        <div className="bg-red-50 p-4 rounded-md mb-6">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-red-700">{orderError}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isLoadingOrders ? (
                                        <div className="flex justify-center items-center h-32">
                                            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Loading orders...</span>
                                        </div>
                                    ) : branchOrders.length === 0 ? (
                                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                                            <div className="text-gray-400 mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <p className="text-xl font-medium mb-2">No orders yet</p>
                                            <p className="text-gray-500">When customers place orders for items in this branch, they'll appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {branchOrders.map((order) => (
                                                <div key={order.suborder_id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 text-sm mr-2">Order</span>
                                                            <span className="font-medium">#{order.suborder_id}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.suborder_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                order.suborder_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    order.suborder_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                        order.suborder_status === 'ready' ? 'bg-green-100 text-green-800' :
                                                                            order.suborder_status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                                                                                order.suborder_status === 'handover_confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                                                                    order.suborder_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {order.suborder_status || 'Unknown'}
                                                            </span>

                                                            {order.payment_status && (
                                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.payment_status === 'confirmed_by_vendor' ? 'bg-green-100 text-green-800' :
                                                                        order.payment_status === 'confirmed_by_deliveryboy' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {order.payment_status === 'confirmed_by_vendor' ? 'Payment Confirmed' :
                                                                        order.payment_status === 'confirmed_by_deliveryboy' ? 'Payment Pending' :
                                                                            order.payment_status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="mb-3 pb-3 border-b border-gray-100">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-500">Total Amount</span>
                                                                <span className="font-bold text-lg text-primary-600">Rs.{parseFloat(order.suborder_total).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items ({order.order_details.length})</h4>
                                                            <div className="space-y-3">
                                                                {order.order_details.map((detail, idx) => (
                                                                    <div key={idx} className="flex items-center bg-gray-50 p-2 rounded-lg">
                                                                        <div className="flex-shrink-0">
                                                                            {detail.item_picture ? (
                                                                                <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden">
                                                                                    <img
                                                                                        src={detail.item_picture}
                                                                                        alt="Item"
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="ml-3 flex-1">
                                                                            <div className="flex justify-between">
                                                                                <div className="text-sm font-medium">Qty: {detail.quantity}</div>
                                                                                <div className="text-sm">Rs.{parseFloat(detail.price).toFixed(2)} each</div>
                                                                            </div>
                                                                            <div className="flex justify-between items-center mt-1">
                                                                                <div className="text-xs text-gray-500">Item #{detail.order_detail_id}</div>
                                                                                <div className="text-sm font-medium">Rs.{parseFloat(detail.order_detail_total).toFixed(2)}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                                                        <button
                                                            onClick={() => openStatusModal(order)}
                                                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                        >
                                                            Update Order Status
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Add New Item</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {submitError && (
                                <div className="bg-red-50 p-4 rounded-md mb-6">
                                    <p className="text-sm text-red-700">{submitError}</p>
                                </div>
                            )}

                            {submitSuccess && (
                                <div className="bg-green-50 p-4 rounded-md mb-6">
                                    <p className="text-sm text-green-700">Item added successfully!</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        name="category_ID"
                                        value={formData.category_ID}
                                        onChange={(e) => {
                                            handleInputChange(e)
                                            if (e.target.value) {
                                                fetchVariations(e.target.value)
                                                fetchPredefinedAttributes(e.target.value)
                                            }
                                        }}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Variation Name</label>
                                    <select
                                        name="variation_name"
                                        value={formData.variation_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        disabled={!formData.category_ID || variations.length === 0}
                                    >
                                        <option value="">Select a variation</option>
                                        {variations.map((variation, index) => (
                                            <option key={index} value={variation.name}>
                                                {variation.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Sensitive</label>
                                    <select
                                        name="timesensitive"
                                        value={formData.timesensitive}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                {formData.timesensitive === 'Yes' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="preparation_time"
                                        value={formData.preparation_time}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
                                    <input
                                        type="text"
                                        name="additional_info"
                                        value={formData.additional_info}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Picture</label>
                                    <input
                                        type="file"
                                        name="itemPicture"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">Attributes</label>
                                        {Object.keys(predefinedAttributes).length === 0 && (
                                            <button
                                                type="button"
                                                onClick={addAttributeField}
                                                className="bg-primary-50 text-primary-600 px-2 py-1 rounded text-sm hover:bg-primary-100"
                                            >
                                                + Add Custom Attribute
                                            </button>
                                        )}
                                    </div>

                                    {formData.attributes.map((attr, index) => (
                                        <div key={index} className="flex gap-3 mb-2">
                                            <div className="flex-1">
                                                {Object.keys(predefinedAttributes).length > 0 ? (
                                                    <input
                                                        type="text"
                                                        value={attr.key}
                                                        disabled
                                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md"
                                                    />
                                                ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Key"
                                                            value={attr.key}
                                                            onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                        />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                {predefinedAttributes[attr.key] ? (
                                                    <select
                                                        value={attr.value}
                                                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="">Select a value</option>
                                                        {predefinedAttributes[attr.key].map((value, idx) => (
                                                            <option key={idx} value={value}>
                                                                {value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Value"
                                                            value={attr.value}
                                                            onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                        />
                                                )}
                                            </div>
                                            {Object.keys(predefinedAttributes).length === 0 && index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttributeField(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-70 flex items-center"
                                >
                                    {isSubmitting && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isSubmitting ? 'Saving...' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
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
                            <p className="text-sm text-gray-500 mb-2">Order #{selectedOrder.suborder_id}</p>
                            <div className="bg-gray-50 p-3 rounded-md mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Current Status:</span>
                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${selectedOrder.suborder_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedOrder.suborder_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            selectedOrder.suborder_status === 'ready' ? 'bg-green-100 text-green-800' :
                                                selectedOrder.suborder_status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                                                    selectedOrder.suborder_status === 'handover_confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                                        selectedOrder.suborder_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedOrder.suborder_status || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {selectedOrder.suborder_status === 'pending' && (
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

                                {selectedOrder.suborder_status === 'in_progress' && (
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

                                {selectedOrder.suborder_status === 'picked_up' && (
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

                                {selectedOrder.payment_status === 'confirmed_by_deliveryboy' && (
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

                                {(selectedOrder.suborder_status !== 'pending' &&
                                    selectedOrder.suborder_status !== 'in_progress' &&
                                    selectedOrder.suborder_status !== 'picked_up' &&
                                    selectedOrder.payment_status !== 'confirmed_by_deliveryboy') && (
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
        </>
    )
}

export default BranchDetail 