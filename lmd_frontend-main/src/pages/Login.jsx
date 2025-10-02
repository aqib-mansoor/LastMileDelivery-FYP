import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/authService'
import logo from '../assets/logo.png'
import config from '../api/config'

function Login() {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials({
      ...credentials,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setLoginError('')

    // Validate form
    const newErrors = {}
    if (!credentials.email) newErrors.email = 'Email is required'
    if (!credentials.password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const result = await login(credentials)
      
      if (result.success) {
        console.log(result.data)
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.data.user))
        
        // Redirect based on role
        const role = result.data.user.role
        if (role === 'vendor') {

          const vendorData = await getVendorData(result.data.user.id)
          if (!vendorData) {
            alert('Vendor data not found')
            return
          }
          localStorage.setItem('vendor', JSON.stringify(vendorData))
          navigate('/vendor/dashboard')
        } else if (role === 'customer') {
          navigate('/customer/dashboard')
        } else if (role === 'deliveryboy') {
          const deliveryBoyData = await getDeliveryBoyData(result.data.user.id)
          if (!deliveryBoyData) {
            alert('Delivery boy data not found')
            return
          }
          localStorage.setItem('deliveryboy', JSON.stringify(deliveryBoyData))
          navigate('/rider/dashboard')
        } else if (role === 'admin') {
          navigate('/admin')
        } else if (role === 'organization') {
          const organizationData = await getOrganizationData(result.data.user.id)
          if (!organizationData) {
            alert('Organization data not found')
            return
          }
          localStorage.setItem('organization', JSON.stringify(organizationData))
          navigate('/organization/dashboard')
        } else {
          alert('Invalid role')
        }
      } else {
        console.error(result)
        setLoginError(result.data?.message || 'Invalid credentials')
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function getVendorData(userId) {
    try {
      const response = await fetch(`${config.baseUrl}/vendor/${userId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error(error)
    }

    return null
  }

  async function getOrganizationData(userId) {
    try {
      const response = await fetch(`${config.baseUrl}/organizations/${userId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error(error)
    }

    return null
  }

  // Route::get('deliveryboy/{id}', [DeliveryBoyController::class, 'getDeliveryBoyData']);
  async function getDeliveryBoyData(userId) {
    try {
      const response = await fetch(`${config.baseUrl}/deliveryboy/${userId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error(error)
    }

    return null
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Last Mile Delivery System" className="" />
        </div>
        
        {loginError && <div className="mb-4 p-3 text-sm bg-red-100 text-red-700 rounded-md">{loginError}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
          </div>
          
          <div>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
          </div>
          
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80">
              Forgot Password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition duration-150"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          Don't have account? <Link to="/" className="text-primary hover:text-primary/80">Signup</Link>
        </div>
      </div>
    </div>
  )
}

export default Login 