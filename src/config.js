// Application configuration from environment variables
const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://packyatra.in/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Admin Dashboard',
    version: import.meta.env.VITE_APP_VERSION || '2.0',
    environment: import.meta.env.MODE || 'development',
  },
  
  // Feature Flags
  features: {
    enableExport: import.meta.env.VITE_FEATURE_EXPORT === 'true' || true,
    enableNotifications: import.meta.env.VITE_FEATURE_NOTIFICATIONS === 'true' || true,
    enableAnalytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true' || true,
  },
  
  // Development Settings
  development: {
    defaultUsername: import.meta.env.VITE_DEFAULT_USERNAME || 'admin',
    defaultPassword: import.meta.env.VITE_DEFAULT_PASSWORD || '123',
    mockApi: import.meta.env.VITE_MOCK_API === 'true' || false,
  },
  
  // Validation
  validation: {
    passwordMinLength: parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || 6,
    usernameMinLength: parseInt(import.meta.env.VITE_USERNAME_MIN_LENGTH) || 3,
  },
  
  // URLs
  urls: {
    login: '/Auth/Login',
    tickets: '/Booking/Tickets',
    supervisors: '/Booking/Supervisors',
    adminUsers: '/AdminUser/Users',
    assignTicket: '/Booking/AssignTicket',
    updateTicket: '/Booking/UpdateTicket',
    createUser: '/AdminUser/CreateUser',
    updateUser: '/AdminUser/UpdateUser',
    deleteUser: '/AdminUser/DeleteUser',
    dashboardStats: '/Dashboard/Stats',
     dashboardRecentBookings: '/Dashboard/recent-bookings',
       dashboardUpdateBookings: '/Booking/update-booking',

  },
};

// Validate required environment variables
const validateEnv = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0 && import.meta.env.PROD) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  // if (import.meta.env.DEV) {
  //   console.log('Environment:', config.app.environment);
  //   console.log('API Base URL:', config.api.baseURL);
  // }
};

// Run validation
validateEnv();

export default config;