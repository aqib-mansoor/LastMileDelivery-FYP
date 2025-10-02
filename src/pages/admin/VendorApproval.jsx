import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import config from '../../api/config'

function VendorApproval() {
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        // Fetch vendors
        fetchVendors()
    }, [])

    const fetchVendors = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${config.baseUrl}/admin/vendors`)
            if (!response.ok) {
                throw new Error('Failed to fetch vendors')
            }
            const data = await response.json()
            setVendors(data)
        } catch (error) {
            console.error('Error fetching vendors:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (vendor) => {
        // API call to approve vendor
        try {
            const response = await fetch(`${config.baseUrl}/admin/vendors/${vendor.vendor_id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error('Failed to approve vendor')
            }

        // Update local state
            const updatedVendors = vendors.map(v =>
                v.vendor_id === vendor.vendor_id ? { ...v, approval_status: 'approved' } : v
            )
            setVendors(updatedVendors)
        } catch (error) {
            console.error('Error approving vendor:', error)
        }
    }

    const openRejectModal = (vendor) => {
        setSelectedVendor(vendor)
        setRejectReason('')
        setIsModalOpen(true)
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) return

        try {
            const response = await fetch(`${config.baseUrl}/admin/vendors/${selectedVendor.vendor_id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: rejectReason })
            })

            if (!response.ok) {
                throw new Error('Failed to reject vendor')
            }

            // Update local state
            const updatedVendors = vendors.map(v =>
                v.vendor_id === selectedVendor.vendor_id ? { ...v, approval_status: 'rejected', rejectReason } : v
            )
            setVendors(updatedVendors)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error rejecting vendor:', error)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
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
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                        <li key={vendor.vendor_id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <p className="text-sm font-medium text-primary truncate">{vendor.name}</p>
                                        <p className="mt-1 sm:mt-0 sm:ml-2 text-xs text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
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
                                {vendor.approval_status === 'rejected' && vendor.rejectReason && (
                                    <div className="mt-2 text-sm text-red-600">
                                        <p>Reason: {vendor.rejectReason}</p>
                                    </div>
                                )}
                                {vendor.profile_picture && (
                                    <div className="mt-2">
                                        <img
                                            src={vendor.profile_picture}
                                            alt={`${vendor.name}'s profile`}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Reject Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Vendor</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejecting <span className="font-semibold">{selectedVendor?.name}</span>
                        </p>
                        <textarea
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            rows="3"
                            placeholder="Enter rejection reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>
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
                                onClick={closeModal}
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

export default VendorApproval 