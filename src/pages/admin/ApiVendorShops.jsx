import React, { useState } from 'react';
import config from '../../api/config';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendorShopsByVendorId } from '../../hooks/useVendorShops';

export default function ApiVendorShops() {
    const { vendorId } = useParams();
    const { shops, loading, error } = useVendorShopsByVendorId(vendorId);
    
    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchesError, setBranchesError] = useState(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();

    const fetchBranches = async (shopId) => {
        try {
            setBranchesLoading(true);
            setBranchesError(null);
            const response = await fetch(`${config.baseUrl}/admin/vendor/${vendorId}/shop/${shopId}/branches`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setBranches(data);
        } catch (err) {
            setBranchesError('Failed to fetch branches: ' + err.message);
            console.error('Error fetching branches:', err);
        } finally {
            setBranchesLoading(false);
        }
    };

    const handleViewBranches = async (shop) => {
        navigate(`/admin/api-vendors/shops/${vendorId}/branches/${shop.id}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading shops...</div>
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
                    <CardTitle className="text-2xl font-bold">API Vendor Shops</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {shops.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🏪</div>
                            <p className="text-gray-500 text-lg">No shops found for this vendor.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shops.map((shop) => (
                                <Card key={shop.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                                                    {shop.name}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500">ID: {shop.id}</p>
                                            </div>
                                            <Badge variant={shop.status === 'active' ? 'default' : 'secondary'}>
                                                {shop.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                                                <p className="text-sm text-gray-800">{shop.description || 'No description available'}</p>
                                            </div>
                                            
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                                                <Badge variant="outline" className="text-xs">
                                                    {shop.category_name}
                                                </Badge>
                                            </div>
                                            
                                            <div className="pt-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleViewBranches(shop)}
                                                    className="w-full"
                                                >
                                                    View Branches
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Branches Modal */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            Branches for {selectedShop?.name}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="mt-6">
                        {branchesLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-lg">Loading branches...</div>
                            </div>
                        ) : branchesError ? (
                            <Alert>
                                <AlertDescription>{branchesError}</AlertDescription>
                            </Alert>
                        ) : branches.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                                <p className="text-gray-500 text-lg">No branches found for this shop.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {branches.map((branch) => (
                                    <Card key={branch.id} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base font-semibold text-gray-800 mb-1">
                                                        Branch {branch.id}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                                                        {branch.status}
                                                    </Badge>
                                                    <Badge 
                                                        variant={
                                                            branch.approval_status === 'approved' ? 'default' :
                                                            branch.approval_status === 'rejected' ? 'destructive' : 'secondary'
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {branch.approval_status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                                                    <p className="text-sm text-gray-800">{branch.description || 'No description available'}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Contact</p>
                                                    <p className="text-sm text-gray-800">{branch.contact_number || 'Not provided'}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Operating Hours</p>
                                                    <p className="text-sm text-gray-800">
                                                        {branch.opening_hours && branch.closing_hours 
                                                            ? `${branch.opening_hours} - ${branch.closing_hours}`
                                                            : 'Not specified'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}