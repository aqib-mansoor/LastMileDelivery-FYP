import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

function AddShop() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    country: 'Pakistan',
    category: '',
    latitude: '',
    longitude: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check if user is logged in and is a vendor
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'vendor') {
      navigate('/')
      return
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Shop name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.category) newErrors.category = 'Category is required'
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    // Mock API call - replace with actual API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate success
      setSuccessMessage('Shop created successfully!')
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/vendor/shops')
      }, 2000)
    } catch (error) {
      setErrors({
        general: 'Failed to create shop. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-shop-container">
      <Navbar />
      <div className="add-shop-content">
        <h1>Add New Shop</h1>
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
        
        <form onSubmit={handleSubmit} className="add-shop-form">
          <div className="form-group">
            <label htmlFor="name" className="required">Shop Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="required">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={errors.description ? 'error' : ''}
            ></textarea>
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="category" className="required">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Select a category</option>
              <option value="food">Food & Restaurant</option>
              <option value="grocery">Grocery</option>
              <option value="fashion">Fashion & Apparel</option>
              <option value="electronics">Electronics</option>
              <option value="healthcare">Healthcare</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <div className="field-error">{errors.category}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone" className="required">Phone Number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address" className="required">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <div className="field-error">{errors.address}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="required">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <div className="field-error">{errors.city}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div className="form-buttons">
            <button
              type="button"
              onClick={() => navigate('/vendor/shops')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Creating...' : 'Create Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddShop 