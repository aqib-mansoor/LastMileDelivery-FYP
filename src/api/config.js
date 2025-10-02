// API configuration
const config = {
  baseUrl: 'http://127.0.0.1:8000/api', // Change this to your API base URL
  deliveryFee: 50, // Delivery fee in PKR
}

// Fetch API helper
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${config.baseUrl}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

export default config 