import { useState, useEffect } from 'react';
import config from '../api/config';

const useOrganizations = () => {
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [requestedOrConnectedOrganizations, setRequestedOrConnectedOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrganizations = async () => {
            const vendor = JSON.parse(localStorage.getItem('vendor'));
            const vendorId = vendor.vendor_id;
            try {
                setIsLoading(true);
                const response = await fetch(
                    `${config.baseUrl}/vendor/${vendorId}/available-organizations`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setAvailableOrganizations(data.available_organizations);
                setRequestedOrConnectedOrganizations(data.requested_or_connected_organizations);
                setError(null);
            } catch (err) {
                console.error('Error fetching organizations:', err);
                setError('Failed to load organizations. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    const handleSendRequest = async (organizationId) => {
        const vendor = JSON.parse(localStorage.getItem('vendor'));
        const vendorId = vendor.vendor_id;
        try {
            const response = await fetch(
                `${config.baseUrl}/organization/connect-vendor`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vendor_ID: vendorId,
                        organization_ID: organizationId
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Refresh the lists after connecting
            const updatedAvailable = availableOrganizations.filter(
                org => org.organization_id !== organizationId
            );

            // Find the organization that was just connected
            const connectedOrg = availableOrganizations.find(
                org => org.organization_id === organizationId
            );

            if (connectedOrg) {
                // Add it to the connected list with pending status
                const updatedConnectedOrg = {
                    ...connectedOrg,
                    approval_status: 'pending'
                };

                setRequestedOrConnectedOrganizations([
                    ...requestedOrConnectedOrganizations,
                    updatedConnectedOrg
                ]);
            }

            setAvailableOrganizations(updatedAvailable);

        } catch (err) {
            console.error('Error sending request to organization:', err);
            return { error: 'Failed to send request. Please try again.' };
        }
    };

    return {
        availableOrganizations,
        requestedOrConnectedOrganizations,
        isLoading,
        error,
        handleSendRequest
    };
};

export default useOrganizations; 