import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { verifyAPI } from '../../services/api';
import './VerificationPage.css';

const VerificationPage = () => {
  const [collegeId, setCollegeId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'scan'
  const fileInputRef = useRef(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleManualVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationResult(null);
    
    try {
      const response = await verifyAPI.manualVerify(collegeId);
      setVerificationResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        valid: false,
        message: error.response?.data?.detail || 'Verification failed',
        pass_details: null,
        user_details: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setVerificationResult(null);
    
    try {
      const response = await verifyAPI.scanBarcode(file);
      setVerificationResult(response.data);
    } catch (error) {
      console.error('Barcode scan error:', error);
      setVerificationResult({
        valid: false,
        message: error.response?.data?.detail || 'Failed to scan barcode',
        pass_details: null,
        user_details: null
      });
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReset = () => {
    setCollegeId('');
    setVerificationResult(null);
    setScanMode('manual');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>Pass Verification Portal - {user?.first_name} {user?.last_name}</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="content">
        <div className="verification-container">
          <h2>Verification Page</h2>
          
          {/* Mode Selection */}
          <div className="mode-selector">
            <button
              className={`mode-btn ${scanMode === 'manual' ? 'active' : ''}`}
              onClick={() => setScanMode('manual')}
            >
              Manual Entry
            </button>
            <button
              className={`mode-btn ${scanMode === 'scan' ? 'active' : ''}`}
              onClick={() => setScanMode('scan')}
            >
              Scan Barcode
            </button>
          </div>

          {/* Manual Entry Mode */}
          {scanMode === 'manual' && (
            <form onSubmit={handleManualVerify} className="verification-form">
              <p>Enter College ID to verify pass</p>
              
              <div className="form-group">
                <input
                  type="text"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  placeholder="Enter College ID (e.g., AXXXXCS1234)"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="button-group">
                <button type="submit" className="btn-verify" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                {verificationResult && (
                  <button type="button" onClick={handleReset} className="btn-reset">
                    Reset
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Barcode Scan Mode */}
          {scanMode === 'scan' && (
            <div className="scan-mode">
              <p>Upload or capture ID card image for barcode scanning</p>
              
              <div className="file-upload-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleBarcodeScan}
                  id="barcode-file-input"
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="barcode-file-input" className="file-upload-label">
                  {loading ? (
                    <span>📷 Scanning...</span>
                  ) : (
                    <>
                      <span className="upload-icon">📷</span>
                      <span>Click to Capture or Upload ID Card</span>
                      <span className="upload-hint">Supports: JPG, PNG</span>
                    </>
                  )}
                </label>
              </div>

              {verificationResult && (
                <button onClick={handleReset} className="btn-reset">
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className={`verification-result ${verificationResult.valid ? 'success' : 'error'}`}>
              {verificationResult.valid ? (
                <div className="pass-details">
                  <h3>✓ Valid Pass Found</h3>
                  
                  {verificationResult.user_details && (
                    <div className="user-info">
                      <h4>Student Information</h4>
                      <div className="detail-row">
                        <strong>Name:</strong> 
                        {verificationResult.user_details.first_name} {verificationResult.user_details.last_name}
                      </div>
                      <div className="detail-row">
                        <strong>College ID:</strong> {verificationResult.user_details.id}
                      </div>
                      {verificationResult.user_details.contact_details && (
                        <div className="detail-row">
                          <strong>Contact:</strong> {verificationResult.user_details.contact_details}
                        </div>
                      )}
                    </div>
                  )}

                  {verificationResult.pass_details && (
                    <div className="pass-info">
                      <h4>Pass Details</h4>
                      <div className="detail-row">
                        <strong>Pass Type:</strong> 
                        <span className="pass-type-badge">
                          {verificationResult.pass_details.pass_type.toUpperCase()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <strong>Valid From:</strong> {formatDate(verificationResult.pass_details.leave_start)}
                      </div>
                      <div className="detail-row">
                        <strong>Valid Until:</strong> {formatDate(verificationResult.pass_details.leave_end)}
                      </div>
                      <div className="detail-row">
                        <strong>Status:</strong>
                        <span className="status-badge status-approved">
                          {verificationResult.pass_details.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="success-message">
                    <p>{verificationResult.message}</p>
                  </div>
                </div>
              ) : (
                <div className="error-details">
                  <h3>✗ Verification Failed</h3>
                  <p>{verificationResult.message}</p>
                  
                  {verificationResult.user_details && (
                    <div className="user-info-minimal">
                      <p>User found: {verificationResult.user_details.first_name} {verificationResult.user_details.last_name}</p>
                      <p className="no-pass-msg">No valid pass for current date</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;