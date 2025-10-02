import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import config from '../../api/config'

function BranchApproval() {
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBranch, setSelectedBranch] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        // Fetch branches
        fetchBranches()
    }, [])

    const fetchBranches = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${config.baseUrl}/admin/branches/pendingBranches`)
            if (!response.ok) {
                throw new Error('Failed to fetch branches')
            }
            const data = await response.json()
            setBranches(data.pending_branches || [])
        } catch (error) {
            console.error('Error fetching branches:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (branch) => {
        try {
            const response = await fetch(`${config.baseUrl}/admin/branches/${branch.branch_id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                throw new Error('Failed to approve branch')
            }

            // Update local state
            const updatedBranches = branches.map(b =>
                b.branch_id === branch.branch_id ? { ...b, branch_approval_status: 'approved' } : b
            )
            setBranches(updatedBranches)
        } catch (error) {
            console.error('Error approving branch:', error)
        }
    }

    const openRejectModal = (branch) => {
        console.log('Opening reject modal for branch:', branch);
        setSelectedBranch(branch)
        setRejectReason('')
        setIsModalOpen(true)
    }

    const handleReject = async () => {
        console.log('Handling rejection for branch:', selectedBranch);
        if (!rejectReason.trim()) {
            console.log('Rejection reason is empty');
            return;
        }

        if (!selectedBranch || !selectedBranch.branch_id) {
            console.error('Selected branch is not valid:', selectedBranch);
            alert('Cannot reject branch: Invalid branch selected');
            return;
        }

        try {
            console.log('Sending rejection request with reason:', rejectReason);
            const response = await fetch(`${config.baseUrl}/admin/branches/${selectedBranch.branch_id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rejection_reasons: [rejectReason]
                })
            })

            let responseData;
            try {
                responseData = await response.json();
                console.log('Rejection response data:', responseData);
            } catch (e) {
                console.error('Failed to parse response JSON:', e);
            }

            console.log('Rejection response status:', response.status);

            if (!response.ok) {
                throw new Error(`Failed to reject branch: ${responseData?.message || 'Unknown error'}`)
            }

            // Update local state
            const updatedBranches = branches.map(b =>
                b.branch_id === selectedBranch.branch_id ? { ...b, branch_approval_status: 'rejected', rejectReason } : b
            )
            setBranches(updatedBranches)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error rejecting branch:', error)
            alert(`Failed to reject branch: ${error.message}`)
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
                    {branches.map((branch) => (
                        <li key={branch.branch_id} className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col sm:flex-row sm:items-center">
                                        <p className="text-sm font-medium text-primary truncate">{branch.shop_name}</p>
                                        <p className="mt-1 sm:mt-0 sm:ml-2 text-xs text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${branch.branch_approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                branch.branch_approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {branch.branch_approval_status}
                                            </span>
                                        </p>
                                    </div>
                                    {branch.branch_approval_status === 'pending' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(branch)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                <CheckCircleIcon className="mr-1 h-4 w-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(branch)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <XCircleIcon className="mr-1 h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex sm:flex-col">
                                        <p className="flex items-center text-sm text-gray-500">
                                            Vendor: {branch.vendor_name} ({branch.vendor_type})
                                        </p>
                                        <p className="mt-1 flex items-center text-sm text-gray-500">
                                            Category: {branch.shop_category}
                                        </p>
                                    </div>
                                    {branch.branch_picture && (
                                        <div className="mt-2 sm:mt-0">
                                            <img
                                                src={branch.branch_picture}
                                                alt="Branch"
                                                className="h-16 w-24 object-cover rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">{branch.area}, {branch.city}</p>
                                </div>
                                {branch.branch_description && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">{branch.branch_description}</p>
                                    </div>
                                )}
                                {branch.branch_approval_status === 'rejected' && branch.rejectReason && (
                                    <div className="mt-2 text-sm text-red-600">
                                        <p>Reason: {branch.rejectReason}</p>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Reject Modal */}
            {isModalOpen && selectedBranch && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Branch</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejecting <span className="font-semibold">{selectedBranch?.shop_name}</span>
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

export default BranchApproval