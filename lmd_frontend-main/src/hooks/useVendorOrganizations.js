import { useState, useEffect, useMemo } from 'react';
import config from '../api/config';

const useVendorOrganizations = () => {
    const [availableOrganizations, setAvailableOrganizations] = useState([]);
    const [requestedOrConnectedOrganizations, setRequestedOrConnectedOrganizations] = useState([]);
    const [deliveryBoysByOrg, setDeliveryBoysByOrg] = useState({});
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [isLoadingDeliveryBoys, setIsLoadingDeliveryBoys] = useState(false);
    const [error, setError] = useState(null);

    // Get vendor ID once
    const vendorId = useMemo(() => {
        try {
            const vendor = JSON.parse(localStorage.getItem('vendor'));
            return vendor?.vendor_id;
        } catch (err) {
            console.error('Error getting vendor ID from localStorage:', err);
            return null;
        }
    }, []);

    // Approved organizations computed property
    const approvedOrganizations = useMemo(() => {
        return requestedOrConnectedOrganizations.filter(org =>
            org.approval_status === 'approved'
        );
    }, [requestedOrConnectedOrganizations]);

    // Fetch organizations
    useEffect(() => {
        const fetchOrganizations = async () => {
            if (!vendorId) {
                setError('Vendor ID not found');
                setIsLoadingOrgs(false);
                return;
            }

            try {
                setIsLoadingOrgs(true);
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
                setAvailableOrganizations(data.available_organizations || []);
                setRequestedOrConnectedOrganizations(data.requested_or_connected_organizations || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching organizations:', err);
                setError('Failed to load organizations. Please try again later.');
            } finally {
                setIsLoadingOrgs(false);
            }
        };

        fetchOrganizations();
    }, [vendorId]);

    // Fetch delivery boys for approved organizations
    useEffect(() => {
        const fetchDeliveryBoys = async () => {
            if (approvedOrganizations.length === 0) return;

            setIsLoadingDeliveryBoys(true);
            const deliveryBoysData = {};

            try {
                await Promise.all(approvedOrganizations.map(async (org) => {
                    try {
                        const response = await fetch(
                            `${config.baseUrl}/organizations/${org.organization_id}/deliveryboys`,
                            {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (!response.ok) {
                            throw new Error(`Failed to fetch delivery boys for organization ${org.organization_id}`);
                        }

                        const data = await response.json();
                        deliveryBoysData[org.organization_id] = data.delivery_boys || [];
                    } catch (err) {
                        console.error(`Error fetching delivery boys for organization ${org.organization_id}:`, err);
                        deliveryBoysData[org.organization_id] = [];
                    }
                }));

                setDeliveryBoysByOrg(deliveryBoysData);
            } catch (err) {
                console.error('Error fetching delivery boys:', err);
                // We don't set the main error state here as it would override organization errors
            } finally {
                setIsLoadingDeliveryBoys(false);
            }
        };

        if (approvedOrganizations.length > 0 && !isLoadingOrgs) {
            fetchDeliveryBoys();
        }
    }, [approvedOrganizations, isLoadingOrgs]);

    // Function to send connection request to an organization
    const handleSendRequest = async (organizationId) => {
        if (!vendorId) {
            return { error: 'Vendor ID not found' };
        }

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

            // Update local state
            const connectedOrg = availableOrganizations.find(
                org => org.organization_id === organizationId
            );

            if (connectedOrg) {
                // Add to connected list with pending status
                const updatedConnectedOrg = {
                    ...connectedOrg,
                    approval_status: 'pending'
                };

                setRequestedOrConnectedOrganizations([
                    ...requestedOrConnectedOrganizations,
                    updatedConnectedOrg
                ]);

                // Remove from available list
                setAvailableOrganizations(
                    availableOrganizations.filter(org => org.organization_id !== organizationId)
                );
            }

            return { success: true };
        } catch (err) {
            console.error('Error sending request to organization:', err);
            return { error: 'Failed to send request. Please try again.' };
        }
    };

    // Helper functions to access delivery boys
    const getAllDeliveryBoys = () => {
        return Object.values(deliveryBoysByOrg).flat();
    };

    const getDeliveryBoysByOrganization = (orgId) => {
        return deliveryBoysByOrg[orgId] || [];
    };

    return {
        // Organizations
        availableOrganizations,
        requestedOrConnectedOrganizations,
        approvedOrganizations,

        // Delivery boys
        deliveryBoysByOrg,
        getAllDeliveryBoys,
        getDeliveryBoysByOrganization,

        // Loading and error states
        isLoadingOrgs,
        isLoadingDeliveryBoys,
        isLoading: isLoadingOrgs || isLoadingDeliveryBoys,
        error,

        // Actions
        handleSendRequest
    };
};

export default useVendorOrganizations; 