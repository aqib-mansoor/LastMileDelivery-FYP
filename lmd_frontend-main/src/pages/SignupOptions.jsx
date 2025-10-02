import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function SignupOptions() {
  const [selectedOption, setSelectedOption] = useState('customers')
  const navigate = useNavigate()
  
  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      // Redirect based on role
      const role = user.role
      if (role === 'vendor') {
        navigate('/vendor/dashboard')
      } else if (role === 'customer') {
        navigate('/customer/dashboard')
      } else if (role === 'rider') {
        navigate('/rider/dashboard')
      } else if (role === 'admin') {
        navigate('/admin/dashboard')
      } else if (role === 'organization') {
        navigate('/organization/dashboard')
      }
    }
  }, [navigate])

  const handleContinue = () => {
    if (selectedOption === 'vendor') {
      navigate('/vendorSignup')
    } else if (selectedOption === 'customers') {
      navigate('/customerSignup')
    } else if (selectedOption === 'rider') {
      navigate('/riderSignup')
    } else if (selectedOption === 'organization') {
      navigate('/organizationSignup')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          What type of account do you want to open?
        </h1>
        
        <div className="space-y-4 mb-6">
          <div 
            className={`p-4 border rounded-md cursor-pointer transition-colors ${
              selectedOption === 'customers' 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setSelectedOption('customers')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedOption === 'customers' ? 'border-primary' : 'border-gray-400'
              }`}>
                {selectedOption === 'customers' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span className="ml-3 font-medium">Customers</span>
            </div>
          </div>
          
          <div 
            className={`p-4 border rounded-md cursor-pointer transition-colors ${
              selectedOption === 'organization' 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setSelectedOption('organization')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedOption === 'organization' ? 'border-primary' : 'border-gray-400'
              }`}>
                {selectedOption === 'organization' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span className="ml-3 font-medium">Organization</span>
            </div>
          </div>
          
          <div 
            className={`p-4 border rounded-md cursor-pointer transition-colors ${
              selectedOption === 'vendor' 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setSelectedOption('vendor')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedOption === 'vendor' ? 'border-primary' : 'border-gray-400'
              }`}>
                {selectedOption === 'vendor' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <span className="ml-3 font-medium">Vendor</span>
            </div>
          </div>
        </div>
        
        <button 
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-150"
          onClick={handleContinue}
        >
          Continue
        </button>
        
        <div className="mt-6 text-center text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:text-primary/80">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default SignupOptions 