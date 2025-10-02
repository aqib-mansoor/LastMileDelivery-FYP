import { useState, useEffect } from 'react';
import config from '../api/config';

/**
 * @typedef {Object} Shop
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} status
 * @property {number} shopcategory_ID
 * @property {string} shopcategory_name
 * @property {number} vendors_ID
 */

const useVendorShops = () => {

    /**
     * @type {Shop[]}
     */
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                setLoading(true);

                // Get user from localStorage
                const vendor = JSON.parse(localStorage.getItem('vendor'));
                const vendorId = vendor?.vendor_id;

                if (!vendorId) {
                    throw new Error('Vendor ID not found in localStorage');
                }

                const response = await fetch(`${config.baseUrl}/vendor/${vendorId}/shops`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch shops');
                }

                const data = await response.json();
                setShops(data.shops);
                setError(null);
            } catch (err) {
                setError(err.message);
                setShops([]);
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, []);

    return { shops, loading, error };
};

export default useVendorShops; 