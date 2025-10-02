import { useOutletContext } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import config from '../../api/config'

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Map control to fly to a marker
function FlyToMarker({ position, zoom }) {
    const map = useMap();

    if (position) {
        map.flyTo(position, zoom || 15, {
            animate: true,
            duration: 1.5
        });
    }

    return null;
}

// Map click handler component
function MapClickHandler({ onMapClick }) {
    const map = useMap();

    useEffect(() => {
        const handleClick = (e) => {
            onMapClick(e);
        };

        map.on('click', handleClick);

        return () => {
            map.off('click', handleClick);
        };
    }, [map, onMapClick]);

    return null;
}

// Create custom icons for pickup and delivery locations
const shopIcon = L.divIcon({
    html: `<div class="custom-marker shop-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4caf50" width="100%" height="100%">
                <path d="M21 11h-3V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v7H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1zM8 5h8v6H8V5zm5 12H8v-3h5v3zm6 0h-4v-3h4v3z"/>
            </svg>
          </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const customerIcon = L.divIcon({
    html: `<div class="custom-marker customer-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f44336" width="100%" height="100%">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const assignedIcon = L.divIcon({
    html: `<div class="custom-marker assigned-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff9800" width="100%" height="100%">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const handoverConfirmedIcon = L.divIcon({
    html: `<div class="custom-marker handover-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9c27b0" width="100%" height="100%">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
            </svg>
          </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

// Create a rider location icon
const riderIcon = L.divIcon({
    html: `<div class="custom-marker rider-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2196f3" width="100%" height="100%">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div class="pulse-circle"></div>
          </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

// Define marker icon styles
const customIconStyle = `
<style>
  .custom-marker {
    width: 36px;
    height: 36px;
    position: relative;
  }
  
  .custom-marker:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
  }
  
  .custom-marker svg {
    filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.4));
    border-radius: 50%;
    background: white;
    padding: 3px;
  }
  
  .shop-marker svg { background-color: rgba(76, 175, 80, 0.2); }
  .customer-marker svg { background-color: rgba(244, 67, 54, 0.2); }
  .assigned-marker svg { background-color: rgba(255, 152, 0, 0.2); }
  .handover-marker svg { background-color: rgba(156, 39, 176, 0.2); }
  .rider-marker svg { 
    background-color: rgba(33, 150, 243, 0.2); 
    z-index: 1;
    position: relative;
  }
  
  .pulse-circle {
    position: absolute;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(33, 150, 243, 0.3);
    z-index: 0;
    top: 0;
    left: 0;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0.7;
    }
    70% {
      transform: scale(1.2);
      opacity: 0.3;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.7;
    }
  }
</style>
`;

// Add the styles to the document head
document.head.insertAdjacentHTML('beforeend', customIconStyle);

// For backward compatibility
const pickupIcon = shopIcon;
const deliveryIcon = customerIcon;

function RiderAssignedOrders() {
    const { user } = useOutletContext()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [flyToPosition, setFlyToPosition] = useState(null)
    const [processingOrder, setProcessingOrder] = useState(null)
    const [processError, setProcessError] = useState(null)
    const [deliveringOrder, setDeliveringOrder] = useState(null)
    const [deliveryError, setDeliveryError] = useState(null)
    const [currentLocation, setCurrentLocation] = useState(null)
    const [confirmingPayment, setConfirmingPayment] = useState(false)
    const [confirmingPaymentOrderId, setConfirmingPaymentOrderId] = useState(null)
    const [paymentMessage, setPaymentMessage] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [updatingTracking, setUpdatingTracking] = useState(false)
    const [trackingError, setTrackingError] = useState(null)
    const [mapInitialized, setMapInitialized] = useState(false)
    const mapRef = useRef(null)

    // Fetch assigned orders
    useEffect(() => {
        const fetchAssignedOrders = async () => {
            setLoading(true)
            setError(null)

            const user = JSON.parse(localStorage.getItem('user'))
            if (!user) {
                setError("No user information found")
                setLoading(false)
                return
            }

            try {
                const response = await fetch(`${config.baseUrl}/deliveryboy/${user.id}/assigned-suborders`)

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch assigned orders')
                }

                const data = await response.json()

                if (data.status === 'success') {
                    setOrders(data.data)
                } else {
                    throw new Error(data.message || 'Failed to fetch assigned orders')
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAssignedOrders()
    }, [])

    const getAllStatuses = () => {
        if (!orders || orders.length === 0) return [];
        const statuses = new Set();
        orders.forEach(order => {
            if (order.status) {
                statuses.add(order.status);
            }
        });
        return Array.from(statuses).sort();
    };

    const getOrderCountForStatus = (status) => {
        if (!orders || orders.length === 0) return 0;
        if (status === 'all') {
            return orders.length;
        }
        return orders.filter(order => order.status === status).length;
    };

    const getFilteredOrders = () => {
        if (!orders || orders.length === 0) return [];
        if (statusFilter === 'all') {
            return orders;
        }
        return orders.filter(order => order.status === statusFilter);
    };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    };

    // Check if rider is within 500m of pickup location
    const isWithinPickupRange = (order) => {
        if (!currentLocation || !order?.shop?.branch?.pickup_location?.latitude || !order?.shop?.branch?.pickup_location?.longitude) {
            console.log('Missing location data:', { currentLocation, order: order?.shop?.branch?.pickup_location });
            return false;
        }

        const distance = calculateDistance(
            currentLocation[0],
            currentLocation[1],
            parseFloat(order.shop.branch.pickup_location.latitude),
            parseFloat(order.shop.branch.pickup_location.longitude)
        );

        // console.log(`Distance to pickup for order ${order.suborder_id}:`, distance, 'meters');
        return distance <= 500; // 500 meters
    };

    // Check if rider is within 500m of delivery location
    const isWithinDeliveryRange = (order) => {
        if (!currentLocation || !order?.customer?.delivery_address?.latitude || !order?.customer?.delivery_address?.longitude) {
            console.log(order)
            console.log('Missing delivery location data:', { currentLocation, delivery: order?.customer?.delivery_address });
            return false;
        }

        const distance = calculateDistance(
            currentLocation[0],
            currentLocation[1],
            parseFloat(order.customer.delivery_address.latitude),
            parseFloat(order.customer.delivery_address.longitude)
        );

        console.log(`Distance to delivery for order ${order.suborder_id}:`, distance, 'meters');
        return distance <= 500; // 500 meters
    };

    // Update live tracking for active orders
    const updateLiveTracking = async (latitude, longitude) => {
        const deliveryboy = JSON.parse(localStorage.getItem('deliveryboy')) || JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        if (!deliveryboy) {
            console.error('No delivery boy information found in localStorage');
            setTrackingError('Unable to update live tracking: Delivery boy information not found');
            return;
        }

        // Get active orders (assigned or handover_confirmed status)
        const activeOrders = orders.filter(order => 
            order.status === 'assigned' || order.status === 'handover_confirmed'
        );

        if (activeOrders.length === 0) {
            console.log('No active orders to update tracking for');
            return;
        }

        console.log(`Updating live tracking for ${activeOrders.length} active orders...`);
        console.log('Delivery boy info:', { 
            id: deliveryboy.delivery_boy_id || deliveryboy.id, 
            name: deliveryboy.name,
            full_object: deliveryboy
        });
        console.log('Location:', { latitude, longitude });
        console.log('API Base URL:', config.baseUrl);
        console.log('Token exists:', !!token);

        setUpdatingTracking(true);
        let successCount = 0;
        let errorMessages = [];

        // Update tracking for each active order
        for (const order of activeOrders) {
            try {
                const requestBody = {
                    courierorder_ID: order.suborder_id,
                    latitude: latitude,
                    longitude: longitude,
                    deliveryboys_ID: deliveryboy.delivery_boy_id || deliveryboy.id
                };

                console.log(`Updating tracking for order ${order.suborder_id}:`, requestBody);

                const response = await fetch(`${config.baseUrl}/deliveryboy/update-live-tracking`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                });

                console.log(`Response status for order ${order.suborder_id}:`, response.status);
                
                const data = await response.json();
                console.log(`Response data for order ${order.suborder_id}:`, data);

                if (response.ok) {
                    console.log(`✓ Live tracking updated for order ${order.suborder_id}:`, data.message || 'Success');
                    successCount++;
                } else {
                    const errorMsg = `Failed to update tracking for order ${order.suborder_id}: ${data.message || 'Unknown error'}`;
                    console.error(errorMsg);
                    errorMessages.push(errorMsg);
                }
            } catch (error) {
                const errorMsg = `Error updating live tracking for order ${order.suborder_id}: ${error.message}`;
                console.error(errorMsg);
                errorMessages.push(errorMsg);
            }
        }

        setUpdatingTracking(false);
        
        if (successCount > 0) {
            console.log(`✓ Live tracking updated for ${successCount}/${activeOrders.length} orders`);
        }

        if (errorMessages.length > 0) {
            console.error('Live tracking errors:', errorMessages);
            setTrackingError(`Live tracking errors: ${errorMessages.join(', ')}`);
        } else if (successCount === 0 && activeOrders.length > 0) {
            setTrackingError('Failed to update live tracking for any orders');
        } else {
            setTrackingError(null); // Clear any previous errors on success
        }
    };

    // Handle map click to set current location
    const handleMapClick = async (e) => {
        console.log('Map clicked!', e.latlng);
        const { lat, lng } = e.latlng;
        setCurrentLocation([lat, lng]);
        setTrackingError(null); // Clear any previous tracking errors
        console.log('Current location set to:', [lat, lng]);

        // Update live tracking for active orders
        await updateLiveTracking(lat, lng);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No assigned orders available</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any assigned orders at this time.</p>
            </div>
        )
    }

    // Find center of the map based on orders
    const defaultCenter = [24.8607, 67.0011]; // Karachi coordinates as fallback
    const getMapCenter = () => {
        if (orders.length === 0) return defaultCenter;

        // Use the first order's pickup location if available
        if (orders[0]?.shop?.branch?.pickup_location?.latitude &&
            orders[0]?.shop?.branch?.pickup_location?.longitude) {
            return [
                parseFloat(orders[0].shop.branch.pickup_location.latitude),
                parseFloat(orders[0].shop.branch.pickup_location.longitude)
            ];
        }

        return defaultCenter;
    };

    const handleViewOnMap = (order) => {
        if (!order?.shop?.branch?.pickup_location?.latitude ||
            !order?.shop?.branch?.pickup_location?.longitude) {
            return;
        }

        const position = [
            parseFloat(order.shop.branch.pickup_location.latitude),
            parseFloat(order.shop.branch.pickup_location.longitude)
        ];

        setFlyToPosition(position);
        setSelectedOrder(order);
        if (!mapInitialized) {
            setMapInitialized(true);
        }
    };

    const handlePickupOrder = async (order) => {
        const deliveryboy = JSON.parse(localStorage.getItem('deliveryboy'))
        if (!deliveryboy) return;

        setProcessingOrder(order.suborder_id);
        setProcessError(null);

        try {
            const response = await fetch(`${config.baseUrl}/deliveryboy/order/${order.suborder_id}/pickup`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: order.shop.branch.pickup_location.latitude,
                    longitude: order.shop.branch.pickup_location.longitude
                })
            });

            console.log(response)

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to confirm pickup');
            }

            const data = await response.json();

            // Show success message
            alert('Pickup confirmed successfully!');

            // Refresh the orders list
            window.location.reload();

        } catch (err) {
            setProcessError(err.message);
        } finally {
            setProcessingOrder(null);
        }
    };

    const handleDeliverOrder = async (order) => {
        if (!order.suborder_id) return;

        const deliveryboy = JSON.parse(localStorage.getItem('deliveryboy')) || JSON.parse(localStorage.getItem('user'));
        if (!deliveryboy) {
            setDeliveryError('Delivery boy information not found');
            return;
        }

        setDeliveringOrder(order.suborder_id);
        setDeliveryError(null);

        try {
            // Check if customer location is available
            if (!order.customer?.delivery_address?.latitude || !order.customer?.delivery_address?.longitude) {
                throw new Error('Customer location coordinates not available');
            }

            // Get the current location from the order's customer delivery address
            const location = {
                latitude: order.customer.delivery_address.latitude,
                longitude: order.customer.delivery_address.longitude
            };

            // Call the API to update location to reached destination first
            const reachResponse = await fetch(`${config.baseUrl}/deliveryboy/reach-destination/${deliveryboy.delivery_boy_id}/${order.suborder_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(location)
            });

            if (!reachResponse.ok) {
                const errorData = await reachResponse.json();
                throw new Error(errorData.message || 'Failed to update location as reached destination');
            }

            // Mark order as delivered using delivery boy API
            const response = await fetch(`${config.baseUrl}/deliveryboy/order/${order.suborder_id}/location`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...location,
                    status: 'delivered'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to mark order as delivered');
            }

            const data = await response.json();

            // Show success message
            alert('Order delivered successfully!');

            // Update the local order status
            setOrders(orders.map(o =>
                o.suborder_id === order.suborder_id
                    ? { ...o, status: 'delivered' }
                    : o
            ));

        } catch (err) {
            console.error('Error delivering order:', err);
            setDeliveryError(err.message);
        } finally {
            setDeliveringOrder(null);
        }
    };

    const confirmPayment = async (suborderId) => {
        if (!suborderId) return
        try {
            setConfirmingPayment(true)
            setConfirmingPaymentOrderId(suborderId)
            setPaymentMessage('')
            const response = await fetch(`${config.baseUrl}/deliveryboy/confirm-payment/${suborderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to confirm payment')
            }
            // Update local state
            setOrders(orders.map(o =>
                o.suborder_id === suborderId ? { ...o, payment_status: 'confirmed_by_deliveryboy' } : o
            ))
            setPaymentMessage('Payment confirmed successfully!')
            setTimeout(() => {
                setPaymentMessage('')
                window.location.reload()
            }, 2000)
        } catch (err) {
            setPaymentMessage(err.message || 'Error confirming payment')
        } finally {
            setConfirmingPayment(false)
            setConfirmingPaymentOrderId(null)
        }
    }

    const renderOrderCard = (order) => {
        const getDistanceToPickup = () => {
            if (!currentLocation || !order?.shop?.branch?.pickup_location?.latitude || !order?.shop?.branch?.pickup_location?.longitude) {
                return null;
            }
            
            const distance = calculateDistance(
                currentLocation[0],
                currentLocation[1],
                parseFloat(order.shop.branch.pickup_location.latitude),
                parseFloat(order.shop.branch.pickup_location.longitude)
            );
            
            return Math.round(distance);
        };

        const getDistanceToDelivery = () => {
            if (!currentLocation || !order?.customer?.delivery_address?.latitude || !order?.customer?.delivery_address?.longitude) {
                return null;
            }
            
            const distance = calculateDistance(
                currentLocation[0],
                currentLocation[1],
                parseFloat(order.customer.delivery_address.latitude),
                parseFloat(order.customer.delivery_address.longitude)
            );
            
            return Math.round(distance);
        };

        const distanceToPickup = getDistanceToPickup();
        const distanceToDelivery = getDistanceToDelivery();

        return (
            <div className="overflow-hidden">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Order #{order.suborder_id}</h3>
                        <div className="flex items-center space-x-2">
                            {distanceToPickup !== null && order.status === 'assigned' && (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    distanceToPickup <= 500 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    Pickup: {distanceToPickup}m
                                </span>
                            )}
                            {distanceToDelivery !== null && order.status === 'handover_confirmed' && (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    distanceToDelivery <= 500 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    Delivery: {distanceToDelivery}m
                                </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'assigned' ? 'bg-orange-100 text-orange-800' :
                                order.status === 'picked' ? 'bg-green-100 text-green-800' :
                                    order.status === 'handover_confirmed' ? 'bg-purple-100 text-purple-800' :
                                        order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.order_date).toLocaleString()}
                    </p>
                    {!currentLocation && order.status === 'assigned' && (
                        <p className="text-sm text-blue-600 mt-1">
                            Click on map to set your location for pickup
                        </p>
                    )}
                    {!currentLocation && order.status === 'handover_confirmed' && (
                        <p className="text-sm text-blue-600 mt-1">
                            Click on map to set your location for delivery
                        </p>
                    )}
                </div>

            <div className="p-4 border-b">
                <h4 className="font-medium mb-2">Pickup Location</h4>
                <div className="flex items-start">
                    {order.shop.branch.picture && (
                        <img
                            src={order.shop.branch.picture}
                            alt={order.shop.name}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                    )}
                    <div>
                        <p className="font-medium">{order.shop.name}</p>
                        <p className="text-sm text-gray-600">{order.shop.branch.name}</p>
                        <p className="text-sm text-gray-500">
                            {order.shop.branch.pickup_location.area}, {order.shop.branch.pickup_location.city}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 border-b">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="flex items-start">
                    {order.customer.customer_picture && (
                        <img
                            src={order.customer.customer_picture}
                            alt={order.customer.name}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                    )}
                    <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">{order.customer.phone}</p>
                        <p className="text-sm text-gray-500">
                            {order.customer.delivery_address.street}, {order.customer.delivery_address.city}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="text-lg font-semibold">PKR:{order.total_amount}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                            onClick={() => handleViewOnMap(order)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            View on Map
                        </button>
                        {order.status === 'assigned' && (
                            <button
                                className={`px-4 py-2 text-white rounded-md transition-colors ${
                                    isWithinPickupRange(order) 
                                        ? 'bg-primary-600 hover:bg-primary-700' 
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                                onClick={() => handlePickupOrder(order)}
                                disabled={processingOrder === order.suborder_id || !isWithinPickupRange(order)}
                                title={!isWithinPickupRange(order) ? 'You must be within 500m of pickup location' : ''}
                            >
                                {processingOrder === order.suborder_id ? 'Processing...' : 'Confirm Pickup'}
                            </button>
                        )}
                        {order.status === 'handover_confirmed' && (
                            <button
                                className={`px-4 py-2 text-white rounded-md transition-colors ${
                                    isWithinDeliveryRange(order)
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                                onClick={() => handleDeliverOrder(order)}
                                disabled={deliveringOrder === order.suborder_id || !isWithinDeliveryRange(order)}
                                title={!isWithinDeliveryRange(order) ? 'You must be within 500m of delivery location' : ''}
                            >
                                {deliveringOrder === order.suborder_id ? 'Processing...' : 'Confirm Delivery'}
                            </button>
                        )}
                        {order.payment_status === 'confirmed_by_customer' && (
                            <button
                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => confirmPayment(order.suborder_id)}
                                disabled={confirmingPayment}
                            >
                                {confirmingPayment && confirmingPaymentOrderId === order.suborder_id ? 'Confirming...' : 'Confirm Payment'}
                            </button>
                        )}
                    </div>
                </div>
                {processError && processingOrder === order.suborder_id && (
                    <p className="text-red-500 text-sm mt-2">{processError}</p>
                )}
                {deliveryError && deliveringOrder === order.suborder_id && (
                    <p className="text-red-500 text-sm mt-2">{deliveryError}</p>
                )}
                {paymentMessage && (
                    <div className={`mt-2 text-sm ${paymentMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{paymentMessage}</div>
                )}
            </div>
        </div>
        );
    };

    const renderListView = () => (
        <div className="divide-y divide-gray-200 bg-white rounded-lg shadow">
            {getFilteredOrders().map((order, index) => (
                <div key={order.suborder_id} className={index === 0 ? "p-4" : "p-4 border-t border-gray-200"}>
                    {renderOrderCard(order)}
                </div>
            ))}
        </div>
    );

    const renderMapView = () => (
        <div className="relative h-96 w-full rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
                center={mapInitialized ? undefined : getMapCenter()}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {flyToPosition && <FlyToMarker position={flyToPosition} />}

                {/* Current user location */}
                {currentLocation && (
                    <Marker
                        position={currentLocation}
                        icon={riderIcon}
                    >
                        <Popup>
                            <div className="p-2">
                                <p className="font-bold">Your Location</p>
                                <p className="text-sm text-gray-600">
                                    Lat: {currentLocation[0].toFixed(5)}, Lng: {currentLocation[1].toFixed(5)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Debug: Show current location state */}
                {console.log('Current location in render:', currentLocation)}

                {/* Show only selected order or all orders if none selected */}
                {(selectedOrder ? [selectedOrder] : getFilteredOrders()).map(order => {
                    // Check if we have pickup location coordinates
                    const hasPickupLocation = order.shop?.branch?.pickup_location?.latitude &&
                        order.shop?.branch?.pickup_location?.longitude;

                    // Check if we have delivery location coordinates
                    const hasDeliveryLocation = order.customer?.delivery_address?.latitude &&
                        order.customer?.delivery_address?.longitude;

                    if (!hasPickupLocation) {
                        return null;
                    }

                    const pickupPosition = [
                        parseFloat(order.shop.branch.pickup_location.latitude),
                        parseFloat(order.shop.branch.pickup_location.longitude)
                    ];

                    let deliveryPosition = null;
                    if (hasDeliveryLocation) {
                        deliveryPosition = [
                            parseFloat(order.customer.delivery_address.latitude),
                            parseFloat(order.customer.delivery_address.longitude)
                        ];
                    }

                    // Choose icon based on status for the pickup location
                    const pickupMarkerIcon = order.status === 'assigned' 
                        ? assignedIcon 
                        : order.status === 'handover_confirmed'
                            ? handoverConfirmedIcon
                            : pickupIcon;

                    // Render markers and polyline
                    return (
                        <div key={order.suborder_id}>
                            {/* Pickup location marker */}
                            <Marker
                                position={pickupPosition}
                                icon={pickupMarkerIcon}
                            >
                                <Popup>
                                    <div className="p-2 max-w-[200px]">
                                        <p className="font-bold">Pickup Location</p>
                                        <p className="text-sm">{order.shop.name}</p>
                                        <p className="text-sm">{order.shop.branch.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {order.shop.branch.pickup_location.area}, {order.shop.branch.pickup_location.city}
                                        </p>
                                        <p className={`text-sm ${order.status === 'assigned' ? 'text-orange-600' :
                                            order.status === 'picked' ? 'text-green-600' :
                                                order.status === 'handover_confirmed' ? 'text-purple-600' :
                                                    'text-blue-600'
                                            }`}>
                                            {order.status}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-sm font-semibold">PKR:{order.total_amount}</p>
                                            <button
                                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewOnMap(order);
                                                }}
                                            >
                                                Focus
                                            </button>
                                        </div>
                                        {order.status === 'assigned' && (
                                            <button
                                                className={`w-full mt-2 px-3 py-1 text-white text-xs rounded transition-colors ${
                                                    isWithinPickupRange(order)
                                                        ? 'bg-primary-600 hover:bg-primary-700'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePickupOrder(order);
                                                }}
                                                disabled={processingOrder === order.suborder_id || !isWithinPickupRange(order)}
                                                title={!isWithinPickupRange(order) ? 'You must be within 500m of pickup location' : ''}
                                            >
                                                {processingOrder === order.suborder_id ? 'Processing...' : 'Confirm Pickup'}
                                            </button>
                                        )}
                                        {order.status === 'handover_confirmed' && (
                                            <button
                                                className={`w-full mt-2 px-3 py-1 text-white text-xs rounded transition-colors ${
                                                    isWithinDeliveryRange(order)
                                                        ? 'bg-green-600 hover:bg-green-700'
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeliverOrder(order);
                                                }}
                                                disabled={deliveringOrder === order.suborder_id || !isWithinDeliveryRange(order)}
                                                title={!isWithinDeliveryRange(order) ? 'You must be within 500m of delivery location' : ''}
                                            >
                                                {deliveringOrder === order.suborder_id ? 'Processing...' : 'Confirm Delivery'}
                                            </button>
                                        )}
                                        {processError && processingOrder === order.suborder_id && (
                                            <p className="text-red-500 text-xs mt-1">{processError}</p>
                                        )}
                                        {deliveryError && deliveringOrder === order.suborder_id && (
                                            <p className="text-red-500 text-xs mt-1">{deliveryError}</p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Delivery location marker - shown for handover_confirmed or non-assigned orders */}
                            {(order.status !== 'assigned' || order.status === 'handover_confirmed') && deliveryPosition && (
                                <Marker
                                    position={deliveryPosition}
                                    icon={deliveryIcon}
                                >
                                    <Popup>
                                        <div className="p-2 max-w-[200px]">
                                            <p className="font-bold">Delivery Location</p>
                                            <p className="text-sm">{order.customer.name}</p>
                                            <p className="text-sm">{order.customer.phone}</p>
                                            <p className="text-sm text-gray-500">
                                                {order.customer.delivery_address.street}, {order.customer.delivery_address.city}
                                            </p>
                                            {order.status === 'handover_confirmed' && (
                                                <button
                                                    className={`w-full mt-2 px-3 py-1 text-white text-xs rounded transition-colors ${
                                                        isWithinDeliveryRange(order)
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'bg-gray-400 cursor-not-allowed'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeliverOrder(order);
                                                    }}
                                                    disabled={deliveringOrder === order.suborder_id || !isWithinDeliveryRange(order)}
                                                    title={!isWithinDeliveryRange(order) ? 'You must be within 500m of delivery location' : ''}
                                                >
                                                    {deliveringOrder === order.suborder_id ? 'Processing...' : 'Confirm Delivery'}
                                                </button>
                                            )}
                                            {deliveryError && deliveringOrder === order.suborder_id && (
                                                <p className="text-red-500 text-xs mt-1">{deliveryError}</p>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Polyline between pickup and delivery locations - always shown when we have both coordinates */}
                            {deliveryPosition && (
                                <Polyline
                                    positions={[pickupPosition, deliveryPosition]}
                                    color="#3388ff"
                                    weight={3}
                                    opacity={0.7}
                                    dashArray="5, 10"
                                />
                            )}
                        </div>
                    );
                })}
            </MapContainer>

            {/* Location instruction or current location info */}
            {!currentLocation ? (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-md shadow-md z-[500] flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M9 7l6 3m0 0l-6 3m6-3H2" />
                    </svg>
                    <p className="text-sm">Click on the map to set your current location</p>
                </div>
            ) : (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-md z-[500] flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm mr-2">
                        {updatingTracking ? 'Updating tracking...' : 'Location set'}
                    </p>
                    <button 
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 mr-1"
                        onClick={() => updateLiveTracking(currentLocation[0], currentLocation[1])}
                        disabled={updatingTracking}
                    >
                        Retry
                    </button>
                    <button 
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
                        onClick={() => setCurrentLocation(null)}
                        disabled={updatingTracking}
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Live tracking update indicator */}
            {updatingTracking && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-md shadow-md z-[500] flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                    <p className="text-sm">Updating live tracking...</p>
                </div>
            )}

            {/* Tracking error indicator */}
            {trackingError && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-md z-[500] flex items-center max-w-md ${
                    updatingTracking ? 'top-28' : currentLocation ? 'top-16' : 'top-16'
                }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{trackingError}</p>
                    <button 
                        className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        onClick={() => setTrackingError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Map legend */}
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md z-[500]">
                <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff9800" width="16" height="16" className="mr-2">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                    <span className="text-xs">Assigned Order</span>
                </div>
                <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4caf50" width="16" height="16" className="mr-2">
                        <path d="M21 11h-3V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v7H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1zM8 5h8v6H8V5zm5 12H8v-3h5v3zm6 0h-4v-3h4v3z"/>
                    </svg>
                    <span className="text-xs">Shop Location</span>
                </div>
                <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9c27b0" width="16" height="16" className="mr-2">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                    </svg>
                    <span className="text-xs">Handover Confirmed</span>
                </div>
                <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f44336" width="16" height="16" className="mr-2">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span className="text-xs">Customer Location</span>
                </div>
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2196f3" width="16" height="16" className="mr-2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-xs">Your Location</span>
                </div>
            </div>

            {/* Selected order info or total orders count */}
            {selectedOrder ? (
                <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-[500] max-w-xs">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-800">Order #{selectedOrder.suborder_id}</h3>
                        <button
                            onClick={() => {
                                setSelectedOrder(null);
                                setMapInitialized(false);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">{selectedOrder.shop.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer.name}</p>
                    <p className="text-sm font-semibold text-primary">PKR:{selectedOrder.total_amount}</p>
                </div>
            ) : getFilteredOrders().length > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white py-2 px-4 rounded-full shadow-md">
                    <p className="font-bold text-gray-800">
                        {getFilteredOrders().length > 1 
                            ? `${getFilteredOrders().length} Orders` 
                            : `PKR:${getFilteredOrders()[0].total_amount}`
                        }
                    </p>
                </div>
            )}
        </div>
    );

    // Order detail modal
    const renderOrderDetailModal = () => {
        if (!selectedOrder) return null;

        return (
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-[1000]">
                <div className="bg-white rounded-lg shadow-xl w-64">
                    <div className="p-3 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Order #{selectedOrder.suborder_id}</h3>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="px-3 pb-3">
                        <p className="font-medium">{selectedOrder.shop.name}</p>
                        <p className="text-sm mb-2">{selectedOrder.shop.branch.name}</p>

                        <p className={`text-sm mb-4 ${selectedOrder.status === 'assigned' ? 'text-orange-600' :
                            selectedOrder.status === 'picked' ? 'text-green-600' :
                                'text-blue-600'
                            }`}>
                            {selectedOrder.status}
                        </p>

                        <div className="flex justify-between items-center">
                            <p className="font-medium">PKR:{selectedOrder.total_amount}</p>
                            <button
                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                onClick={() => {
                                    setSelectedOrder(null);
                                    setMapInitialized(false);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">My Assigned Orders</h1>
            </div>

            {/* Status Filter Tabs */}
            {orders && orders.length > 0 && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <div
                            onClick={() => {
                                setStatusFilter('all');
                                setMapInitialized(false);
                            }}
                            className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                statusFilter === 'all'
                                    ? 'bg-primary border border-primary text-white'
                                    : 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white'
                            }`}
                        >
                            All ({getOrderCountForStatus('all')})
                        </div>
                        {getAllStatuses().map(status => (
                            <div
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setMapInitialized(false);
                                }}
                                className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                                    statusFilter === status
                                        ? 'bg-primary border border-primary text-white'
                                        : 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white'
                                }`}
                            >
                                {status.replace('_', ' ')} ({getOrderCountForStatus(status)})
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Map View - shows first on mobile, second on desktop */}
                <div className="order-1 lg:order-2 lg:flex-1">
                    <h2 className="text-lg font-medium mb-4">Map View</h2>
                    {renderMapView()}
                </div>

                {/* Orders List - shows second on mobile, first on desktop */}
                <div className="order-2 lg:order-1 lg:flex-1">
                    <h2 className="text-lg font-medium mb-4">Orders List</h2>
                    {renderListView()}
                </div>
            </div>
        </div>
    )
}

export default RiderAssignedOrders 