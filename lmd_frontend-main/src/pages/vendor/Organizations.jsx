import { useOutletContext } from 'react-router-dom'
import useOrganizations from '../../hooks/useOrganizations'

function Organizations() {

    const {
        availableOrganizations,
        requestedOrConnectedOrganizations,
        isLoading,
        error,
        handleSendRequest
    } = useOrganizations();

    const renderOrganizationCard = (organization, isRequested = false) => {
        return (
            <div key={organization.organization_id} className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {organization.profile_picture ? (
                            <img 
                                src={organization.profile_picture} 
                                alt={organization.name} 
                                className="h-12 w-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xl font-semibold">
                                    {organization.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{organization.name}</h3>
                        <p className="text-sm text-gray-600">{organization.email}</p>
                        {organization.phone_no && (
                            <p className="text-sm text-gray-600">{organization.phone_no}</p>
                        )}
                    </div>
                    <div>
                        {isRequested ? (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                organization.approval_status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : organization.approval_status === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {organization.approval_status === 'approved' 
                                    ? 'Approved' 
                                    : organization.approval_status === 'rejected'
                                        ? 'Rejected'
                                        : 'Pending'}
                            </span>
                        ) : (
                            <button
                                onClick={() => handleSendRequest(organization.organization_id)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            >
                                Connect
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg">Loading organizations...</span>
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
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Organizations</h1>
            
            <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-700 mb-4">Available Organizations</h2>
                {availableOrganizations.length > 0 ? (
                    <div>
                        {availableOrganizations.map(org => renderOrganizationCard(org))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No available organizations found.</p>
                )}
            </div>
            
            <div>
                <h2 className="text-xl font-medium text-gray-700 mb-4">Requested or Connected Organizations</h2>
                {requestedOrConnectedOrganizations.length > 0 ? (
                    <div>
                        {requestedOrConnectedOrganizations.map(org => renderOrganizationCard(org, true))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No requested or connected organizations.</p>
                )}
            </div>
        </div>
    )
}

export default Organizations
