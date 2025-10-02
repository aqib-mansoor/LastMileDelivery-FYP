import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { apiRequest } from '../../api/authService'

function Deliveries() {
  const { user } = useOutletContext()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll simulate the data
        
        // Simulated API call
        // const response = await apiRequest(`/riders/${user.id}/deliveries`, 'GET')
        // setDeliveries(response.data)
        
        // Simulate data for demonstration
        setTimeout(() => {
          setDeliveries([
            {
              id: 1,
              orderNumber: 'ORD-2023-001',
              customerName: 'John Doe',
              customerPhone: '+92 300 1234567',
              address: '123 Main St, City',
              status: 'Delivered',
              date: '2023-05-01T14:30:00',
              amount: 450,
              items: 3
            },
            {
              id: 2,
              orderNumber: 'ORD-2023-002',
              customerName: 'Jane Smith',
              customerPhone: '+92 301 2345678',
              address: '456 Oak Ave, Town',
              status: 'In Progress',
              date: '2023-05-02T10:15:00',
              amount: 320,
              items: 2
            },
            {
              id: 3,
              orderNumber: 'ORD-2023-003',
              customerName: 'Mike Johnson',
              customerPhone: '+92 302 3456789',
              address: '789 Pine Rd, Village',
              status: 'Pending',
              date: '2023-05-02T16:45:00',
              amount: 550,
              items: 4
            },
            {
              id: 4,
              orderNumber: 'ORD-2023-004',
              customerName: 'Sarah Williams',
              customerPhone: '+92 303 4567890',
              address: '101 Elm Blvd, County',
              status: 'Cancelled',
              date: '2023-05-03T09:20:00',
              amount: 280,
              items: 1
            },
            {
              id: 5,
              orderNumber: 'ORD-2023-005',
              customerName: 'David Brown',
              customerPhone: '+92 304 5678901',
              address: '202 Maple Dr, District',
              status: 'Delivered',
              date: '2023-05-03T13:10:00',
              amount: 620,
              items: 5
            }
          ])
          
          setLoading(false)
        }, 1000)
      } catch (err) {
        console.error('Error fetching deliveries:', err)
        setError('Failed to load deliveries. Please try again later.')
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [user.id])

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true
    return delivery.status.toLowerCase() === filter.toLowerCase()
  })

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
        <h1 className="text-2xl font-bold text-gray-800">My Deliveries</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('in progress')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'in progress' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'delivered' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Delivered
          </button>
          <button 
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'cancelled' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{delivery.customerName}</div>
                    <div className="text-sm text-gray-500">{delivery.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(delivery.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(delivery.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Rs. {delivery.amount}</div>
                    <div className="text-sm text-gray-500">{delivery.items} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      View
                    </button>
                    {delivery.status === 'Pending' && (
                      <button className="text-green-600 hover:text-green-900">
                        Accept
                      </button>
                    )}
                    {delivery.status === 'In Progress' && (
                      <button className="text-green-600 hover:text-green-900">
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDeliveries.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            No deliveries found with the selected filter.
          </div>
        )}
      </div>
    </div>
  )
}

export default Deliveries
