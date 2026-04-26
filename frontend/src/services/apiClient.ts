import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8084/api', // Updated to match active backend port 8084
});

// Add a request interceptor to include the JWT token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
