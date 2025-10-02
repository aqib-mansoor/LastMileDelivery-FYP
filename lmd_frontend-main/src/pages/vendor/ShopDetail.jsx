import { useState, useEffect } from 'react'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import config from '../../api/config'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Map marker component
function LocationMarker({ position, setPosition, handleLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            const newPosition = [e.latlng.lat, e.latlng.lng];
            setPosition(newPosition);
            handleLocationSelect(newPosition);
        },
    });

    return position ? <Marker position={position} /> : null;
}

function ShopDetail() {
    const { shopId } = useParams()
    const { user } = useOutletContext()
    const [shop, setShop] = useState(null)
    const [branches, setBranches] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddBranchDialog, setShowAddBranchDialog] = useState(false)
    const [cities, setCities] = useState([])
    const [isLoadingCities, setIsLoadingCities] = useState(false)
    const [position, setPosition] = useState(null)
    const [mapCenter, setMapCenter] = useState([30.3753, 69.3451]) // Pakistan center
    const [isAddressLoading, setIsAddressLoading] = useState(false)
    const [branchFormData, setBranchFormData] = useState({
        description: '',
        opening_hours: '',
        closing_hours: '',
        contact_number: '',
        latitude: '',
        longitude: '',
        city_ID: '',
        area_name: '',
        postal_code: '',
        shops_ID: shopId,
        branch_picture: null
    })
    const [formErrors, setFormErrors] = useState({})
    const [showUpdateBranchDialog, setShowUpdateBranchDialog] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState(null)

    useEffect(() => {
        // Fetch shop details and branches
        fetchShopDetails()
        fetchBranches()
        fetchCities()
    }, [shopId])

    // Update form data when map position changes
    useEffect(() => {
        if (position) {
            setBranchFormData(prev => ({
                ...prev,
                latitude: position[0].toString(),
                longitude: position[1].toString()
            }))
        }
    }, [position])

    const fetchAddressFromCoordinates = async (position) => {
        if (!position) return;

        setIsAddressLoading(true);
        try {
            const [lat, lng] = position;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }

            const data = await response.json();

            // Update form with address components
            setBranchFormData(prev => ({
                ...prev,
                area_name: data.address.suburb || data.address.neighbourhood || data.address.village || '',
                postal_code: data.address.postcode || '',
                latitude: lat.toString(),
                longitude: lng.toString()
            }));

            // If city is in response and cities are loaded, try to find matching city ID
            if (data.address.city && cities.length > 0) {
                const cityName = data.address.city.toLowerCase();
                const matchedCity = cities.find(city => city.name.toLowerCase() === cityName);
                if (matchedCity) {
                    setBranchFormData(prev => ({
                        ...prev,
                        city_ID: matchedCity.id.toString()
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        } finally {
            setIsAddressLoading(false);
        }
    };

    const handleLocationSelect = (newPosition) => {
        fetchAddressFromCoordinates(newPosition);
    };

    const fetchCities = async () => {
        setIsLoadingCities(true);
        try {
            const response = await fetch(`${config.baseUrl}/cities`);
            const data = await response.json();

            if (response.ok) {
                // API returns cities array directly without wrapping it in an object
                setCities(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch cities:', data.message);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setIsLoadingCities(false);
        }
    };

    const fetchShopDetails = async () => {
        try {
            const response = await fetch(`${config.baseUrl}/vendor/${shopId}/shops`)
            const data = await response.json()

            if (response.ok) {
                setShop(data.shop || null)
            } else {
                console.error('Failed to fetch shop details:', data.message)
            }
        } catch (error) {
            console.error('Error fetching shop details:', error)
        }
    }

    const fetchBranches = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${config.baseUrl}/shop/${shopId}/branches`)
            const data = await response.json()

            if (response.ok) {
                setBranches(data.branches || [])
            } else {
                console.error('Failed to fetch branches:', data.message)
                setBranches([])
            }
        } catch (error) {
            console.error('Error fetching branches:', error)
            setBranches([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleFormChange = (e) => {
        const { name, value, files } = e.target

        if (name === 'branch_picture' && files && files[0]) {
            setBranchFormData({
                ...branchFormData,
                branch_picture: files[0]
            })
        } else {
            setBranchFormData({
                ...branchFormData,
                [name]: value
            })
        }
    }

    const validateForm = () => {
        const errors = {};

        if (!branchFormData.latitude) errors.latitude = 'Latitude is required';
        if (!branchFormData.longitude) errors.longitude = 'Longitude is required';
        if (!branchFormData.opening_hours) errors.opening_hours = 'Opening hours are required';
        if (!branchFormData.closing_hours) errors.closing_hours = 'Closing hours are required';
        if (!branchFormData.contact_number) errors.contact_number = 'Contact number is required';
        if (!branchFormData.city_ID) errors.city_ID = 'City is required';
        if (!branchFormData.area_name) errors.area_name = 'Area name is required';

        return errors;
    }

    const openAddBranchDialog = () => {
        setShowAddBranchDialog(true)
    }

    const closeAddBranchDialog = () => {
        setShowAddBranchDialog(false)
        setBranchFormData({
            description: '',
            opening_hours: '',
            closing_hours: '',
            contact_number: '',
            latitude: '',
            longitude: '',
            city_ID: '',
            area_name: '',
            postal_code: '',
            shops_ID: shopId,
            branch_picture: null
        })
        setPosition(null)
        setFormErrors({})
    }

    const handleAddBranch = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Clear previous errors
        setFormErrors({});

        const formData = new FormData();

        // Append form fields to FormData
        Object.keys(branchFormData).forEach(key => {
            if (branchFormData[key] !== null && branchFormData[key] !== '') {
                formData.append(key, branchFormData[key]);
            }
        });

        try {
            const response = await fetch(`${config.baseUrl}/branches`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                fetchBranches();
                closeAddBranchDialog();
            } else {
                console.error('Failed to add branch:', data.errors || data.message);
                if (data.errors) {
                    setFormErrors(data.errors);
                } else {
                    alert('Failed to add branch: ' + (data.message || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error adding branch:', error);
            alert('An error occurred while adding the branch');
        }
    }

    const openUpdateBranchDialog = (branch) => {
        setSelectedBranch(branch)
        // Set the map center to the branch's location
        if (branch.latitude && branch.longitude) {
            setMapCenter([branch.latitude, branch.longitude])
            setPosition([branch.latitude, branch.longitude])
        }

        setBranchFormData({
            description: branch.description || '',
            opening_hours: branch.opening_hours || '',
            closing_hours: branch.closing_hours || '',
            contact_number: branch.contact_number || '',
            latitude: branch.latitude?.toString() || '',
            longitude: branch.longitude?.toString() || '',
            city_ID: branch.city_id?.toString() || '',  // Fixed: city_id instead of city_ID
            area_name: branch.area_name || '',
            postal_code: branch.postal_code || '',
            shops_ID: shopId,
            branch_picture: null
        })

        setShowUpdateBranchDialog(true)
    }

    const closeUpdateBranchDialog = () => {
        setShowUpdateBranchDialog(false)
        setSelectedBranch(null)
        setBranchFormData({
            description: '',
            opening_hours: '',
            closing_hours: '',
            contact_number: '',
            latitude: '',
            longitude: '',
            city_ID: '',
            area_name: '',
            postal_code: '',
            shops_ID: shopId,
            branch_picture: null
        })
        setPosition(null)
        setFormErrors({})
    }

    const handleUpdateBranch = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Clear previous errors
        setFormErrors({});

        const formData = new FormData();

        // Append form fields to FormData - include ALL fields for update
        Object.keys(branchFormData).forEach(key => {
            if (branchFormData[key] !== null && branchFormData[key] !== '') {
                formData.append(key, branchFormData[key]);
            }
        });

        try {
            const response = await fetch(`${config.baseUrl}/branches/${selectedBranch.branch_id}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                fetchBranches();
                closeUpdateBranchDialog();
            } else {
                console.error('Failed to update branch:', data.errors || data.message);
                if (data.errors) {
                    setFormErrors(data.errors);
                } else {
                    alert('Failed to update branch: ' + (data.message || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error updating branch:', error);
            alert('An error occurred while updating the branch');
        }
    }

    const handleDeleteBranch = async (branchId) => {
        if (window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
            try {
                const response = await fetch(`${config.baseUrl}/branches/${branchId}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (response.ok) {
                    fetchBranches();
                } else {
                    alert(data.message || 'Failed to delete branch');
                }
            } catch (error) {
                console.error('Error deleting branch:', error);
                alert('An error occurred while deleting the branch');
            }
        }
    }

    return (
        <>
            <div className="flex items-center justify-between bg-white p-4 border-b">
                <div>
                    <Link to="/vendor/dashboard" className="text-gray-500 hover:text-primary-600">Dashboard</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-800 font-semibold">{shop ? shop.name : 'Shop Details'}</span>
                </div>
                <div>
                    <button
                        className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg flex items-center shadow-md transition-all hover:shadow-lg"
                        onClick={openAddBranchDialog}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Branch
                    </button>
                </div>
            </div>

            <section className="p-4">
                {shop && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">{shop.name}</h2>
                            <span className={`text-sm px-3 py-1 rounded-full ${shop.status === 'active' ? 'bg-green-100 text-green-800' :
                                shop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {shop.status || 'Unknown'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="text-sm text-gray-500">Category</span>
                                <p className="font-medium">{shop.shopcategory_name}</p>
                            </div>
                        </div>
                        {shop.description && (
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">Description</span>
                                <p className="text-gray-700 mt-1">{shop.description}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Branches</h3>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading branches...</span>
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                            <p className="text-lg text-gray-600 mb-4">No branches found for this shop.</p>
                            <button
                                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                                onClick={openAddBranchDialog}
                            >
                                Add Your First Branch
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {branches.map(branch => (
                                <div className="bg-white border rounded-lg shadow overflow-hidden" key={branch.branch_id}>
                                    {branch.branch_picture && (
                                        <div className="h-40 bg-gray-200 overflow-hidden">
                                            <img
                                                src={branch.branch_picture}
                                                alt={`Branch ${branch.branch_id}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold">Branch #{branch.branch_id}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${branch.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                branch.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    branch.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {branch.approval_status || 'pending'}
                                            </span>
                                        </div>

                                        {branch.description && (
                                            <p className="text-sm text-gray-600 my-2">{branch.description}</p>
                                        )}

                                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                                            {branch.opening_hours && branch.closing_hours && (
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {branch.opening_hours} - {branch.closing_hours}
                                                </div>
                                            )}

                                            {branch.contact_number && (
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {branch.contact_number}
                                                </div>
                                            )}

                                            {branch.latitude && branch.longitude && (
                                                <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {parseFloat(branch.latitude).toFixed(6)}, {parseFloat(branch.longitude).toFixed(6)}
                                              </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 border-t flex justify-end">
                                        <Link
                                            to={`/vendor/shop/${shopId}/branch/${branch.branch_id}`}
                                            className="text-primary-600 hover:bg-primary-50 font-medium text-sm px-3 py-1 rounded transition-colors flex items-center mr-2"
                                        >
                                            View Details
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                        <button
                                            onClick={() => openUpdateBranchDialog(branch)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-3 py-1 rounded transition-colors flex items-center mr-2"
                                        >
                                            Update
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBranch(branch.branch_id)}
                                            className={`${branch.approval_status === 'approved'
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700'} 
                                            text-white font-medium text-sm px-3 py-1 rounded transition-colors flex items-center`}
                                            title={branch.approval_status === 'approved' ? 'Approved branches cannot be deleted' : 'Delete this branch'}
                                        >
                                            Delete
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Add Branch Dialog */}
            {showAddBranchDialog && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeAddBranchDialog}></div>

                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
                            <div className="bg-primary-600 px-4 py-3">
                                <h3 className="text-lg font-medium leading-6 text-white">Add New Branch</h3>
                            </div>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <form id="add-branch-form" onSubmit={handleAddBranch}>
                                            <div className="mb-4">
                                                <div className="text-sm text-gray-600 mb-2">
                                                    Click on the map to select your branch location and automatically populate address fields:
                                                </div>

                                                <div className="h-64 w-full mb-4 rounded-md overflow-hidden border border-gray-300">
                                                    <MapContainer
                                                        center={mapCenter}
                                                        zoom={6}
                                                        scrollWheelZoom={true}
                                                        style={{ height: '100%', width: '100%' }}
                                                    >
                                                        <TileLayer
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />
                                                        <LocationMarker
                                                            position={position}
                                                            setPosition={setPosition}
                                                            handleLocationSelect={handleLocationSelect}
                                                        />
                                                    </MapContainer>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-4">
                                                    {isAddressLoading ? (
                                                        <>Loading address information...</>
                                                    ) : position ? (
                                                        <>Selected coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}</>
                                                    ) : (
                                                        <>Click on the map to select your location</>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows="2"
                                                    value={branchFormData.description}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                ></textarea>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700 mb-1">Opening Hours <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="time"
                                                        id="opening_hours"
                                                        name="opening_hours"
                                                        value={branchFormData.opening_hours}
                                                        onChange={handleFormChange}
                                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.opening_hours ? 'border-red-500' : 'border-gray-300'}`}
                                                        required
                                                    />
                                                    {formErrors.opening_hours && <div className="mt-1 text-sm text-red-600">{formErrors.opening_hours}</div>}
                                                </div>
                                                <div>
                                                    <label htmlFor="closing_hours" className="block text-sm font-medium text-gray-700 mb-1">Closing Hours <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="time"
                                                        id="closing_hours"
                                                        name="closing_hours"
                                                        value={branchFormData.closing_hours}
                                                        onChange={handleFormChange}
                                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.closing_hours ? 'border-red-500' : 'border-gray-300'}`}
                                                        required
                                                    />
                                                    {formErrors.closing_hours && <div className="mt-1 text-sm text-red-600">{formErrors.closing_hours}</div>}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    id="contact_number"
                                                    name="contact_number"
                                                    value={branchFormData.contact_number}
                                                    onChange={handleFormChange}
                                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.contact_number ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                />
                                                {formErrors.contact_number && <div className="mt-1 text-sm text-red-600">{formErrors.contact_number}</div>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude <span className="text-red-500">*</span></label>
                                                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                                        {position ? position[0].toFixed(6) : 'Not selected'}
                                                    </div>
                                                    {formErrors.latitude && <div className="mt-1 text-sm text-red-600">{formErrors.latitude}</div>}
                                                    <input
                                                        type="hidden"
                                                        id="latitude"
                                                        name="latitude"
                                                        value={branchFormData.latitude}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude <span className="text-red-500">*</span></label>
                                                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                                        {position ? position[1].toFixed(6) : 'Not selected'}
                                                    </div>
                                                    {formErrors.longitude && <div className="mt-1 text-sm text-red-600">{formErrors.longitude}</div>}
                                                    <input
                                                        type="hidden"
                                                        id="longitude"
                                                        name="longitude"
                                                        value={branchFormData.longitude}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="city_ID" className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                                <select
                                                    id="city_ID"
                                                    name="city_ID"
                                                    value={branchFormData.city_ID}
                                                    onChange={handleFormChange}
                                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.city_ID ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                >
                                                    <option value="">Select a city</option>
                                                    {cities.map(city => (
                                                        <option key={city.id} value={city.id}>{city.name}</option>
                                                    ))}
                                                </select>
                                                {formErrors.city_ID && <div className="mt-1 text-sm text-red-600">{formErrors.city_ID}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="area_name" className="block text-sm font-medium text-gray-700 mb-1">Area Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    id="area_name"
                                                    name="area_name"
                                                    value={branchFormData.area_name}
                                                    onChange={handleFormChange}
                                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.area_name ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                />
                                                {formErrors.area_name && <div className="mt-1 text-sm text-red-600">{formErrors.area_name}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                                <input
                                                    type="text"
                                                    id="postal_code"
                                                    name="postal_code"
                                                    value={branchFormData.postal_code}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="branch_picture" className="block text-sm font-medium text-gray-700 mb-1">Branch Picture</label>
                                                <input
                                                    type="file"
                                                    id="branch_picture"
                                                    name="branch_picture"
                                                    onChange={handleFormChange}
                                                    accept="image/jpeg,image/png,image/jpg"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="submit"
                                    form="add-branch-form"
                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Add Branch
                                </button>
                                <button
                                    type="button"
                                    onClick={closeAddBranchDialog}
                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Branch Dialog */}
            {showUpdateBranchDialog && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeUpdateBranchDialog}></div>

                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
                            <div className="bg-primary-600 px-4 py-3">
                                <h3 className="text-lg font-medium leading-6 text-white">Update Branch #{selectedBranch?.branch_id}</h3>
                            </div>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <form id="update-branch-form" onSubmit={handleUpdateBranch}>
                                            <div className="mb-4">
                                                <div className="text-sm text-gray-600 mb-2">
                                                    Click on the map to update your branch location and automatically populate address fields:
                                                </div>

                                                <div className="h-64 w-full mb-4 rounded-md overflow-hidden border border-gray-300">
                                                    <MapContainer
                                                        center={position || mapCenter}
                                                        zoom={position ? 15 : 6}
                                                        scrollWheelZoom={true}
                                                        style={{ height: '100%', width: '100%' }}
                                                    >
                                                        <TileLayer
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />
                                                        <LocationMarker
                                                            position={position}
                                                            setPosition={setPosition}
                                                            handleLocationSelect={handleLocationSelect}
                                                        />
                                                    </MapContainer>
                                                </div>

                                                <div className="text-sm text-gray-600 mb-4">
                                                    {isAddressLoading ? (
                                                        <>Loading address information...</>
                                                    ) : position ? (
                                                        <>Selected coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}</>
                                                    ) : (
                                                        <>Click on the map to select your location</>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows="2"
                                                    value={branchFormData.description}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                ></textarea>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700 mb-1">Opening Hours <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="time"
                                                        id="opening_hours"
                                                        name="opening_hours"
                                                        value={branchFormData.opening_hours}
                                                        onChange={handleFormChange}
                                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.opening_hours ? 'border-red-500' : 'border-gray-300'}`}
                                                        required
                                                    />
                                                    {formErrors.opening_hours && <div className="mt-1 text-sm text-red-600">{formErrors.opening_hours}</div>}
                                                </div>
                                                <div>
                                                    <label htmlFor="closing_hours" className="block text-sm font-medium text-gray-700 mb-1">Closing Hours <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="time"
                                                        id="closing_hours"
                                                        name="closing_hours"
                                                        value={branchFormData.closing_hours}
                                                        onChange={handleFormChange}
                                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.closing_hours ? 'border-red-500' : 'border-gray-300'}`}
                                                        required
                                                    />
                                                    {formErrors.closing_hours && <div className="mt-1 text-sm text-red-600">{formErrors.closing_hours}</div>}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    id="contact_number"
                                                    name="contact_number"
                                                    value={branchFormData.contact_number}
                                                    onChange={handleFormChange}
                                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.contact_number ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                />
                                                {formErrors.contact_number && <div className="mt-1 text-sm text-red-600">{formErrors.contact_number}</div>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude <span className="text-red-500">*</span></label>
                                                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                                        {position ? position[0].toFixed(6) : 'Not selected'}
                                                    </div>
                                                    {formErrors.latitude && <div className="mt-1 text-sm text-red-600">{formErrors.latitude}</div>}
                                                    <input
                                                        type="hidden"
                                                        id="latitude"
                                                        name="latitude"
                                                        value={branchFormData.latitude}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude <span className="text-red-500">*</span></label>
                                                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                                                        {position ? position[1].toFixed(6) : 'Not selected'}
                                                    </div>
                                                    {formErrors.longitude && <div className="mt-1 text-sm text-red-600">{formErrors.longitude}</div>}
                                                    <input
                                                        type="hidden"
                                                        id="longitude"
                                                        name="longitude"
                                                        value={branchFormData.longitude}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="city_ID" className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                                <select
                                                    id="city_ID"
                                                    name="city_ID"
                                                    value={branchFormData.city_ID}
                                                    onChange={handleFormChange}
                                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.city_ID ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                >
                                                    <option value="">Select a city</option>
                                                    {cities.map(city => (
                                                        <option key={city.id} value={city.id}>{city.name}</option>
                                                    ))}
                                                </select>
                                                {formErrors.city_ID && <div className="mt-1 text-sm text-red-600">{formErrors.city_ID}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="area_name" className="block text-sm font-medium text-gray-700 mb-1">Area Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    id="area_name"
                                                    name="area_name"
                                                    value={branchFormData.area_name}
                                                    onChange={handleFormChange}
                                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 ${formErrors.area_name ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                />
                                                {formErrors.area_name && <div className="mt-1 text-sm text-red-600">{formErrors.area_name}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                                <input
                                                    type="text"
                                                    id="postal_code"
                                                    name="postal_code"
                                                    value={branchFormData.postal_code}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label htmlFor="branch_picture" className="block text-sm font-medium text-gray-700 mb-1">Branch Picture</label>
                                                {selectedBranch && selectedBranch.branch_picture && (
                                                    <div className="mb-2">
                                                        <div className="text-sm text-gray-600 mb-1">Current picture:</div>
                                                        <div className="h-24 w-24 overflow-hidden rounded border border-gray-300">
                                                            <img
                                                                src={selectedBranch.branch_picture}
                                                                alt="Current branch"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">Upload a new image to replace this one</div>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    id="branch_picture"
                                                    name="branch_picture"
                                                    onChange={handleFormChange}
                                                    accept="image/jpeg,image/png,image/jpg"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="submit"
                                    form="update-branch-form"
                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Update Branch
                                </button>
                                <button
                                    type="button"
                                    onClick={closeUpdateBranchDialog}
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

export default ShopDetail 