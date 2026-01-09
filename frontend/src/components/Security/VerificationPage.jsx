import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { verifyAPI } from '../../services/api';

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
    <div className="
        min-h-screen
        bg-[#f8f9fa]
    ">
      <header className="
        bg-[#154360]
        text-white
        py-5
        px-10
        flex
        justify-between
        items-center
      ">
        <div>
          <h1 className="
            m-0
            text-2xl
          ">IMSEC Hostel Portal</h1>
          <p className="
            mt-[5px]
            text-sm
            opacity-90
          ">Pass Verification Portal - {user?.first_name} {user?.last_name}</p>
        </div>
        <button onClick={handleLogout} className="
            py-2.5
            px-5
            bg-[#ff4d6b]
            text-white
            border-none
            rounded-md
            cursor-pointer
            font-semibold
        ">
          Logout
        </button>
      </header>

      <div className="
        py-8
        px-10
      ">
        <div className="
          max-w-[800px]
          my-0
          mx-auto
          bg-white
          p-8
          rounded-xl
          shadow-[0_2px_8px_rgba(0,0,0,0.1)]
        ">
          <h2 className="
            text-[#154360]
            mb-8
            text-center
            max-md:p-5
          ">Verification Page</h2>
          
          {/* Mode Selection */}
          <div className="
            flex
            gap-2.5
            mb-8
            justify-center
            max-md:flex-col
          ">
            <button
              className={`
                py-3 px-6
                border-2 border-solid border-[#3b86d1]
                rounded-md
                cursor-pointer
                font-semibold
                transition duration-300 ease-in-out delay-0
                hover:bg-[#e3f2fd] hover:text-[#3b86d1]
                max-md:w-full
               ${scanMode === 'manual' ?'bg-[#3b86d1] text-white':'bg-white text-[#3b86d1]'}`}
              onClick={() => setScanMode('manual')}
            >
              Manual Entry
            </button>
            <button
              className={`
                py-3 px-6
                border-2 border-solid border-[#3b86d1]
                rounded-md
                cursor-pointer
                font-semibold
                transition duration-300 ease-in-out delay-0
                hover:bg-[#e3f2fd] hover:text-[#3b86d1]
                max-md:w-full
                ${scanMode === 'scan' ?'bg-[#3b86d1] text-white':'bg-white text-[#3b86d1]'}
                `}
              onClick={() => setScanMode('scan')}
            >
              Scan Barcode
            </button>
          </div>

          {/* Manual Entry Mode */}
          {scanMode === 'manual' && (
            <form onSubmit={handleManualVerify} className="text-center">
              <p>Enter College ID to verify pass</p>
              
              <div className="mb-5">
                <input
                  type="text"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  placeholder="Enter College ID (e.g., AXXXXCS1234)"
                  required
                  disabled={loading}
                  className="w-full p-3.5 border-2 border-solid border-[#e0e0e0] rounded-md text-sm transition duration-300 focus:outline-none focus:border-[#3b86d1] disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
                />
              </div>
              
              <div className="flex gap-2.5 justify-center max-md:flex-col">
                <button type="submit" className="py-3.5 px-8 bg-[#3b86d1] text-white border-none rounded-md text-xs font-semibold cursor-pointer transition-colors delay-300 max-md:w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                {verificationResult && (
                  <button type="button" onClick={handleReset} className="py-3.5 px-8 bg-[#ff4d6b] text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors duration-300 max-md:w-full">
                    Reset
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Barcode Scan Mode */}
          {scanMode === 'scan' && (
            <div className="text-center">
              <p className="text-[#666] mb-5 text-sm">Upload or capture ID card image for barcode scanning</p>
              
              <div className="my-[30px] mx-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleBarcodeScan}
                  id="barcode-file-input"
                  className="hidden"
                  disabled={loading}
                />
                <label htmlFor="barcode-file-input" className="block py-[60px] px-10 border-[3px] border-dasahed border-[#3b86d1] rounded-xl bg-[#f8f9fa] cursor-pointer transition-all duration-300">
                  {loading ? (
                    <span>📷 Scanning...</span>
                  ) : (
                    <>
                      <span className="text-5xl block mb-[15px]">📷</span>
                      <span>Click to Capture or Upload ID Card </span>
                      <span className="!text-sm font-normal mt-2.5">Supports: JPG, PNG</span>
                    </>
                  )}
                </label>
              </div>

              {verificationResult && (
                <button onClick={handleReset} className="py-3.5 px-8 bg-[#ff4d6b] text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors duration-300 max-md:w-full">
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className={`mt-[30px] p-[30px] rounded-xl animate-slideIn ${verificationResult.valid ? 'bg-[#e8f5e9] border-2 border-solid border-[#21bf06]' : 'bg-[#ffebee] border-2 border-solid border-[#ff4d6b]'}`}>
              {verificationResult.valid ? (
                 <div className="pass-details">
                  <h3 className="mx-0 mt-0 mb-[25px] text-2xl">✓ Valid Pass Found</h3>
                  
                  {verificationResult?.user_details && (
                    <div className="bg-white p-5 rounded-[8px] mb-5">
                      <h4 className="text-[#154360] mx-0 mt-0 mb-[15px] text-lg border-b-2 border-b-[#e0e0e0] pb-2.5">Student Information</h4>
                      <div className="flex justify-between py-3 pb-0 border-b-[1px] border-solid border-b-[#f0f0f0] max-md:flex-col max-md:gap-[5px]">
                        <strong className="text-[#333] font-semibold">Name:</strong>
                        {verificationResult.user_details?.first_name || ''} {verificationResult.user_details?.last_name || ''}
                      </div>
                      <div className="flex justify-between py-3 px-0 border-b-[1px] border-solid border-b-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-[5px]">
                        <strong className="text-[#333] font-semibold">College ID:</strong> {verificationResult.user_details?.id || 'N/A'}
                      </div>
                      {verificationResult.user_details?.contact_details && (
                        <div className="flex justify-between py-3 px-0 border-b-[1px] border-solid border-b-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-[5px]">
                          <strong className="text-[#333] font-semibold">Contact:</strong> {verificationResult.user_details.contact_details}
                        </div>
                      )}
                    </div>
                  )}

                  {verificationResult?.pass_details && (
                    <div className="bg-white p-5 rounded-[8px] mb-5">
                      <h4 className="text-[#154360] mx-0 mt-0 mb-[15px] text-lg border-b-2 border-b-[#e0e0e0] pb-2.5">Pass Details</h4>
                      <div className="flex justify-between py-3 px-0 border-b-[1px] border-solid border-b-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-[5px]">
                        <strong className="text-[#333] font-semibold">Pass Type:</strong>
                        <span className="pass-type-badge">
                          {verificationResult.pass_details?.pass_type?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 px-0 border-b-[1px] border-solid border-b-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-[5px]">
                        <strong className="text-[#333] font-semibold">Valid From:</strong> {verificationResult.pass_details?.leave_start ? formatDate(verificationResult.pass_details.leave_start) : 'N/A'}
                      </div>
                      <div className="flex justify-between py-3 px-0 border-b-[1px] border-solid border-b-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-[5px]">
                        <strong className="text-[#333] font-semibold">Valid Until:</strong> {verificationResult.pass_details?.leave_end ? formatDate(verificationResult.pass_details.leave_end) : 'N/A'}
                      </div>
                      <div className="flex justify-between py-3 px-0 border-b-[1px] border-solid border-b-[#f0f0f0] last:border-b-0 max-md:flex-col max-md:gap-[5px]">
                        <strong className="text-[#333] font-semibold">Status:</strong>
                        <span className="font-semibold text-xs tracking-wider status-approved">
                          {verificationResult.pass_details?.pass_status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-[15px] rounded-lg text-center">
                    <p className="text-[#21bf06] font-semibold m-0 text-sm">{verificationResult?.message || 'Verification successful'}</p>
                  </div>
                </div>
              ) : (
                <div className="error-details">
                  <h3 className="mx-0 mt-0 mb-[25px] text-2xl">✗ Verification Failed</h3>
                  <p className="text-[#d32f2f] text-[16px] my-2.5 mx-0">{verificationResult?.message || 'Verification failed'}</p>
                  
                  {verificationResult?.user_details && (
                    <div className="bg-white p-[15px] rounded-lg mt-[15px]">
                      <p className="my-[5px] mx-0 text-[#666]">User found: {verificationResult.user_details?.first_name || ''} {verificationResult.user_details?.last_name || ''}</p>
                      <p className="!text-[#ff4d6b] font-semibold">No valid pass for current date</p>
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