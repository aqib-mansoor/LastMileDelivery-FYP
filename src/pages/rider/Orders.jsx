import { useOutletContext } from 'react-router-dom'
import useOrders from '../../hooks/useOrders'
import { useState, useRef, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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

// Custom icons for pickup and delivery
const pickupIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-weight: bold;">P</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const deliveryIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-weight: bold;">D</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// Rider current location icon
const riderIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-weight: bold;">R</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
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

function Orders() {
    const { user } = useOutletContext()
    const { orders, loading, error } = useOrders(user?.id)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [acceptingOrder, setAcceptingOrder] = useState(null)
    const [acceptError, setAcceptError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentLocation, setCurrentLocation] = useState(null)
    const [locationError, setLocationError] = useState(null)
    const mapRef = useRef(null)

    // Get rider's current location on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation([position.coords.latitude, position.coords.longitude]);
                    setLocationError(null);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationError('Unable to get your location. Please click on the map to set your location manually.');
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser. Please click on the map to set your location manually.');
        }
    }, []);

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in kilometers
    };

    // Check if order is within 10km radius
    const isOrderWithinRange = (order) => {
        if (!currentLocation || !order?.shop?.branch?.pickup_location?.latitude || !order?.shop?.branch?.pickup_location?.longitude) {
            return false;
        }

        const distance = calculateDistance(
            currentLocation[0],
            currentLocation[1],
            parseFloat(order.shop.branch.pickup_location.latitude),
            parseFloat(order.shop.branch.pickup_location.longitude)
        );

        return distance <= 10; // 10km radius
    };

    // Get distance to pickup location for an order
    const getDistanceToPickup = (order) => {
        if (!currentLocation || !order?.shop?.branch?.pickup_location?.latitude || !order?.shop?.branch?.pickup_location?.longitude) {
            return null;
        }

        const distance = calculateDistance(
            currentLocation[0],
            currentLocation[1],
            parseFloat(order.shop.branch.pickup_location.latitude),
            parseFloat(order.shop.branch.pickup_location.longitude)
        );

        return distance;
    };

    // Handle map click to set current location
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setCurrentLocation([lat, lng]);
        setLocationError(null);
    };

    // Filter orders by status
    const filteredOrders = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        if (statusFilter === 'all') return orders;
        return orders.filter(order => order.status === statusFilter);
    }, [orders, statusFilter]);

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
                <h3 className="mt-2 text-lg font-medium text-gray-900">No orders available</h3>
                <p className="mt-1 text-sm text-gray-500">There are no orders ready for pickup at this time.</p>
            </div>
        )
    }

    const handleAcceptOrder = async (order) => {
        const deliveryboy = JSON.parse(localStorage.getItem('deliveryboy'))
        if (!deliveryboy) return;

        // Check if rider location is available
        if (!currentLocation) {
            setAcceptError('Please set your current location first by clicking on the map or allowing location access.');
            return;
        }

        // Check if order is within 10km radius
        if (!isOrderWithinRange(order)) {
            const distance = getDistanceToPickup(order);
            setAcceptError(`Order is ${distance ? distance.toFixed(2) : 'too far'} km away. You can only accept orders within 10km radius.`);
            return;
        }

        setAcceptingOrder(order.suborder_id);
        setAcceptError(null);

        try {
            const response = await fetch(`${config.baseUrl}/deliveryboy/${deliveryboy.delivery_boy_id}/accept-order/${order.suborder_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to accept order');
            }

            alert('Order accepted successfully!');
            window.location.reload();

        } catch (err) {
            setAcceptError(err.message);
        } finally {
            setAcceptingOrder(null);
        }
    };

    const handleViewOrderOnMap = (order) => {
        setSelectedOrder(order);
    };

    const getMapCenter = () => {
        if (!selectedOrder) return [24.8607, 67.0011]; // Karachi coordinates as fallback

        // Center between pickup and delivery locations if both available
        const pickupLat = selectedOrder.shop?.branch?.pickup_location?.latitude;
        const pickupLng = selectedOrder.shop?.branch?.pickup_location?.longitude;
        
        if (pickupLat && pickupLng) {
            return [parseFloat(pickupLat), parseFloat(pickupLng)];
        }

        return [24.8607, 67.0011];
    };

    const renderOrdersList = () => (
        <div className="space-y-4">
            {filteredOrders.map(order => {
                const distance = getDistanceToPickup(order);
                const isWithinRange = isOrderWithinRange(order);
                
                return (
                    <div key={order.suborder_id} className={`bg-white rounded-lg shadow border overflow-hidden ${!isWithinRange && currentLocation ? 'border-red-200 opacity-75' : 'border-gray-200'}`}>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Order #{order.suborder_id}</h3>
                                    <p className="text-sm text-gray-500">{order.shop.name} - {order.shop.branch.name}</p>
                                    {currentLocation && distance && (
                                        <p className={`text-sm font-medium ${isWithinRange ? 'text-green-600' : 'text-red-600'}`}>
                                            Distance: {distance.toFixed(2)} km {!isWithinRange && '(Outside 10km range)'}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                        {order.status}
                                    </span>
                                    {!isWithinRange && currentLocation && (
                                        <div className="mt-1">
                                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                Too Far
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">Pickup Location</h4>
                                <p className="text-sm text-gray-600">{order.shop.name}</p>
                                <p className="text-sm text-gray-600">
                                    {order.shop.branch.pickup_location?.area}, {order.shop.branch.pickup_location?.city}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">Delivery Location</h4>
                                <p className="text-sm text-gray-600">{order.customer.name}</p>
                                <p className="text-sm text-gray-600">
                                    {order.customer.delivery_address.street}, {order.customer.delivery_address.city}
                                </p>
                                <p className="text-sm text-gray-600">Phone: {order.customer.phone}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                            <span>Order Date: {new Date(order.order_date).toLocaleString()}</span>
                            <div className="text-right">
                                <div className="font-medium">Subtotal: PKR {order.total_amount}</div>
                                <div className="text-xs">Delivery: PKR {config.deliveryFee}</div>
                                <div className="font-semibold">Total: PKR {(parseFloat(order.total_amount) + config.deliveryFee).toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                                onClick={() => handleViewOrderOnMap(order)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                View on Map
                            </button>
                            <button
                                className={`flex-1 px-4 py-2 text-white rounded-md flex items-center justify-center ${
                                    !currentLocation || !isWithinRange 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-primary hover:bg-primary'
                                }`}
                                onClick={() => handleAcceptOrder(order)}
                                disabled={acceptingOrder === order.suborder_id || !currentLocation || !isWithinRange}
                            >
                                {acceptingOrder === order.suborder_id ? 'Accepting...' : 
                                 !currentLocation ? 'Set Location First' :
                                 !isWithinRange ? 'Too Far' : 'Accept Order'}
                            </button>
                        </div>
                        {acceptError && acceptingOrder === order.suborder_id && (
                            <p className="text-red-500 text-sm mt-2">{acceptError}</p>
                        )}
                    </div>
                    </div>
                );
            })}
        </div>
    );

    const renderMapView = () => {
        if (!selectedOrder) {
            return (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-300">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <p className="mt-2 text-gray-500">Click "View on Map" on any order to see its locations</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Selected order info */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Order #{selectedOrder.suborder_id} - Map View</h3>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600">
                        {selectedOrder.shop.name} → {selectedOrder.customer.name}
                    </p>
                </div>

                {/* Map */}
                <div className="relative h-96 w-full rounded-lg overflow-hidden border border-gray-300">
                    <MapContainer
                        center={getMapCenter()}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onMapClick={handleMapClick} />

                        {/* Rider's current location marker */}
                        {currentLocation && (
                            <Marker
                                position={currentLocation}
                                icon={riderIcon}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-bold text-blue-600">Your Location</p>
                                        <p className="text-sm">Lat: {currentLocation[0].toFixed(5)}, Lng: {currentLocation[1].toFixed(5)}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Pickup location marker */}
                        {selectedOrder.shop?.branch?.pickup_location?.latitude && 
                         selectedOrder.shop?.branch?.pickup_location?.longitude && (
                            <Marker
                                position={[
                                    parseFloat(selectedOrder.shop.branch.pickup_location.latitude),
                                    parseFloat(selectedOrder.shop.branch.pickup_location.longitude)
                                ]}
                                icon={pickupIcon}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-bold text-green-600">Pickup Location</p>
                                        <p className="text-sm">{selectedOrder.shop.name}</p>
                                        <p className="text-sm">{selectedOrder.shop.branch.name}</p>
                                        <p className="text-sm">{selectedOrder.shop.branch.pickup_location.area}</p>
                                        {currentLocation && (
                                            <p className="text-sm font-medium text-blue-600">
                                                Distance: {getDistanceToPickup(selectedOrder)?.toFixed(2)} km
                                            </p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Delivery location marker - Note: We'd need coordinates for customer address */}
                        {/* This would require geocoding the customer address or having lat/lng in the data */}
                    </MapContainer>

                    {/* Location instruction overlay */}
                    {!currentLocation && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-md shadow-md z-[500] flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm">Click on the map to set your current location</p>
                        </div>
                    )}

                    {/* Location error message */}
                    {locationError && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-md z-[500] max-w-md text-center">
                            <p className="text-sm">{locationError}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Available Orders</h1>
            </div>

            {/* Location Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Location Status:</span>
                    </div>
                    <div className="text-right">
                        {currentLocation ? (
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                                        <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    Location Set
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                    {currentLocation[0].toFixed(5)}, {currentLocation[1].toFixed(5)}
                                </p>
                            </div>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                                    <circle cx={4} cy={4} r={3} />
                                </svg>
                                Location Required
                            </span>
                        )}
                    </div>
                </div>
                {locationError && (
                    <div className="mt-2 text-sm text-red-600">
                        {locationError}
                    </div>
                )}
                <div className="mt-2 text-sm text-gray-600">
                    <p>You can only accept orders within 10km of your current location. {!currentLocation && 'Please set your location to see available orders.'}</p>
                </div>
            </div>

            {/* Status Filter Tabs */}
            {orders && orders.length > 0 && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <div
                            onClick={() => setStatusFilter('all')}
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
                                onClick={() => setStatusFilter(status)}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders List */}
                <div>
                    <h2 className="text-lg font-medium mb-4">Orders List</h2>
                    {renderOrdersList()}
                </div>

                {/* Map View */}
                <div>
                    <h2 className="text-lg font-medium mb-4">Map View</h2>
                    {renderMapView()}
                </div>
            </div>
        </div>
    )
}

export default Orders 