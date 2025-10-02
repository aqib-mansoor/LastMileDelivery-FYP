import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import variablesService from '../../api/variablesService'

function Variables() {
    const [variables, setVariables] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingVariable, setEditingVariable] = useState(null)
    const [formData, setFormData] = useState({
        tags: ''
    })

    useEffect(() => {
        fetchVariables()
    }, [])

    const fetchVariables = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await variablesService.getAllVariables()
            console.log('Raw API response:', response) // Debug log
            
            // Handle the Laravel API response structure
            if (response.success && response.data) {
                setVariables(response.data)
            } else if (response.status === false) {
                // Empty state from Laravel API
                setVariables([])
            } else {
                // Fallback for unexpected structure
                setVariables([])
            }
        } catch (error) {
            console.error('Error fetching variables:', error)
            setError(error.message)
            setVariables([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const result = await variablesService.addVariable(formData)
            
            if (editingVariable) {
                // Update existing variable in state
                setVariables(variables.map(v => 
                    v.id === editingVariable.id ? { ...v, ...formData } : v
                ))
            } else {
                // Add new variable to state
                setVariables([...variables, { ...formData, id: result.id || Date.now() }])
            }

            // Reset form and close modal
            setFormData({
                tags: ''
            })
            setEditingVariable(null)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error saving variable:', error)
            alert('Failed to save variable. Please try again.')
        }
    }

    const openModal = (variable = null) => {
        if (variable) {
            setEditingVariable(variable)
            setFormData({
                tags: variable.tags || ''
            })
        } else {
            setEditingVariable(null)
            setFormData({
                tags: ''
            })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingVariable(null)
        setFormData({
            tags: ''
        })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading variables</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                            <button 
                                onClick={fetchVariables}
                                className="mt-2 text-red-800 hover:text-red-900 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Variables Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage system variables used for API integration and configuration.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Variable
                    </button>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {!Array.isArray(variables) || variables.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500">No variables found. Add your first variable to get started.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {variables.map((variable) => (
                            <li key={variable.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-primary truncate">
                                                    Variable #{variable.id}
                                                </p>
                                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    ID: {variable.id}
                                                </span>
                                            </div>
                                            {variable.tags && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Tags: {variable.tags}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(variable)}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {editingVariable ? 'Edit Variable' : 'Add New Variable'}
                        </h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                        Tags
                                    </label>
                                    <textarea
                                        name="tags"
                                        id="tags"
                                        rows={4}
                                        required
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="Enter variable tags or content..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    {editingVariable ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Variables 