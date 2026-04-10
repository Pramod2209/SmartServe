/**
 * API utility for making requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get user from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Set user in localStorage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user from localStorage
export const removeUser = () => {
  localStorage.removeItem('user');
};

/**
 * Make API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth token if available
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getMe: () => apiRequest('/auth/me'),
};

// Services API
export const servicesAPI = {
  getAll: () => apiRequest('/services'),
  
  getById: (id) => apiRequest(`/services/${id}`),
  
  create: (serviceData) => apiRequest('/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }),
  
  update: (id, serviceData) => apiRequest(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
  }),
  
  delete: (id) => apiRequest(`/services/${id}`, {
    method: 'DELETE',
  }),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => apiRequest('/bookings'),
  
  getById: (id) => apiRequest(`/bookings/${id}`),
  
  create: (bookingData) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  
  update: (id, bookingData) => apiRequest(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookingData),
  }),
  
  delete: (id) => apiRequest(`/bookings/${id}`, {
    method: 'DELETE',
  }),
};

// Users API
export const usersAPI = {
  getAll: (role) => {
    const query = role ? `?role=${role}` : '';
    return apiRequest(`/users${query}`);
  },
  
  getById: (id) => apiRequest(`/users/${id}`),
  
  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Technicians API
export const techniciansAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/technicians${query}`);
  },
  
  getById: (id) => apiRequest(`/technicians/${id}`),
  
  update: (id, techData) => apiRequest(`/technicians/${id}`, {
    method: 'PUT',
    body: JSON.stringify(techData),
  }),
  
  verify: (id, verified) => apiRequest(`/technicians/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ verified }),
  }),
};

// Reviews API
export const reviewsAPI = {
  getByBooking: (bookingId) => apiRequest(`/reviews/booking/${bookingId}`),

  upsert: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),
};
