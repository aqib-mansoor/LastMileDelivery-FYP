import config from './config'

export const variablesService = {
    // Get all variables
    getAllVariables: async () => {
        const response = await fetch(`${config.baseUrl}/variables`)
        if (!response.ok) {
            throw new Error(`Failed to fetch variables: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        console.log('Variables API response:', data) // Debug logging
        return data
    },

    // Add a new variable
    addVariable: async (variableData) => {
        const response = await fetch(`${config.baseUrl}/admin/add-variable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(variableData)
        })
        
        if (!response.ok) {
            throw new Error('Failed to add variable')
        }
        return response.json()
    },

    // Get mappings for a specific branch and API vendor
    getMappings: async (branchId, apivendorId) => {
        const response = await fetch(`${config.baseUrl}/mappings/${branchId}/${apivendorId}`)
        if (!response.ok) {
            throw new Error('Failed to fetch mappings')
        }
        return response.json()
    },

    // Save variable mappings
    saveVariableMappings: async (mappingData) => {
        const response = await fetch(`${config.baseUrl}/admin/mappings/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappingData)
        })
        
        if (!response.ok) {
            throw new Error('Failed to save variable mappings')
        }
        return response.json()
    },

    // Update a specific variable mapping
    updateVariableMapping: async (mappingId, mappingData) => {
        const response = await fetch(`${config.baseUrl}/admin/mapping/${mappingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappingData)
        })
        
        if (!response.ok) {
            throw new Error('Failed to update variable mapping')
        }
        return response.json()
    }
}

export default variablesService 