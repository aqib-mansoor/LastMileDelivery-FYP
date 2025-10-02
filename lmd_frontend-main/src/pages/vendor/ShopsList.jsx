import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'

function ShopsList() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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

    // Fetch shops - For now using mock data
    // In a real app, you would fetch from API
    fetchShops(parsedUser.id)
  }, [navigate])

  const fetchShops = (vendorId) => {
    // Mock fetch - Replace with actual API call
    setLoading(true)
    
    // Simulating API call with timeout
    setTimeout(() => {
      // Mock data
      const mockShops = [
        {
          id: 1,
          name: 'Fashion Store',
          description: 'Quality fashion and accessories',
          status: 'active',
          address: '123 Fashion St, City',
          createdAt: '2023-01-15'
        },
        {
          id: 2,
          name: 'Tech Gadgets',
          description: 'Latest tech gadgets and accessories',
          status: 'active',
          address: '456 Tech Ave, City',
          createdAt: '2023-02-20'
        }
      ]
      
      setShops(mockShops)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="shops-container">
      <Navbar />
      <div className="shops-content">
        <div className="shops-header">
          <h1>My Shops</h1>
          <button 
            className="add-shop-btn"
            onClick={() => navigate('/vendor/add-shop')}
          >
            Add New Shop
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading shops...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : shops.length === 0 ? (
          <div className="no-shops">
            <p>You don't have any shops yet.</p>
            <button 
              className="add-shop-btn"
              onClick={() => navigate('/vendor/add-shop')}
            >
              Create Your First Shop
            </button>
          </div>
        ) : (
          <div className="shops-list">
            {shops.map(shop => (
              <div key={shop.id} className="shop-card">
                <div className="shop-details">
                  <h2>{shop.name}</h2>
                  <p>{shop.description}</p>
                  <p className="shop-address"><strong>Address:</strong> {shop.address}</p>
                  <div className="shop-status">
                    Status: <span className={`status-${shop.status}`}>{shop.status}</span>
                  </div>
                  <p className="shop-date">Created on: {new Date(shop.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="shop-actions">
                  <Link to={`/vendor/shops/${shop.id}`} className="view-shop-btn">
                    View Details
                  </Link>
                  <Link to={`/vendor/shops/${shop.id}/edit`} className="edit-shop-btn">
                    Edit Shop
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopsList 