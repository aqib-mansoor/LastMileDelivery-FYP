import { useState, useEffect } from 'react'
import config from '../api/config'

const useOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrders = async () => {
            const user = JSON.parse(localStorage.getItem('user'))
            const userId = user?.id
            if (!userId) return

            try {
                setLoading(true)
                const response = await fetch(`${config.baseUrl}/deliveryboy/ready-suborders/${userId}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch orders')
                }

                const data = await response.json()

                if (data.status === 'success') {
                    setOrders(data.data)
                } else {
                    throw new Error(data.message || 'Failed to fetch orders')
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    return { orders, loading, error }
}

export default useOrders 