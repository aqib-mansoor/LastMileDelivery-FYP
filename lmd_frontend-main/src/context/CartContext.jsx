import { createContext, useState, useContext, useEffect } from 'react'
import config from '../api/config'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null)
    const [cartItems, setCartItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [cartCount, setCartCount] = useState(0)
    const [cartTotal, setCartTotal] = useState(0)
    const [customerData, setCustomerData] = useState(null)

    // Initialize or get cart for the current user
    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            const user = JSON.parse(userData)
            if (user && user.id) {
                // First get customer data to get the correct customer_id
                fetchCustomerData(user.id)
            }
        }
    }, [])

    // Get customer data to retrieve the correct customer_id
    const fetchCustomerData = async (userId) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${config.baseUrl}/customers/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch customer data')
            }

            const data = await response.json()
            setCustomerData(data)

            // After getting customer data, fetch cart details using the correct customer_id
            if (data && data.customer_id) {
                fetchCartDetails(data.customer_id)
            } else {
                console.error('No customer_id found in customer data')
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error fetching customer data:', error)
            setError(error.message)
            setIsLoading(false)
        }
    }

    const fetchCartDetails = async (customerId) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`${config.baseUrl}/cart/details?customer_id=${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) {
                if (response.status === 404) {
                    // Create a new cart if one doesn't exist
                    await createOrUpdateCart(customerId)
                    setCartItems([])
                    setCartCount(0)
                    setCartTotal(0)
                    setIsLoading(false)
                    return
                }
                throw new Error('Failed to fetch cart')
            }

            const data = await response.json()
            setCart(data.cart)

            // Extract items from suborders
            let allItems = []
            if (data.suborders && data.suborders.length > 0) {
                data.suborders.forEach(suborder => {
                    if (suborder.items && suborder.items.length > 0) {
                        // Add shop and branch info to each item
                        const itemsWithShopInfo = suborder.items.map(item => ({
                            ...item,
                            shop_id: suborder.shop_ID,
                            branch_id: suborder.branch_ID,
                            vendor_id: suborder.vendor_ID,
                            cart_suborders_ID: suborder.id
                        }))
                        allItems = [...allItems, ...itemsWithShopInfo]
                    }
                })
            }

            setCartItems(allItems)

            // Calculate cart count and total
            const count = allItems.reduce((sum, item) => sum + item.quantity, 0)
            const total = data.cart ? data.cart.total_amount : 0

            setCartCount(count)
            setCartTotal(total)
        } catch (error) {
            console.error('Error fetching cart:', error)
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const createOrUpdateCart = async (customerId) => {
        try {
            const response = await fetch(`${config.baseUrl}/cart/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ customer_id: customerId })
            })

            if (!response.ok) {
                throw new Error('Failed to create or update cart')
            }

            const data = await response.json()
            console.log('Cart create/update response:', data)

            setCart({
                id: data.cart_id,
                total_amount: 0,
                cart_status: 'pending'
            })

            return data.cart_id
        } catch (error) {
            console.error('Error creating/updating cart:', error)
            setError(error.message)
            return null
        }
    }

    const addToCart = async (item) => {
        const userData = localStorage.getItem('user')
        if (!userData || !customerData) {
            console.log("User not logged in")
            setError('User not logged in or customer data not available')
            return false
        }

        // Use the customer_id from customer data instead of the user.id
        const customerId = customerData.customer_id

        if (!customerId) {
            console.log("Customer id not found")
            setError('Customer ID not found')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            // First, ensure the cart exists or create one
            await createOrUpdateCart(customerId)

            console.log('Sending cart item to API:', {
                customer_id: customerId,
                vendor_id: item.vendorId,
                shop_id: item.shopId,
                branch_id: item.branchId,
                itemdetails_id: item.itemDetailId,
                quantity: item.quantity,
                price: item.price
            })

            const response = await fetch(`${config.baseUrl}/cart/add-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    vendor_id: item.vendorId,
                    shop_id: item.shopId,
                    branch_id: item.branchId,
                    itemdetails_id: item.itemDetailId,
                    quantity: item.quantity,
                    price: item.price
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to add item to cart')
            }

            const result = await response.json()
            console.log('Cart update result:', result)

            // Refresh cart details after adding item
            await fetchCartDetails(customerId)
            return true
        } catch (error) {
            console.error('Error adding to cart:', error)
            setError(error.message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const removeFromCart = async (itemId) => {
        if (!customerData || !customerData.customer_id) {
            setError('Customer data not available')
            return false
        }

        const customerId = customerData.customer_id
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${config.baseUrl}/cart/remove-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    cart_item_id: itemId
                })
            })

            if (!response.ok) {
                throw new Error('Failed to remove item from cart')
            }

            // Refresh cart details after removing item
            await fetchCartDetails(customerId)
            return true
        } catch (error) {
            console.error('Error removing from cart:', error)
            setError(error.message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const clearCart = async () => {
        if (!customerData || !customerData.customer_id) {
            setError('Customer data not available')
            return false
        }

        const customerId = customerData.customer_id
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${config.baseUrl}/cart/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    customer_id: customerId
                })
            })

            if (!response.ok) {
                throw new Error('Failed to clear cart')
            }

            setCartItems([])
            setCartCount(0)
            setCartTotal(0)
            return true
        } catch (error) {
            console.error('Error clearing cart:', error)
            setError(error.message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <CartContext.Provider value={{
            cart,
            cartItems,
            cartCount,
            cartTotal,
            isLoading,
            error,
            addToCart,
            removeFromCart,
            clearCart,
            fetchCartDetails,
            customerData
        }}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext 