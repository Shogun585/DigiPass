import axios from 'axios';

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
      now.setHours(0,0,0,0)
      const today = now.toISOString().split('T')[0];

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
    updatePassStatus: (passId, status, remark = '') => {
      api.put(`/pass/status/${passId}`, { pass_status: status.toLowerCase(), remark}) 
    },
    convertPass : (leaveEndDate) => {
      return api.post('/pass/convert', {leave_end : leaveEndDate})
    },
    extendPass : (passId, newDate) => {
      api.post(`/pass/extend/${passId}`, {new_leave_end : newDate})
    },
    getLateReturns : () => api.get('/pass/late-returns'),
    addPassRemark : (passId, remark) => api.put(`/pass/remark/${passId}`, {remark}),
    getAllLogs: (page = 1, limit = 20) => api.get(`/pass/logs?page=${page}&limit=${limit}`)
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