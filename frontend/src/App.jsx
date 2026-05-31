// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import ApplyPass from './components/Student/ApplyPass';
import ViewPass from './components/Student/ViewPass';
import ApprovalPage from './components/Warden/ApprovalPage';
import VerificationPage from './components/Security/VerificationPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';
import { PassProvider } from './context/PassContext';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <PassProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Admin Route */}
          <Route 
            path='/admin'
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          
          {/* Student Routes */}
          <Route
            path="/apply-pass"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ApplyPass />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-pass"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ViewPass />
              </ProtectedRoute>
            }
          />
          
          {/* Warden Routes */}
          <Route
            path="/warden-approval"
            element={
              <ProtectedRoute allowedRoles={['warden']}>
                <ApprovalPage />
              </ProtectedRoute>
            }
          />
          
          {/* Security/Guard Routes */}
          <Route
            path="/verification"
            element={
              <ProtectedRoute allowedRoles={['guard']}>
                <VerificationPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </PassProvider>
    </AuthProvider>
  );
}

export default App;