import { useOutletContext } from 'react-router-dom'
import useOrders from '../../hooks/useOrders'
import { useState, useRef, useMemo } from 'react'
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

function Orders() {
    const { user } = useOutletContext()
    const { orders, loading, error } = useOrders(user?.id)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [acceptingOrder, setAcceptingOrder] = useState(null)
    const [acceptError, setAcceptError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const mapRef = useRef(null)

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
            {filteredOrders.map(order => (
                <div key={order.suborder_id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Order #{order.suborder_id}</h3>
                                <p className="text-sm text-gray-500">{order.shop.name} - {order.shop.branch.name}</p>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {order.status}
                            </span>
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
                            <span className="font-medium">Total: PKR {order.total_amount}</span>
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
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                                onClick={() => handleAcceptOrder(order)}
                                disabled={acceptingOrder === order.suborder_id}
                            >
                                {acceptingOrder === order.suborder_id ? 'Accepting...' : 'Accept Order'}
                            </button>
                        </div>
                        {acceptError && acceptingOrder === order.suborder_id && (
                            <p className="text-red-500 text-sm mt-2">{acceptError}</p>
                        )}
                    </div>
                </div>
            ))}
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
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Delivery location marker - Note: We'd need coordinates for customer address */}
                        {/* This would require geocoding the customer address or having lat/lng in the data */}
                    </MapContainer>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Available Orders</h1>
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