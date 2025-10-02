import config from './config'

/**
 * Vendor signup API call
 * @param {FormData} formData - Form data with vendor information
 * @returns {Promise} Promise with API response
 */
export const vendorSignup = async (formData) => {
  try {
    const response = await fetch(`${config.baseUrl}/vendor/signup`, {
      method: 'POST',
      body: formData,
      // No Content-Type header needed with FormData
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        data
      }
    }
    
    return {
      success: true,
      status: response.status,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to connect to the server'
    }
  }
}

/**
 * User login API call
 * @param {Object} credentials - User login credentials
 * @returns {Promise} Promise with API response
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${config.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        data
      }
    }
    
    return {
      success: true,
      status: response.status,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to connect to the server'
    }
  }
}

/**
 * Generic API request function for future use
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object|FormData} body - Request body
 * @param {Object} headers - Custom headers
 * @returns {Promise} Promise with API response
 */
export const apiRequest = async (endpoint, method = 'GET', body = null, headers = {}) => {
  try {
    const url = `${config.baseUrl}${endpoint}`
    
    const options = {
      method,
      headers: {
        ...headers
      }
    }
    
    if (body) {
      if (body instanceof FormData) {
        options.body = body
      } else {
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(body)
      }
    }
    
    const response = await fetch(url, options)
    const data = await response.json()
    
    return {
      success: response.ok,
      status: response.status,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'API request failed'
    }
  }
}

export const customerSignup = async (formData) => {
  try {
    const response = await fetch(`${config.baseUrl}/signup`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        data
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Customer signup error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Organization signup API call
 * @param {FormData} formData - Form data with organization information
 * @returns {Promise} Promise with API response
 */
export const organizationSignup = async (formData) => {
  try {
    const response = await fetch(`${config.baseUrl}/organization/signup`, {
      method: 'POST',
      body: formData,
      // No Content-Type header needed with FormData
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        data
      }
    }
    
    return {
      success: true,
      status: response.status,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to connect to the server'
    }
  }
} 