import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendorSignup } from '../api/authService'
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

function VendorSignup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_no: '',
    password: '',
    cnic: '',
    profile_picture: null,
    vendor_type: '',
    address_type: 'Work',
    street: '',
    city: '',
    zip_code: '',
    country: 'Pakistan',
    latitude: '',
    longitude: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
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
    
    if (name === 'profile_picture' && files && files[0]) {
      setFormData({
        ...formData,
        profile_picture: files[0]
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
      const result = await vendorSignup(data)

      console.log(result)

      if (!result.success) {
        if (result.status === 422) {
          setErrors(result.data.errors || {})
        } else {
          throw new Error(result.data?.message || result.error || 'Signup failed')
        }
      } else {
        setSuccessMessage('Vendor account created successfully!')
        // Reset form or redirect
        setTimeout(() => {
          navigate('/')
        }, 2000)
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Vendor Signup</h1>
        
        {successMessage && <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}
        {errors.general && <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">{errors.general}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="vendor_type"
                      value="In-App Vendor"
                      checked={formData.vendor_type === 'In-App Vendor'}
                      onChange={handleChange}
                      required
                    />
                    In-App Vendor
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="vendor_type"
                      value="API Vendor"
                      checked={formData.vendor_type === 'API Vendor'}
                      onChange={handleChange}
                    />
                    API Vendor
                  </label>
                </div>
                {errors.vendor_type && <div className="mt-1 text-sm text-red-600">{errors.vendor_type}</div>}
              </div>
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
              </div>
              
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
              </div>
              
              <div>
                <input
                  type="text"
                  id="phone_no"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleChange}
                  required
                  placeholder="Phone Number"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.phone_no ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.phone_no && <div className="mt-1 text-sm text-red-600">{errors.phone_no}</div>}
              </div>
              
              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
              </div>
              
              <div>
                <input
                  type="text"
                  id="cnic"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  required
                  placeholder="CNIC Number"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.profile_picture && <div className="mt-1 text-sm text-red-600">{errors.profile_picture}</div>}
              </div>
            </div>
          </div>
        
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Address Information</h2>
            
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
              Click on the map to select your location and automatically populate your address:
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
                <>Click on the map to select your location</>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  placeholder="Street Address"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.street && <div className="mt-1 text-sm text-red-600">{errors.street}</div>}
              </div>
              
              <div>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="City"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.city && <div className="mt-1 text-sm text-red-600">{errors.city}</div>}
              </div>
              
              <div>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  placeholder="ZIP Code"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.zip_code ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.zip_code && <div className="mt-1 text-sm text-red-600">{errors.zip_code}</div>}
              </div>
              
              <div>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.country && <div className="mt-1 text-sm text-red-600">{errors.country}</div>}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              type="button" 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => navigate('/')}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition duration-150"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VendorSignup