import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          LMD System
        </Link>

        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {user && (
            <>
              <li className="nav-item">
                <Link to="/vendor/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/vendor/shops" className="nav-link" onClick={() => setIsOpen(false)}>
                  My Shops
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/vendor/add-shop" className="nav-link" onClick={() => setIsOpen(false)}>
                  Add Shop
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )}
          
          {!user && (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar 