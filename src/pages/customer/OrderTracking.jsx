import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import config from '../../api/config'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const riderIcon = L.divIcon({
    html: `<div class="rider-marker">
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

const deliveryIcon = L.divIcon({
    html: `<div class="delivery-marker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f44336" width="100%" height="100%">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
});

const customIconStyle = `
<style>
  .rider-marker, .delivery-marker {
    width: 36px;
    height: 36px;
    position: relative;
  }
  
  .rider-marker svg, .delivery-marker svg {
    filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.4));
    border-radius: 50%;
    background: white;
    padding: 3px;
  }
  
  .rider-marker svg { background-color: rgba(33, 150, 243, 0.2); }
  .delivery-marker svg { background-color: rgba(244, 67, 54, 0.2); }
  
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
    0% { transform: scale(0.95); opacity: 0.7; }
    70% { transform: scale(1.2); opacity: 0.3; }
    100% { transform: scale(0.95); opacity: 0.7; }
  }
</style>
`;

// Add styles to document head
if (!document.getElementById('tracking-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'tracking-styles';
    styleElement.textContent = customIconStyle;
    document.head.appendChild(styleElement);
}

function OrderTracking() {
    const { suborderId } = useParams()
    const navigate = useNavigate()

    const [trackingLocations, setTrackingLocations] = useState([])
    const [trackingDeliveryLocation, setTrackingDeliveryLocation] = useState(null)
    const [trackingError, setTrackingError] = useState('')
    const [mapInitialized, setMapInitialized] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [suborderDetails, setSuborderDetails] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!suborderId) return
        
        fetchSuborderDetails()
        
        let interval
        const fetchTracking = async () => {
            try {
                setTrackingError('')
                const res = await fetch(`${config.baseUrl}/suborders/${suborderId}/live-route-tracking`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                const data = await res.json()
                console.log("data", data)
                if (!res.ok) throw new Error(data.message || 'No location data available')
                
                // Handle array of coordinates
                if (Array.isArray(data.data)) {
                    const locations = data.data.map(item => [
                        parseFloat(item.latitude), 
                        parseFloat(item.longitude)
                    ])
                    setTrackingLocations(locations)
                } else {
                    // Fallback for single coordinate
                    setTrackingLocations([[parseFloat(data.data.latitude), parseFloat(data.data.longitude)]])
                }
                
                setLastUpdated(new Date())
                
                if (!mapInitialized) {
                    setMapInitialized(true)
                }
            } catch (e) {
                setTrackingError(e.message)
                setTrackingLocations([])
            }
        }
        
        fetchTracking()
        interval = setInterval(fetchTracking, 10000)
        
        return () => clearInterval(interval)
    }, [suborderId, mapInitialized])

    const fetchSuborderDetails = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${config.baseUrl}/suborders/${suborderId}/details`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch suborder details')
            }
            
            setSuborderDetails(data)
            
            // Set delivery location if available
            if (data.customer?.delivery_address?.latitude && data.customer?.delivery_address?.longitude) {
                setTrackingDeliveryLocation([
                    parseFloat(data.customer.delivery_address.latitude),
                    parseFloat(data.customer.delivery_address.longitude)
                ])
            }
        } catch (err) {
            console.error('Error fetching suborder details:', err)
            // setTrackingError(err.message || 'Error fetching suborder details')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Live Order Tracking
                            </h1>
                            <p className="text-gray-600">
                                Suborder #{suborderId}
                                {suborderDetails?.shop_name && ` • ${suborderDetails.shop_name}`}
                            </p>
                        </div>
                        <button
                            onClick={() => window.close()}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {trackingError && (
                    <div className="mb-6 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {trackingError}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 bg-blue-50 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                <span className="text-sm font-medium text-gray-700">
                                    Tracking Active
                                </span>
                            </div>
                            {lastUpdated && (
                                <span className="text-sm text-gray-600">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Location updates every 10 seconds
                        </p>
                    </div>

                    <div className="relative">
                        {trackingLocations.length > 0 ? (
                            <MapContainer 
                                center={trackingLocations[trackingLocations.length - 1]} 
                                zoom={15} 
                                style={{ height: '70vh', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                
                                {/* Route Polyline */}
                                {trackingLocations.length > 1 && (
                                    <Polyline 
                                        positions={trackingLocations}
                                        color="#2196f3"
                                        weight={4}
                                        opacity={0.8}
                                    />
                                )}
                                
                                {/* Markers for all positions */}
                                {trackingLocations.map((position, index) => (
                                    <Marker 
                                        key={index} 
                                        position={position} 
                                        icon={index === trackingLocations.length - 1 ? riderIcon : L.divIcon({
                                            html: `<div style="background: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                                            className: '',
                                            iconSize: [12, 12],
                                            iconAnchor: [6, 6]
                                        })}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <p className="font-semibold text-blue-600">
                                                    {index === trackingLocations.length - 1 ? "Current Location" : `Position ${index + 1}`}
                                                </p>
                                                <p className="text-gray-600">
                                                    {index === trackingLocations.length - 1 && lastUpdated 
                                                        ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
                                                        : "Historical position"
                                                    }
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Lat: {position[0].toFixed(6)}<br/>
                                                    Lng: {position[1].toFixed(6)}
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}

                                {/* Delivery Location Marker */}
                                {trackingDeliveryLocation && (
                                    <>
                                        <Marker position={trackingDeliveryLocation} icon={deliveryIcon}>
                                            <Popup>
                                                <div className="text-sm">
                                                    <p className="font-semibold text-red-600">Delivery Location</p>
                                                    <p className="text-gray-600">Your delivery address</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Lat: {trackingDeliveryLocation[0].toFixed(6)}<br/>
                                                        Lng: {trackingDeliveryLocation[1].toFixed(6)}
                                                    </p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                        
                                        {/* Path from current location to delivery location */}
                                        {trackingLocations.length > 0 && (
                                            <Polyline 
                                                positions={[trackingLocations[trackingLocations.length - 1], trackingDeliveryLocation]}
                                                color="#f44336"
                                                weight={3}
                                                opacity={0.7}
                                                dashArray="5, 10"
                                            />
                                        )}
                                    </>
                                )}
                            </MapContainer>
                        ) : (
                            <div className="h-[70vh] flex items-center justify-center bg-gray-50">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <p className="text-gray-500 text-lg">Fetching location data...</p>
                                    <p className="text-gray-400 text-sm mt-2">Please wait while we connect to the rider</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div className="p-4 bg-gray-50 border-t">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span>Route Path</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span>Historical Points</span>
                                </div>
                                {trackingDeliveryLocation && (
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        <span>Delivery Address</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-gray-500">
                                Auto-refresh: 10s
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderTracking 