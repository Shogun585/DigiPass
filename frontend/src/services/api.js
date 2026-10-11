import axios from 'axios';
import { getPassCurfewIsoString } from '../constants/passConfig';

  const API_BASE_URL = import.meta.env.VITE_API_URL;
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
    
    const response = await api.post('/login/', {
      username,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

// Pass API
export const passAPI = {
  createPass: (passData) => {
      const now = new Date();
      
      let passType = 'market';  
      if (passData.passType) {
        if (passData.passType.toLowerCase().includes('leave')) {
          passType = 'leave';
        } else if (passData.passType.toLowerCase().includes('market')) {
          passType = 'market';
        }
      }

      // Application time is exact current timestamp
      const leaveStart = passData.leave_start || now.toISOString();

      // End time is anchored to configured curfew in IST (8:30 PM IST)
      const leaveEnd = passData.leave_end 
        ? (passData.leave_end.includes('T') ? passData.leave_end : getPassCurfewIsoString(passData.leave_end))
        : getPassCurfewIsoString(now);
      
      return api.post('/pass/', {
        pass_type: passType,  
        leave_start: leaveStart,
        leave_end: leaveEnd
      });
    },
    
    getMyPasses: () => api.get('/pass/my_pass'),  
    getPendingPasses: () => api.get('/pass/pending'),
    getAllPasses: () => api.get('/pass/all'),
    updatePassStatus: (passId, status, remark = '') => {
      return api.put(`/pass/status/${passId}`, { pass_status: status.toLowerCase(), remark}) 
    },
    convertPass : (leaveEndDate) => {
      const formattedEndDate = leaveEndDate?.includes('T') ? leaveEndDate : getPassCurfewIsoString(leaveEndDate);
      return api.post('/pass/convert', { leave_end : formattedEndDate });
    },
    extendPass : (passId, newDate) => {
      const formattedEndDate = newDate?.includes('T') ? newDate : getPassCurfewIsoString(newDate);
      return api.post(`/pass/extend/${passId}`, { new_leave_end : formattedEndDate });
    },
    getLateReturns : () => api.get('/pass/late-returns'),
    addPassRemark : (passId, remark) => api.put(`/pass/remark/${passId}`, {remark}),
    getAllLogs: (page = 1, limit = 20) => api.get(`/pass/logs?page=${page}&limit=${limit}`),
    getUnified: (params) => api.get(`/pass/unified?${params.toString()}`)
  };

// Verification API
export const verifyAPI = {
  scanBarcode: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/verify/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  manualVerify: (collegeId) => api.get(`/verify/manual/${collegeId}`),

  checkOut : (passId) => api.post(`/verify/checkout/${passId}`),
  checkIn : (passId) => api.post(`/verify/checkin/${passId}`),
  
};

export const adminAPI = {
  createUser : (userData) => api.post('/admin/users', userData),
  bulkUploadUsers : (formData) => api.post('/admin/users/bulk', formData, {
    headers : {
      'Content-Type' : 'multipart/form-data'
    }
  }),
  deactivateUser : (userId) => api.delete(`/admin/users/${userId}`),
  resetPassword : (userId, newPassword) => api.put(`/admin/users/${userId}/password`, {
    new_password : newPassword
  })
}

export default api;