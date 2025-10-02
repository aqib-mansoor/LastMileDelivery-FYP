import { useState, useEffect } from 'react'
import config from '../../api/config'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Map marker component
function LocationMarker({ position, setPosition, handleLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      handleLocationSelect(newPosition);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function RiderForm({ onSuccess, onCancel }) {
  const organization = JSON.parse(localStorage.getItem('organization'))
  // Ensure organization_id is parsed as an integer
  const organizationId = parseInt(organization.organization_id, 10)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_no: '',
    password: '',
    cnic: '',
    profile_picture: null,
    license_no: '',
    license_expiration_date: '',
    license_front: null,
    license_back: null,
    address_type: 'Work',
    street: '',
    city: '',
    zip_code: '',
    country: 'Pakistan',
    latitude: '',
    longitude: '',
    organization_id: parseInt(organization.organization_id, 10)
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [position, setPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState([30.3753, 69.3451]) // Pakistan center
  const [isAddressLoading, setIsAddressLoading] = useState(false)

  // Update form data when map position changes
  useEffect(() => {
    if (position) {
      setFormData(prev => ({
        ...prev,
        latitude: position[0].toString(),
        longitude: position[1].toString()
      }))
    }
  }, [position])

  const fetchAddressFromCoordinates = async (position) => {
    if (!position) return;
    
    setIsAddressLoading(true);
    try {
      const [lat, lng] = position;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      // Update form with address components
      setFormData(prev => ({
        ...prev,
        street: data.address.road || data.address.street || '',
        city: data.address.city || data.address.town || data.address.village || '',
        zip_code: data.address.postcode || '',
        country: data.address.country || 'Pakistan',
        latitude: lat.toString(),
        longitude: lng.toString()
      }));
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleLocationSelect = (newPosition) => {
    fetchAddressFromCoordinates(newPosition);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    
    const data = new FormData()
    
    // Append all form data to FormData object
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key])
      }
    })

    try {
      const response = await fetch(`${config.baseUrl}/deliveryboys/signup`, {
        method: 'POST',
        body: data,
        // No Content-Type header needed with FormData
      })

      const result = await response.json()
      
      if (!response.ok) {
        if (response.status === 422) {
          setErrors(result.errors || {})
        } else {
          throw new Error(result.message || 'Signup failed')
        }
      } else {
        // Call success callback
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ 
        general: error.message || 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && <div className="p-3 bg-red-100 text-red-700 rounded-md">{errors.general}</div>}
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-700 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
          </div>
          
          <div>
            <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              id="phone_no"
              name="phone_no"
              value={formData.phone_no}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.phone_no ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone_no && <div className="mt-1 text-sm text-red-600">{errors.phone_no}</div>}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
          </div>
          
          <div>
            <label htmlFor="cnic" className="block text-sm font-medium text-gray-700 mb-1">CNIC Number</label>
            <input
              type="text"
              id="cnic"
              name="cnic"
              value={formData.cnic}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.cnic ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.cnic && <div className="mt-1 text-sm text-red-600">{errors.cnic}</div>}
          </div>
          
          <div>
            <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <input
              type="file"
              id="profile_picture"
              name="profile_picture"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.profile_picture && <div className="mt-1 text-sm text-red-600">{errors.profile_picture}</div>}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-700 mb-4">License Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="license_no" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              id="license_no"
              name="license_no"
              value={formData.license_no}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.license_no ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.license_no && <div className="mt-1 text-sm text-red-600">{errors.license_no}</div>}
          </div>
          
          <div>
            <label htmlFor="license_expiration_date" className="block text-sm font-medium text-gray-700 mb-1">License Expiration Date</label>
            <input
              type="date"
              id="license_expiration_date"
              name="license_expiration_date"
              value={formData.license_expiration_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.license_expiration_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.license_expiration_date && <div className="mt-1 text-sm text-red-600">{errors.license_expiration_date}</div>}
          </div>
          
          <div>
            <label htmlFor="license_front" className="block text-sm font-medium text-gray-700 mb-1">License Front Image</label>
            <input
              type="file"
              id="license_front"
              name="license_front"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.license_front && <div className="mt-1 text-sm text-red-600">{errors.license_front}</div>}
          </div>
          
          <div>
            <label htmlFor="license_back" className="block text-sm font-medium text-gray-700 mb-1">License Back Image</label>
            <input
              type="file"
              id="license_back"
              name="license_back"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.license_back && <div className="mt-1 text-sm text-red-600">{errors.license_back}</div>}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-700 mb-4">Address Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, address_type: 'Work' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.address_type === 'Work'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Work
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, address_type: 'Home' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.address_type === 'Home'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, address_type: 'Other' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${formData.address_type === 'Other'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Other
            </button>
          </div>
          {errors.address_type && <div className="text-sm text-red-600 mb-2">{errors.address_type}</div>}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          Click on the map to select the rider's location and automatically populate the address:
        </div>
        
        <div className="h-64 w-full mb-4 rounded-md overflow-hidden border border-gray-300">
          <MapContainer 
            center={mapCenter} 
            zoom={6} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker 
              position={position} 
              setPosition={setPosition} 
              handleLocationSelect={handleLocationSelect}
            />
          </MapContainer>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {isAddressLoading ? (
            <>Loading address information...</>
          ) : position ? (
            <>Selected coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}</>
          ) : (
            <>Click on the map to select the rider's location</>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.street && <div className="mt-1 text-sm text-red-600">{errors.street}</div>}
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.city && <div className="mt-1 text-sm text-red-600">{errors.city}</div>}
          </div>
          
          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.zip_code ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.zip_code && <div className="mt-1 text-sm text-red-600">{errors.zip_code}</div>}
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.country && <div className="mt-1 text-sm text-red-600">{errors.country}</div>}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition duration-150"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Add Rider'}
        </button>
      </div>
    </form>
  )
}

export default RiderForm
