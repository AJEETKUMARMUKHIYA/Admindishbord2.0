import axios from 'axios';

// Get base URL from environment variable
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://packyatra.in/api';

// console.log('Environment Mode:', import.meta.env.MODE);
// console.log('API Base URL:', baseURL);

// Create axios instance with default config
const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increase timeout to 30 seconds
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    // if (import.meta.env.DEV) {
    //   console.log('API Request:', {
    //     url: config.url,
    //     method: config.method,
    //     data: config.data
    //   });
    // }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      // console.log('API Response:', {
      //   url: response.config.url,
      //   status: response.status,
      //   data: response.data
      // });
    }
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error - Check if server is running');
      throw new Error('Network Error: Cannot connect to server. Please check if the backend is running.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;