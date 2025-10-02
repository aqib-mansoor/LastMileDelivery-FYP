import config from "@/api/config";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Store, 
    Building2, 
    CheckCircle, 
    Package, 
    Clock, 
    ShoppingCart, 
    DollarSign, 
    TrendingUp, 
    Users 
} from "lucide-react";

function useVendorStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getVendorStats = async () => {
            try {
                const vendor = JSON.parse(localStorage.getItem('vendor'))
                if (!vendor || !vendor.vendor_id) {
                    console.error('Vendor information not found')
                    return
                }
                const response = await fetch(`${config.baseUrl}/vendor/${vendor.vendor_id}/summary`)
                const data = await response.json()
                console.log("vendor stats", data)
                setStats(data)
            } catch (error) {
                console.error('Error fetching vendor stats:', error)
            } finally {
                setLoading(false)
            }
        }
        getVendorStats()
    }, [])

    return { stats, loading }
}

export default function VendorStats() {
    const { stats, loading } = useVendorStats();

    if (loading) {
        return (
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(10)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Failed to load vendor statistics</p>
            </div>
        )
    }

    const cardData = [
        {
            title: "Total Shops",
            value: stats.total_shops,
            icon: Store,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            description: "Active shops"
        },
        {
            title: "Total Branches",
            value: stats.total_branches,
            icon: Building2,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            description: "All branches"
        },
        {
            title: "Approved Branches",
            value: stats.total_approved_branches,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
            description: "Operational branches",
            badge: `${stats.total_approved_branches}/${stats.total_branches}`
        },
        {
            title: "Total Suborders",
            value: stats.total_suborders,
            icon: Package,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            description: "All suborders"
        },
        {
            title: "Delivered Orders",
            value: stats.delivered_suborders,
            icon: CheckCircle,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            description: "Successfully delivered",
            percentage: ((stats.delivered_suborders / stats.total_suborders) * 100).toFixed(1)
        },
        {
            title: "Pending Orders",
            value: stats.pending_suborders,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            description: "Awaiting delivery",
            percentage: ((stats.pending_suborders / stats.total_suborders) * 100).toFixed(1)
        },
        {
            title: "Total Orders",
            value: stats.total_orders,
            icon: ShoppingCart,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            description: "All orders received"
        },
        {
            title: "Total Revenue",
            value: `PKR ${stats.total_revenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
            description: "Total earnings"
        },
        {
            title: "Avg Revenue/Order",
            value: `PKR ${stats.avg_revenue_per_order}`,
            icon: TrendingUp,
            color: "text-teal-600",
            bgColor: "bg-teal-50",
            description: "Per order average"
        },
        {
            title: "Linked Organizations",
            value: stats.total_linked_organizations,
            icon: Users,
            color: "text-pink-600",
            bgColor: "bg-pink-50",
            description: "Partner organizations"
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Vendor Statistics</h1>
                <Badge variant="outline" className="text-sm">
                    Last updated: {new Date().toLocaleDateString()}
                </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cardData.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        {card.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                        <Icon className={`h-4 w-4 ${card.color}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {card.value}
                                        </span>
                                        {card.badge && (
                                            <Badge variant="secondary" className="text-xs">
                                                {card.badge}
                                            </Badge>
                                        )}
                                        {card.percentage && (
                                            <Badge variant="outline" className="text-xs">
                                                {card.percentage}%
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {card.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Order Fulfillment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Delivery Rate</span>
                                <span className="font-semibold text-green-600">
                                    {((stats.delivered_suborders / stats.total_suborders) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: `${(stats.delivered_suborders / stats.total_suborders) * 100}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Revenue Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-green-600">
                                    PKR {stats.total_revenue.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                From {stats.total_orders} orders
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Business Scale
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Shops:</span>
                                    <span className="font-semibold ml-1">{stats.total_shops}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Partners:</span>
                                    <span className="font-semibold ml-1">{stats.total_linked_organizations}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}