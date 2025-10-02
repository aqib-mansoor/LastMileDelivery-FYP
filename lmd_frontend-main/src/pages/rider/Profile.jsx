import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { apiRequest } from '../../api/authService'

function Profile() {
  const { user } = useOutletContext()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll simulate the data
        
        // Simulated API call
        // const response = await apiRequest(`/riders/${user.id}/profile`, 'GET')
        // setProfile(response.data)
        
        // Simulate data for demonstration
        setTimeout(() => {
          const profileData = {
            id: user.id,
            name: user.name || 'John Rider',
            email: user.email || 'john.rider@example.com',
            phone: '+92 300 1234567',
            licenseNumber: 'LIC-123456',
            licenseExpiry: '2024-12-31',
            address: '123 Rider Street, City',
            joinDate: '2023-01-15',
            totalDeliveries: 48,
            rating: 4.8,
            status: 'Available'
          }
          
          setProfile(profileData)
          setFormData({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            licenseNumber: profileData.licenseNumber,
            licenseExpiry: profileData.licenseExpiry,
            address: profileData.address
          })
          
          setLoading(false)
        }, 1000)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please try again later.')
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user.id, user.name, user.email])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // In a real app, you would update the profile via API
      // const response = await apiRequest(`/riders/${user.id}/profile`, 'PUT', formData)
      
      // Simulate successful update
      setProfile({
        ...profile,
        ...formData
      })
      
      setIsEditing(false)
      // Show success message
      alert('Profile updated successfully')
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('Failed to update profile. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!isEditing ? (
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
                <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center text-4xl font-bold text-white mb-4">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Rider ID: {profile.id}</p>
                <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {profile.status}
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 ${i < Math.floor(profile.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">{profile.rating} / 5</span>
                </div>
              </div>
              
              <div className="md:w-2/3 md:pl-8 md:border-l md:border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.licenseNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">License Expiry</h3>
                    <p className="mt-1 text-sm text-gray-900">{new Date(profile.licenseExpiry).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.address}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined On</h3>
                    <p className="mt-1 text-sm text-gray-900">{new Date(profile.joinDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Deliveries</h3>
                    <p className="mt-1 text-sm text-gray-900">{profile.totalDeliveries}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700">License Expiry</label>
                <input
                  type="date"
                  id="licenseExpiry"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
