import { useState, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import config from '../../api/config'

function VendorDashboard() {
  const { user, navigate } = useOutletContext()
  console.log(user)
  const [showAddShopDialog, setShowAddShopDialog] = useState(false)
  const [shops, setShops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // Fetch shops data
    fetchShops()
    // Fetch categories
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${config.baseUrl}/shopcategories`)
      console.log(response)
      const data = await response.json()

      // API returns cities array directly without wrapping it in an object
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchShops = async () => {
    const vendor = JSON.parse(localStorage.getItem('vendor'))
    setIsLoading(true)
    try {
      const response = await fetch(`${config.baseUrl}/vendor/${vendor.vendor_id}/shops`)
      const data = await response.json()

      if (response.ok) {
        setShops(data.shops || [])
      } else {
        console.error('Failed to fetch shops:', data.message)
        setShops([])
      }
    } catch (error) {
      console.error('Error fetching shops:', error)
      setShops([])
    } finally {
      setIsLoading(false)
    }
  }

  const openAddShopDialog = () => {
    setShowAddShopDialog(true)
  }

  const closeAddShopDialog = () => {
    setShowAddShopDialog(false)
  }

  const handleAddShop = async (shopData) => {
    const vendor = JSON.parse(localStorage.getItem('vendor'))
    try {
      // Include the vendor ID in the shop data
      const shopWithVendorId = {
        ...shopData,
        vendors_ID: vendor.vendor_id
      };

      console.log("data", shopWithVendorId)

      const response = await fetch(`${config.baseUrl}/vendor/shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopWithVendorId),
      });

      const data = await response.json();

      console.log(data)

      if (response.ok && data.success) {
        // Add the new shop to the list
        fetchShops();
        closeAddShopDialog();
      } else {
        console.error('Failed to add shop:', data.errors || data.error || data.message);
        // Display validation errors if available
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          alert(`Failed to add shop:\n${errorMessages}`);
        } else {
          alert('Failed to add shop: ' + (data.error || data.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error adding shop:', error);
      alert('An error occurred while adding the shop');
    }
  }

  return (
    <>
      <div className="flex items-center justify-between bg-white p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">My Shops</h1>
        <div>
          <button
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg flex items-center shadow-md transition-all hover:shadow-lg"
            onClick={openAddShopDialog}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Shop
          </button>
        </div>
      </div>

      <section className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading shops...</span>
          </div>
        ) : shops.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-lg text-gray-600 mb-4">You don't have any shops yet.</p>
            <button
              className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              onClick={openAddShopDialog}
            >
              Add Your First Shop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map(shop => (
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden" key={shop.id}>
                <div className="p-4 border-b bg-primary-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">{shop.name}</h3>
                    <div className="space-x-2">
                      <button className="text-gray-600 hover:text-primary-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm text-gray-600">Category: {shop.shopcategory_name}</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${shop.status === 'active' ? 'bg-green-100 text-green-800' :
                      shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {shop.status || 'Pending'}
                    </span>
                  </div>
                  {shop.description && (
                    <p className="text-sm mt-2 text-gray-600 line-clamp-2">{shop.description}</p>
                  )}
                </div>
                <div className="border-t px-4 py-3 bg-gray-50 flex justify-end">
                  <Link to={`/vendor/shop/${shop.id}`} className="text-primary-600 hover:bg-primary-50 font-medium text-sm px-3 py-1 rounded transition-colors">
                    Manage Shop →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Shop Dialog */}
      {showAddShopDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeAddShopDialog}></div>

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-primary-600 px-4 py-3">
                <h3 className="text-lg font-medium leading-6 text-white">Add New Shop</h3>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <form id="add-shop-form" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const shopData = {
                        name: formData.get('name'),
                        description: formData.get('description'),
                        shopcategory_ID: formData.get('category')
                      };
                      handleAddShop(shopData);
                    }}>
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Shop Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          maxLength={255}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                        <select
                          id="category"
                          name="category"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          rows="3"
                          maxLength={255}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        ></textarea>
                        <p className="mt-1 text-xs text-gray-500">Maximum 255 characters</p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  form="add-shop-form"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Add Shop
                </button>
                <button
                  type="button"
                  onClick={closeAddShopDialog}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VendorDashboard 