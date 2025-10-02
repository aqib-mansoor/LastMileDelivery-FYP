import { useEffect, useState } from "react"
import config from "../../api/config"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

function useAdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getAdminStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${config.baseUrl}/admin/admin-stats`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin stats')
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    getAdminStats()
  }, [])

  return { stats, loading, error }
}

export default function AdminStats() {
  const { stats, loading, error } = useAdminStats()

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Statistics</h1>
        <div className="text-center py-8">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Statistics</h1>
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Statistics</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total_users}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All orders placed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.total_orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Shops</CardTitle>
            <CardDescription>Registered shops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.total_shops}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Branches</CardTitle>
            <CardDescription>Shop branches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.total_branches}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Breakdown of user types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.users_by_role).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{role}</span>
                  <span className="text-lg font-semibold text-blue-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.orders_by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{status}</span>
                  <span className={`text-lg font-semibold ${
                    status === 'confirmed' ? 'text-green-600' :
                    status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Branches by Approval */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Approval Status</CardTitle>
            <CardDescription>Branch approval breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.branches_by_approval).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{status}</span>
                  <span className={`text-lg font-semibold ${
                    status === 'approved' ? 'text-green-600' :
                    status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}