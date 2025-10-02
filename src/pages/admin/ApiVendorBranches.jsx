import config from '@/api/config';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function ApiVendorBranches() {
    const { vendorId, shopId } = useParams();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${config.baseUrl}/admin/branches/pendingBranches`);
                const data = await response.json();
                console.log("all branches", data);
                
                // Filter branches by vendor and shop ID
                const filteredBranches = (data.pending_branches || []).filter(branch => 
                    branch.vendor_id === parseInt(vendorId) && branch.shop_id === parseInt(shopId)
                );
                
                setBranches(filteredBranches);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (vendorId && shopId) {
            fetchBranches();
        }
    }, [vendorId, shopId]);

    const handleIntegration = (branch) => {
        navigate(`/admin/api-vendors/shops/${vendorId}/branches/${shopId}/integration/${branch.branch_id}`)
    }

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading branches...</div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBack}
                    className="flex items-center gap-2 mb-4"
                >
                    ← Back
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">API Vendor Branches</CardTitle>
                    <p className="text-sm text-gray-600">Vendor ID: {vendorId} | Shop ID: {shopId}</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert className="mb-4">
                            <AlertDescription>Error: {error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {branches.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🏢</div>
                            <p className="text-gray-500 text-lg">No branches found for this vendor and shop.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Branches ({branches.length})
                                </h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {branches.map((branch) => (
                                    <Card key={branch.branch_id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                                                        {branch.shop_name}
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-500">Branch ID: {branch.branch_id}</p>
                                                </div>
                                                <Badge 
                                                    variant={
                                                        branch.branch_approval_status === 'approved' ? 'default' :
                                                        branch.branch_approval_status === 'rejected' ? 'destructive' : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {branch.branch_approval_status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                                                    <p className="text-sm text-gray-800">{branch.area}, {branch.city}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                                                    <p className="text-sm text-gray-800">{branch.branch_description || 'No description available'}</p>
                                                </div>
                                                
                                                <div className="pt-2">
                                                    <Button 
                                                        onClick={() => handleIntegration(branch)}
                                                        className="w-full"
                                                        variant="default"
                                                    >
                                                        Integration
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}