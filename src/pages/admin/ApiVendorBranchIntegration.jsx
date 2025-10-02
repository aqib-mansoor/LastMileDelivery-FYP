import config from "@/api/config"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import variablesService from "../../api/variablesService"

function useMappings(branchId, vendorId) {
    const [mappings, setMappings] = useState([])

    useEffect(() => {
        if (branchId && vendorId) {
            const fetchMappings = async () => {
                const response = await fetch(`${config.baseUrl}/mappings/${branchId}/${vendorId}`)
                const data = await response.json()
                if (data.data) {
                    setMappings(data.data)
                } else {
                    setMappings([])
                }
            }

            fetchMappings()
        } else {
            setMappings([])
        }
    }, [branchId, vendorId])

    return mappings;
}

function useApiMethods(vendorId) {
    const [apiMethods, setApiMethods] = useState([])

    useEffect(() => {
        if (vendorId) {
            const fetchApiMethods = async () => {
                
                const response = await fetch(`${config.baseUrl}/admin/apivendor/${vendorId}/methods`)
                const data = await response.json()
                console.log("api methods", data)
                if (data.methods) {
                    setApiMethods(data?.methods || [])
                } else {
                    setApiMethods([])
                }
            }
            fetchApiMethods()
        } else {
            setApiMethods([])
        }
    }, [vendorId])

    return apiMethods;
}

