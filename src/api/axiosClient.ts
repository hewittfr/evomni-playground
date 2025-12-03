import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5005'

export const api = axios.create({
  baseURL,
  timeout: 5000,
  withCredentials: true, // Enable sending Windows Auth credentials
})

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || 'User Not authorized';
      console.error('Authentication error:', errorMessage);
      // You can dispatch an action to show an error modal or redirect to an error page
    }
    return Promise.reject(error);
  }
)

export default api
