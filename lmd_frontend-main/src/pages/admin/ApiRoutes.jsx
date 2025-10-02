import { useState, useEffect } from 'react'
import { EyeIcon, PencilIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import config from '../../api/config'

function ApiRoutes() {
    const [apiVendors, setApiVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBranch, setSelectedBranch] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [integrationDetails, setIntegrationDetails] = useState(null)
    const [expandedVendors, setExpandedVendors] = useState({})
    const [vendorShops, setVendorShops] = useState({})
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [rejectReasons, setRejectReasons] = useState([''])
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)

    useEffect(() => {
        fetchApiVendors()
    }, [])

    const fetchApiVendors = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${config.baseUrl}/admin/api-vendors`)
            if (!response.ok) {
                throw new Error('Failed to fetch API vendors')
            }
            const data = await response.json()
            setApiVendors(data)
        } catch (error) {
            console.error('Error fetching API vendors:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchVendorShops = async (vendorId) => {
        try {
            const response = await fetch(`${config.baseUrl}/admin/vendor/${vendorId}/shops`)
            if (!response.ok) {
                throw new Error('Failed to fetch vendor shops')
            }
            const shops = await response.json()
            
            // Fetch branches for each shop
            const shopsWithBranches = await Promise.all(
                shops.map(async (shop) => {
                    try {
                        const branchResponse = await fetch(`${config.baseUrl}/admin/vendor/${vendorId}/shop/${shop.id}/branches`)
                        if (branchResponse.ok) {
                            const branches = await branchResponse.json()
                            return { ...shop, branches }
                        }
                        return { ...shop, branches: [] }
                    } catch (error) {
                        console.error('Error fetching branches for shop:', shop.id, error)
                        return { ...shop, branches: [] }
                    }
                })
            )
            
            setVendorShops(prev => ({ ...prev, [vendorId]: shopsWithBranches }))
        } catch (error) {
            console.error('Error fetching vendor shops:', error)
        }
    }

    const toggleVendorExpansion = async (vendorId) => {
        const isExpanded = expandedVendors[vendorId]
        setExpandedVendors(prev => ({ ...prev, [vendorId]: !isExpanded }))
        
        if (!isExpanded && !vendorShops[vendorId]) {
            await fetchVendorShops(vendorId)
        }
    }

    const handleApprove = async (vendor) => {
        try {
            const response = await fetch(`${config.baseUrl}/vendors/${vendor.id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            console.log(response)

            if (!response.ok) {
                throw new Error('Failed to approve vendor')
            }

            // Update local state
            const updatedVendors = apiVendors.map(v =>
                v.vendor_ID === vendor.vendor_ID ? { ...v, approval_status: 'approved' } : v
            )
            setApiVendors(updatedVendors)
        } catch (error) {
            console.error('Error approving vendor:', error)
        }
    }

    const openRejectModal = (vendor) => {
        setSelectedVendor(vendor)
        setRejectReasons([''])
        setIsRejectModalOpen(true)
    }

    const handleReject = async () => {
        if (!rejectReasons.some(reason => reason.trim())) return

        const filteredReasons = rejectReasons.filter(reason => reason.trim())

        try {
            const response = await fetch(`${config.baseUrl}/admin/vendors/${selectedVendor.vendor_ID}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejection_reasons: filteredReasons })
            })

            if (!response.ok) {
                throw new Error('Failed to reject vendor')
            }

            // Update local state
            const updatedVendors = apiVendors.map(v =>
                v.vendor_ID === selectedVendor.vendor_ID ? { ...v, approval_status: 'rejected' } : v
            )
            setApiVendors(updatedVendors)
            setIsRejectModalOpen(false)
        } catch (error) {
            console.error('Error rejecting vendor:', error)
        }
    }

    const closeRejectModal = () => {
        setIsRejectModalOpen(false)
        setSelectedVendor(null)
        setRejectReasons([''])
    }

    const addRejectReason = () => {
        setRejectReasons([...rejectReasons, ''])
    }

    const updateRejectReason = (index, value) => {
        const updated = [...rejectReasons]
        updated[index] = value
        setRejectReasons(updated)
    }

    const removeRejectReason = (index) => {
        if (rejectReasons.length > 1) {
            const updated = rejectReasons.filter((_, i) => i !== index)
            setRejectReasons(updated)
        }
    }

    const handleViewIntegration = async (branchId, branchName) => {
        setSelectedBranch({ id: branchId, name: branchName })
        setIsViewModalOpen(true)
        
        // Fetch integration details for this branch
        try {
            const response = await fetch(`${config.baseUrl}/admin/api-vendor/${branchId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch integration details')
            }
            const data = await response.json()
            setIntegrationDetails(data.data)
        } catch (error) {
            console.error('Error fetching integration details:', error)
            setIntegrationDetails(null)
        }
    }

    const closeViewModal = () => {
        setIsViewModalOpen(false)
        setSelectedBranch(null)
        setIntegrationDetails(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">API Vendor Management</h1>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add API Integration
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {apiVendors.map((vendor) => (
                        <li key={vendor.vendor_ID}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => toggleVendorExpansion(vendor.vendor_ID)}
                                                className="mr-2 p-1 rounded hover:bg-gray-100"
                                            >
                                                {expandedVendors[vendor.vendor_ID] ? (
                                                    <ChevronDownIcon className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRightIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                            <p className="text-sm font-medium text-primary truncate">{vendor.name}</p>
                                        </div>
                                        <p className="mt-1 sm:mt-0 sm:ml-2 text-xs text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                vendor.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                vendor.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {vendor.approval_status}
                                            </span>
                                        </p>
                                    </div>
                                    {vendor.approval_status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(vendor)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                <CheckCircleIcon className="mr-1 h-4 w-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(vendor)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <XCircleIcon className="mr-1 h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            {vendor.email}
                                        </p>
                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                            {vendor.phone_no}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <p>
                                            Type: {vendor.vendor_type}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">CNIC: {vendor.cnic}</p>
                                </div>
                                {vendor.profile_picture && (
                                    <div className="mt-2">
                                        <img
                                            src={vendor.profile_picture}
                                            alt={`${vendor.name}'s profile`}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                {/* Expanded content showing shops and branches */}
                                {expandedVendors[vendor.vendor_ID] && vendorShops[vendor.vendor_ID] && (
                                    <div className="mt-4 ml-6 border-l-2 border-gray-200 pl-4">
                                        {vendorShops[vendor.vendor_ID].map((shop) => (
                                            <div key={shop.id} className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                    Shop: {shop.name} ({shop.category_name})
                                                </h4>
                                                {shop.branches && shop.branches.length > 0 ? (
                                                    <div className="ml-4 space-y-2">
                                                        {shop.branches.map((branch) => (
                                                            <div key={branch.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Branch: {branch.description}</p>
                                                                    <p className="text-xs text-gray-500">Status: {branch.approval_status}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleViewIntegration(branch.id, branch.description)}
                                                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <EyeIcon className="mr-1 h-3 w-3" />
                                                                    View API
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="ml-4 text-sm text-gray-500">No branches found</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reject API Vendor</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide reasons for rejecting <span className="font-semibold">{selectedVendor?.name}</span>
                        </p>
                        
                        <div className="space-y-3">
                            {rejectReasons.map((reason, index) => (
                                <div key={index} className="flex space-x-2">
                                    <textarea
                                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        rows="2"
                                        placeholder={`Rejection reason ${index + 1}`}
                                        value={reason}
                                        onChange={(e) => updateRejectReason(index, e.target.value)}
                                    ></textarea>
                                    {rejectReasons.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRejectReason(index)}
                                            className="px-2 py-1 text-red-600 hover:text-red-800"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <button
                            type="button"
                            onClick={addRejectReason}
                            className="mt-3 text-sm text-primary hover:text-primary-dark"
                        >
                            + Add another reason
                        </button>
                        
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={handleReject}
                            >
                                Reject
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                                onClick={closeRejectModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Integration Modal */}
            {isViewModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            API Integration Details - {selectedBranch?.name}
                        </h3>
                        
                        {integrationDetails ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">API Key</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {integrationDetails.api_key || 'Not configured'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Base URL</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {integrationDetails.api_base_url || 'Not configured'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Auth Method</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {integrationDetails.api_auth_method || 'Not configured'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">API Version</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {integrationDetails.api_version || 'Not configured'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Integration Status</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {integrationDetails.vendor_integration_status || 'Not configured'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Response Format</label>
                                        <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {integrationDetails.response_format || 'Not configured'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No API integration found for this branch</p>
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                onClick={closeViewModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ApiRoutes 