import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
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

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/login/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Pass API
export const passAPI = {
  createPass: (passData) => {
      // const today = new Date(new Date().toLocaleDateString("en-US",{
      //   timeZone: "Asia/Kolkata"
      // })).toISOString().split('T')[0];
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      console.log(`today's date : ${today}`)
      
      let passType = 'market';  
      if (passData.passType) {
        if (passData.passType.toLowerCase().includes('market') || passData.passType === 'market') {
          passType = 'market';
        } else if (passData.passType.toLowerCase().includes('leave') || passData.passType === 'leave') {
          passType = 'leave';
        }
      }
      
      return api.post('/pass/', {
        pass_type: passType,  
        leave_start: passData.leave_start || today,
        leave_end: passData.leave_end || today
      });
    },
    
    getMyPasses: () => api.get('/pass/my_pass'),  
    getPendingPasses: () => api.get('/pass/pending'),
    getAllPasses: () => api.get('/pass/all'),
    updatePassStatus: (passId, status) => 
      api.put(`/pass/status/${passId}`, { pass_status: status.toLowerCase() }) 
  };

// Verification API
export const verifyAPI = {
  scanBarcode: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/verify/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  manualVerify: (collegeId) => api.get(`/verify/manual/${collegeId}`),
};

export default api;