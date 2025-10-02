import { useState, useEffect } from 'react'
import config from '../../api/config'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

function LmdEarnings() {
    const [earnings, setEarnings] = useState([])
    const [totalEarning, setTotalEarning] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchEarnings()
    }, [])

    const fetchEarnings = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${config.baseUrl}/admin/lmd-earnings`)
            console.log("response", response)
            if (!response.ok) {
                // If earnings don't exist yet, use empty data
                console.warn('Earnings not found, using empty data')
                setEarnings([])
                setTotalEarning(0)
            } else {
                const data = await response.json()
                if (data.success) {
                    setEarnings(data.data || [])
                    setTotalEarning(data.total_earning_after_tax || 0)
                } else {
                    // Use empty data if no success
                    setEarnings([])
                    setTotalEarning(0)
                }
            }
        } catch (error) {
            console.error('Error fetching earnings:', error)
            // Still allow the page to load with empty data
            setEarnings([])
            setTotalEarning(0)
            setError(null) // Don't show error, just use empty data
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading earnings</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                            <button 
                                onClick={fetchEarnings}
                                className="mt-2 text-red-800 hover:text-red-900 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">LMD Earnings</h1>
                <p className="mt-2 text-sm text-gray-700">
                    View total earnings and detailed breakdown of LMD earnings after tax.
                </p>
            </div>

            {/* Total Earnings Card */}
            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Earnings (After Tax)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-600">
                            {formatCurrency(totalEarning)}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Total earnings from {earnings.length} transactions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Earnings History</CardTitle>
                </CardHeader>
                <CardContent>
                    {earnings.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No earnings data available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Earning Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tax Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Net Earning
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {earnings.map((earning) => (
                                        <tr key={earning.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{earning.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {earning.order_id ? `#${earning.order_id}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(earning.lmd_earning_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                -{formatCurrency(earning.tax_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                {formatCurrency(earning.lmd_earning_amount - earning.tax_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(earning.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default LmdEarnings 