import { useState, useEffect } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import config from '../../api/config'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'

function LmdSettings() {
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingField, setEditingField] = useState(null)
    const [formData, setFormData] = useState({
        value: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${config.baseUrl}/admin/lmd-settings`)
            if (!response.ok) {
                // If settings don't exist yet, use default values
                console.warn('Settings not found, using defaults')
                setSettings({
                    order_charge: 0,
                    tax_percentage: 0,
                    pickup_radius_km: 0
                })
            } else {
                const data = await response.json()
                if (data.success && data.data) {
                    setSettings(data.data)
                } else {
                    // Use defaults if no data
                    setSettings({
                        order_charge: 0,
                        tax_percentage: 0,
                        pickup_radius_km: 0
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            // Still allow the page to load with defaults
            setSettings({
                order_charge: 0,
                tax_percentage: 0,
                pickup_radius_km: 0
            })
            setError(null) // Don't show error, just use defaults
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (field, currentValue) => {
        setEditingField(field)
        setFormData({ value: currentValue || '' })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const endpoint = `/admin/lmd-settings/${editingField}`
            const response = await fetch(`${config.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            console.log("response", response)

            if (!response.ok) {
                throw new Error('Failed to update setting')
            }

            const result = await response.json()
            if (result.success) {
                setSettings(result.data)
                setIsModalOpen(false)
                setEditingField(null)
                setFormData({ value: '' })
            } else {
                throw new Error(result.message || 'Failed to update setting')
            }
        } catch (error) {
            console.error('Error updating setting:', error)
            alert('Failed to update setting. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingField(null)
        setFormData({ value: '' })
    }

    const getFieldLabel = (field) => {
        switch (field) {
            case 'order-charge':
                return 'Order Charge (%)'
            case 'tax-percentage':
                return 'Tax Percentage (%)'
            case 'pickup-radius':
                return 'Pickup Radius (km)'
            default:
                return field
        }
    }

    const getFieldValue = (field) => {
        if (!settings) return 'N/A'
        switch (field) {
            case 'order-charge':
                return settings.order_charge || 0
            case 'tax-percentage':
                return settings.tax_percentage || 0
            case 'pickup-radius':
                return settings.pickup_radius_km || 0
            default:
                return 'N/A'
        }
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
                        <h3 className="text-sm font-medium text-red-800">Error loading settings</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                            <button 
                                onClick={fetchSettings}
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
                <h1 className="text-3xl font-bold text-gray-900">LMD Settings</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Manage system-wide settings for order charges, taxes, and pickup radius.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Order Charge Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Order Charge
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit('order-charge', getFieldValue('order-charge'))}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {getFieldValue('order-charge')}%
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Commission charged per order
                        </p>
                    </CardContent>
                </Card>

                {/* Tax Percentage Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Tax Percentage
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit('tax-percentage', getFieldValue('tax-percentage'))}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {getFieldValue('tax-percentage')}%
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Tax applied to orders
                        </p>
                    </CardContent>
                </Card>

                {/* Pickup Radius Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Pickup Radius
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit('pickup-radius', getFieldValue('pickup-radius'))}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {getFieldValue('pickup-radius')} km
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Maximum pickup distance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {getFieldLabel(editingField)}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="value">
                                {getFieldLabel(editingField)}
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                min="0"
                                max={editingField === 'pickup-radius' ? undefined : "100"}
                                value={formData.value}
                                onChange={(e) => setFormData({ value: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default LmdSettings 