export default function ApiVendorBranchIntegration() {
    const { vendorId, shopId, branchId } = useParams()
    const navigate = useNavigate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false)
    const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        api_key: '',
        api_base_url: '',
        api_auth_method: '',
        api_version: '',
        vendor_integration_status: '',
        response_format: '',
        branches_ID: branchId || ''
    })
    const [methodFormData, setMethodFormData] = useState({
        method_name: '',
        http_method: '',
        endpoint: '',
        description: '',
        apivendor_ID: ''
    })
    const [mappingFormData, setMappingFormData] = useState({
        api_values: '',
        variable_ID: '',
        apivendor_ID: '',
        branch_ID: branchId || ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMethodSubmitting, setIsMethodSubmitting] = useState(false)
    const [isMappingSubmitting, setIsMappingSubmitting] = useState(false)

    const [integration, setIntegration] = useState(null)
    const mappings = useMappings(branchId, integration?.id)
    console.log("mappings", mappings)

    const apiMethods = useApiMethods(integration?.id)
    // console.log("api methods", apiMethods)

    const [variables, setVariables] = useState([])
    const [variablesLoading, setVariablesLoading] = useState(true)
    const [variablesError, setVariablesError] = useState(null)

    useEffect(() => {
        const fetchBranch = async () => {
            const response = await fetch(`${config.baseUrl}/admin/api-vendor/${branchId}`)
            const data = await response.json()
            if (data.data) {
                setIntegration(data.data)
                console.log(data.data)
            }
        }
        fetchBranch()
    }, [branchId])

    useEffect(() => {
        // Fetch variables for mapping select
        const fetchVariables = async () => {
            setVariablesLoading(true)
            setVariablesError(null)
            try {
                const response = await variablesService.getAllVariables()
                if (response.success && response.data) {
                    setVariables(response.data)
                } else if (response.status === false) {
                    setVariables([])
                } else {
                    setVariables([])
                }
            } catch (error) {
                setVariablesError(error.message)
                setVariables([])
            } finally {
                setVariablesLoading(false)
            }
        }
        fetchVariables()
    }, [])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleMethodInputChange = (field, value) => {
        setMethodFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleMappingInputChange = (field, value) => {
        setMappingFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch(`${config.baseUrl}/admin/apivendor/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            console.log(response)

            if (response.ok) {
                const result = await response.json()
                console.log('Integration updated successfully:', result)
                setIsDialogOpen(false)
                // Reset form
                setFormData({
                    api_key: '',
                    api_base_url: '',
                    api_auth_method: '',
                    api_version: '',
                    vendor_integration_status: '',
                    response_format: '',
                    branches_ID: branchId || ''
                })
            } else {
                console.error('Failed to update integration')
            }
        } catch (error) {
            console.error('Error updating integration:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleMethodSubmit = async (e) => {
        e.preventDefault()
        setIsMethodSubmitting(true)

        try {
            const response = await fetch(`${config.baseUrl}/admin/apivendor/method/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...methodFormData,
                    apivendor_ID: integration?.id
                })
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Method added successfully:', result)
                setIsMethodDialogOpen(false)
                // Reset form
                setMethodFormData({
                    method_name: '',
                    http_method: '',
                    endpoint: '',
                    description: '',
                    apivendor_ID: ''
                })
                // Refresh the page or refetch methods
                window.location.reload()
            } else {
                console.error('Failed to add method')
            }
        } catch (error) {
            console.error('Error adding method:', error)
        } finally {
            setIsMethodSubmitting(false)
        }
    }

    const handleMappingSubmit = async (e) => {
        e.preventDefault()
        setIsMappingSubmitting(true)

        try {
            const response = await fetch(`${config.baseUrl}/admin/apivendor/mapping/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...mappingFormData,
                    apivendor_ID: integration?.id
                })
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Mapping added successfully:', result)
                setIsMappingDialogOpen(false)
                // Reset form
                setMappingFormData({
                    api_values: '',
                    variable_ID: '',
                    apivendor_ID: '',
                    branch_ID: branchId || ''
                })
                // Refresh the page or refetch mappings
                window.location.reload()
            } else {
                console.error('Failed to add mapping')
            }
        } catch (error) {
            console.error('Error adding mapping:', error)
        } finally {
            setIsMappingSubmitting(false)
        }
    }

    const handleBack = () => {
        navigate(-1);
    };

    console.log(vendorId, shopId, branchId)
    return (
        <div className="p-6">
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

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold">Api Vendor Branch Integration</h1>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={(value) => {
                        if (value) {
                            setFormData({
                                api_key: integration?.api_key || '',
                                api_base_url: integration?.api_base_url || '',
                                api_auth_method: integration?.api_auth_method || '',
                                api_version: integration?.api_version || '',
                                vendor_integration_status: integration?.vendor_integration_status || '',
                                response_format: integration?.response_format || '',
                            })
                        }
                        setIsDialogOpen(value)
                    }}>
                        <DialogTrigger asChild>
                            <Button>Update Integration</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Update Integration</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="api_key">API Key *</Label>
                                    <Input
                                        id="api_key"
                                        value={formData.api_key}
                                        onChange={(e) => handleInputChange('api_key', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="api_base_url">API Base URL</Label>
                                    <Input
                                        id="api_base_url"
                                        value={formData.api_base_url}
                                        onChange={(e) => handleInputChange('api_base_url', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="api_auth_method">API Auth Method</Label>
                                    <Input
                                        id="api_auth_method"
                                        value={formData.api_auth_method}
                                        onChange={(e) => handleInputChange('api_auth_method', e.target.value)}
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="api_version">API Version</Label>
                                    <Input
                                        id="api_version"
                                        value={formData.api_version}
                                        onChange={(e) => handleInputChange('api_version', e.target.value)}
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="vendor_integration_status">Integration Status</Label>
                                    <Input
                                        id="vendor_integration_status"
                                        value={formData.vendor_integration_status}
                                        onChange={(e) => handleInputChange('vendor_integration_status', e.target.value)}
                                        maxLength={50}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="response_format">Response Format</Label>
                                    <Select
                                        value={formData.response_format}
                                        onValueChange={(value) => handleInputChange('response_format', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="JSON">JSON</SelectItem>
                                            <SelectItem value="XML">XML</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Integration'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isMethodDialogOpen} onOpenChange={setIsMethodDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Add Method</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Method</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleMethodSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="method_name">Method Name *</Label>
                                    <Input
                                        id="method_name"
                                        value={methodFormData.method_name}
                                        onChange={(e) => handleMethodInputChange('method_name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="http_method">HTTP Method *</Label>
                                    <Select
                                        value={methodFormData.http_method}
                                        onValueChange={(value) => handleMethodInputChange('http_method', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select HTTP method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="endpoint">Endpoint *</Label>
                                    <Input
                                        id="endpoint"
                                        value={methodFormData.endpoint}
                                        onChange={(e) => handleMethodInputChange('endpoint', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={methodFormData.description}
                                        onChange={(e) => handleMethodInputChange('description', e.target.value)}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsMethodDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isMethodSubmitting}
                                    >
                                        {isMethodSubmitting ? 'Adding...' : 'Add Method'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Add Mapping</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Mapping</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleMappingSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="api_values">API Values *</Label>
                                    <Input
                                        id="api_values"
                                        value={mappingFormData.api_values}
                                        onChange={(e) => handleMappingInputChange('api_values', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="variable_ID">Variable *</Label>
                                    <Select
                                        value={mappingFormData.variable_ID}
                                        onValueChange={(value) => handleMappingInputChange('variable_ID', value)}
                                        disabled={variablesLoading || variablesError}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={variablesLoading ? "Loading..." : variablesError ? "Error loading variables" : "Select variable"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {variables.map((v) => (
                                                <SelectItem key={v.id} value={String(v.id)}>
                                                    {v.tags ? v.tags : `ID: ${v.id}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {variablesError && (
                                        <div className="text-xs text-red-500 mt-1">{variablesError}</div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsMappingDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isMappingSubmitting}
                                    >
                                        {isMappingSubmitting ? 'Adding...' : 'Add Mapping'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="integration" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
                    <TabsTrigger value="integration" className="text-xs sm:text-sm">Integration</TabsTrigger>
                    <TabsTrigger value="mappings" className="text-xs sm:text-sm">Mappings</TabsTrigger>
                    <TabsTrigger value="methods" className="text-xs sm:text-sm">Methods</TabsTrigger>
                </TabsList>

                <TabsContent value="integration" className="mt-6">
                    {integration && (
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-xl">Current Integration Details</CardTitle>
                                <CardDescription>
                                    API configuration and status for this branch
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">API Key</label>
                                        <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded font-mono break-all">
                                            {integration.api_key || 'Not set'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">API Base URL</label>
                                        <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded font-mono break-all">
                                            {integration.api_base_url || 'Not set'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">API Auth Method</label>
                                        <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                            {integration.api_auth_method || 'Not set'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">API Version</label>
                                        <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded font-mono">
                                            {integration.api_version || 'Not set'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Integration Status</label>
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant={integration.vendor_integration_status === 'active' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {integration.vendor_integration_status || 'Not set'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Response Format</label>
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant="outline"
                                                className="text-xs font-mono"
                                            >
                                                {integration.response_format || 'Not set'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!integration && (
                        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Integration Found</h3>
                            <p className="text-gray-500">No API integration has been configured for this branch yet.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="mappings" className="mt-6">
                    {mappings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mappings.map((mapping) => (
                                <Card key={mapping.id} className="hover:shadow-lg transition-shadow duration-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Mapping #{mapping.id}</CardTitle>
                                            <Badge variant="secondary" className="text-xs">
                                                Var ID: {mapping.variable_ID}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">API Value</label>
                                            <p className="mt-1 text-sm text-gray-900 font-medium bg-gray-50 px-2 py-1 rounded">
                                                {mapping.api_values}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">API Vendor ID</label>
                                                <p className="mt-1 text-sm text-gray-900">{mapping.apivendor_ID}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Branch ID</label>
                                                <p className="mt-1 text-sm text-gray-900">{mapping.branch_ID}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Api Mappings Found</h3>
                            <p className="text-gray-500">No Api Mappings have been configured for this branch yet.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="methods" className="mt-6">
                    {apiMethods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {apiMethods.map((method) => (
                                <Card key={method.id} className="hover:shadow-lg transition-shadow duration-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{method.method_name}</CardTitle>
                                            <Badge 
                                                variant={
                                                    method.http_method === 'GET' ? 'default' :
                                                    method.http_method === 'POST' ? 'destructive' :
                                                    method.http_method === 'PUT' ? 'secondary' :
                                                    method.http_method === 'DELETE' ? 'destructive' :
                                                    'outline'
                                                }
                                                className="text-xs font-mono"
                                            >
                                                {method.http_method}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-sm">
                                            ID: {method.id}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Endpoint</label>
                                            <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded break-all">
                                                {method.endpoint}
                                            </p>
                                        </div>
                                        {method.description && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Description</label>
                                                <p className="mt-1 text-sm text-gray-700">
                                                    {method.description}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Api Methods Found</h3>
                            <p className="text-gray-500">No Api Methods have been configured for this branch yet.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}