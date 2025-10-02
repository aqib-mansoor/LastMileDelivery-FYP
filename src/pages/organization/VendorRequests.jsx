import { useState, useEffect, Fragment } from 'react'
import { useOutletContext } from 'react-router-dom'
import config from '../../api/config'

function VendorRequests() {
  const { user } = useOutletContext()
  const [pendingRequests, setPendingRequests] = useState([])
  const [approvedRequests, setApprovedRequests] = useState([])
  const [rejectedRequests, setRejectedRequests] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionReasons, setRejectionReasons] = useState([''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const organization = JSON.parse(localStorage.getItem('organization'))
    const fetchVendorRequests = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${config.baseUrl}/pending-vendor-requests/${organization.organization_id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        setPendingRequests(data.pending_requests || [])
        setApprovedRequests(data.approved_requests || [])
        setRejectedRequests(data.rejected_requests || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching pending vendor requests:', err)
        setError('Failed to load vendor requests. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    if (organization) {
      fetchVendorRequests()
    }
  }, []) // No dependencies as we're getting organization from localStorage

  const handleAcceptRequest = async (requestId) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `${config.baseUrl}/accept-vendor-request/${requestId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`)
      }
      
      // Get the request that was processed
      const processedRequest = pendingRequests.find(req => req.request_id === requestId)
      
      // Update the UI by removing the processed request from pending
      setPendingRequests(pendingRequests.filter(req => req.request_id !== requestId))
      
      // Add the request to the approved list
      setApprovedRequests([...approvedRequests, {...processedRequest, approval_status: 'approved'}])
      
      alert('Vendor request accepted successfully')
    } catch (err) {
      console.error('Error accepting vendor request:', err)
      alert(`Failed to accept request: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const openRejectionModal = (request) => {
    setSelectedRequest(request)
    setRejectionReasons([''])
    setIsRejectionModalOpen(true)
  }
  
  const closeRejectionModal = () => {
    setIsRejectionModalOpen(false)
    setSelectedRequest(null)
  }
  
  const handleRejectionReasonChange = (index, value) => {
    const updatedReasons = [...rejectionReasons]
    updatedReasons[index] = value
    setRejectionReasons(updatedReasons)
  }
  
  const addRejectionReason = () => {
    setRejectionReasons([...rejectionReasons, ''])
  }
  
  const removeRejectionReason = (index) => {
    if (rejectionReasons.length > 1) {
      const updatedReasons = [...rejectionReasons]
      updatedReasons.splice(index, 1)
      setRejectionReasons(updatedReasons)
    }
  }
  
  const handleRejectRequest = async () => {
    // Filter out empty reasons
    const filteredReasons = rejectionReasons.filter(reason => reason.trim() !== '')
    
    if (filteredReasons.length === 0) {
      alert('Please provide at least one rejection reason')
      return
    }
    
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `${config.baseUrl}/reject-vendor-request/${selectedRequest.request_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rejection_reasons: filteredReasons
          })
        }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`)
      }
      
      // Update the UI by removing the processed request from pending
      setPendingRequests(pendingRequests.filter(req => req.request_id !== selectedRequest.request_id))
      
      // Add the request to the rejected list
      setRejectedRequests([...rejectedRequests, {...selectedRequest, approval_status: 'rejected'}])
      
      // Close the modal
      closeRejectionModal()
      
      alert('Vendor request rejected successfully')
    } catch (err) {
      console.error('Error rejecting vendor request:', err)
      alert(`Failed to reject request: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg">Loading vendor requests...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Vendor Requests</h1>
      
      {/* Tabs */}
      <div className="border-b border-primary-100 mb-6 bg-white rounded-t-lg shadow-sm">
        <nav className="flex flex-col sm:flex-row gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${activeTab === 'pending' 
              ? 'border-primary-600 text-primary-700 bg-primary-50' 
              : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50'} 
              whitespace-nowrap py-4 px-4 sm:px-6 border-b-2 sm:border-b-2 border-l-0 sm:border-l-0 font-medium text-sm flex-1 transition-all duration-200 text-center sm:text-left`}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pending</span>
              {pendingRequests.length > 0 && (
                <span className="ml-2 py-0.5 px-2 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                  {pendingRequests.length}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('approved')}
            className={`${activeTab === 'approved' 
              ? 'border-primary-600 text-primary-700 bg-primary-50' 
              : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50'} 
              whitespace-nowrap py-4 px-4 sm:px-6 border-b-2 sm:border-b-2 border-l-0 sm:border-l-0 font-medium text-sm flex-1 transition-all duration-200 text-center sm:text-left`}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Approved</span>
              {approvedRequests.length > 0 && (
                <span className="ml-2 py-0.5 px-2 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                  {approvedRequests.length}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('rejected')}
            className={`${activeTab === 'rejected' 
              ? 'border-primary-600 text-primary-700 bg-primary-50' 
              : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50'} 
              whitespace-nowrap py-4 px-4 sm:px-6 border-b-2 sm:border-b-2 border-l-0 sm:border-l-0 font-medium text-sm flex-1 transition-all duration-200 text-center sm:text-left`}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Rejected</span>
              {rejectedRequests.length > 0 && (
                <span className="ml-2 py-0.5 px-2 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                  {rejectedRequests.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'pending' && (
        pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <div key={request.request_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                <div className="p-6">
                  {/* Vendor Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      {request.vendor_profile_picture ? (
                        <img 
                          className="h-12 w-12 rounded-full object-cover" 
                          src={request.vendor_profile_picture} 
                          alt={request.vendor_name} 
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium text-lg">
                            {request.vendor_name ? request.vendor_name.charAt(0).toUpperCase() : 'V'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.vendor_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {request.vendor_id}
                      </p>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {request.vendor_email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {request.vendor_phone}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAcceptRequest(request.request_id)}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isSubmitting ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => openRejectionModal(request)}
                      disabled={isSubmitting}
                      className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600">No pending vendor requests found.</p>
          </div>
        )
      )}
      
      {activeTab === 'approved' && (
        approvedRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedRequests.map((request) => (
              <div key={request.request_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border-l-4 border-green-500">
                <div className="p-6">
                  {/* Vendor Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      {request.vendor_profile_picture ? (
                        <img 
                          className="h-12 w-12 rounded-full object-cover" 
                          src={request.vendor_profile_picture} 
                          alt={request.vendor_name} 
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium text-lg">
                            {request.vendor_name ? request.vendor_name.charAt(0).toUpperCase() : 'V'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.vendor_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {request.vendor_id}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Approved
                      </span>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {request.vendor_email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {request.vendor_phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No approved requests</h3>
            <p className="text-gray-600">No approved vendor requests yet.</p>
          </div>
        )
      )}
      
      {activeTab === 'rejected' && (
        rejectedRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rejectedRequests.map((request) => (
              <div key={request.request_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border-l-4 border-red-500">
                <div className="p-6">
                  {/* Vendor Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      {request.vendor_profile_picture ? (
                        <img 
                          className="h-12 w-12 rounded-full object-cover" 
                          src={request.vendor_profile_picture} 
                          alt={request.vendor_name} 
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium text-lg">
                            {request.vendor_name ? request.vendor_name.charAt(0).toUpperCase() : 'V'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.vendor_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {request.vendor_id}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Rejected
                      </span>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {request.vendor_email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {request.vendor_phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected requests</h3>
            <p className="text-gray-600">No rejected vendor requests.</p>
          </div>
        )
      )}
      
      {/* Rejection Modal - Portal Implementation */}
      {isRejectionModalOpen && (
        <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 9999 }}>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeRejectionModal}></div>
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            {/* Modal Content */}
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" 
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Reject Vendor Request</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Please provide reasons for rejecting the request from {selectedRequest?.vendor_name}.
                  </p>
                </div>
                <button 
                  onClick={closeRejectionModal} 
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isSubmitting}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {rejectionReasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => handleRejectionReasonChange(index, e.target.value)}
                        placeholder={`Reason ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeRejectionReason(index)}
                        disabled={rejectionReasons.length <= 1}
                        className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addRejectionReason}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Another Reason
                  </button>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeRejectionModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectRequest}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorRequests
