import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { verifyAPI } from '../../services/api';

const VerificationPage = () => {
  const [collegeId, setCollegeId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('manual');
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
        user_details: null,
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
        user_details: null,
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const Row = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2.5 border-b border-slate-100 last:border-b-0 gap-1">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-slate-900">{children}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IMSEC Hostel Portal</h1>
              <p className="text-xs text-indigo-200">Verification — {user?.first_name} {user?.last_name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 ring-1 ring-white/20 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Verify Student Pass</h2>
          <p className="text-sm text-slate-500 mt-1">Enter a college ID or scan a barcode to confirm a valid pass.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          {/* Mode tabs */}
          <div className="p-1.5 m-4 mb-0 bg-slate-100 rounded-xl grid grid-cols-2 gap-1">
            <button
              onClick={() => setScanMode('manual')}
              className={`py-2 text-sm font-medium rounded-lg transition ${
                scanMode === 'manual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setScanMode('scan')}
              className={`py-2 text-sm font-medium rounded-lg transition ${
                scanMode === 'scan' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scan Barcode
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {scanMode === 'manual' ? (
              <form onSubmit={handleManualVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">College ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5M10 6V4a2 2 0 014 0v2M10 6h4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      placeholder="e.g., AXXXXCS1234"
                      required
                      disabled={loading}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  {verificationResult && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition"
                  >
                    {loading && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    )}
                    {loading ? 'Verifying…' : 'Verify Pass'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
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
                <label
                  htmlFor="barcode-file-input"
                  className="block py-12 px-6 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50/40 hover:bg-indigo-50 cursor-pointer transition text-center"
                >
                  {loading ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-700">
                      <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <p className="text-sm font-medium">Scanning barcode…</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm ring-1 ring-indigo-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-slate-900">Capture or Upload ID Card</p>
                      <p className="text-xs text-slate-500">Supports JPG, PNG · Tap to choose a file</p>
                    </div>
                  )}
                </label>

                {verificationResult && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {verificationResult && (
              <div className="mt-6">
                {verificationResult.valid ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900">Valid Pass Found</h3>
                        <p className="text-xs text-emerald-700">{verificationResult?.message || 'Verification successful'}</p>
                      </div>
                    </div>

                    {verificationResult?.user_details && (
                      <div className="bg-white rounded-lg p-4 mb-3 ring-1 ring-slate-200">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Student Information</h4>
                        <Row label="Name">
                          {verificationResult.user_details?.first_name || ''} {verificationResult.user_details?.last_name || ''}
                        </Row>
                        <Row label="College ID">{verificationResult.user_details?.id || 'N/A'}</Row>
                        {verificationResult.user_details?.contact_details && (
                          <Row label="Contact">{verificationResult.user_details.contact_details}</Row>
                        )}
                      </div>
                    )}

                    {verificationResult?.pass_details && (
                      <div className="bg-white rounded-lg p-4 ring-1 ring-slate-200">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Pass Details</h4>
                        <Row label="Pass Type">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-indigo-100">
                            {verificationResult.pass_details?.pass_type?.toUpperCase() || 'N/A'}
                          </span>
                        </Row>
                        <Row label="Valid From">
                          {verificationResult.pass_details?.leave_start ? formatDate(verificationResult.pass_details.leave_start) : 'N/A'}
                        </Row>
                        <Row label="Valid Until">
                          {verificationResult.pass_details?.leave_end ? formatDate(verificationResult.pass_details.leave_end) : 'N/A'}
                        </Row>
                        <Row label="Status">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold ring-1 ring-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {verificationResult.pass_details?.pass_status?.toUpperCase() || 'N/A'}
                          </span>
                        </Row>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-rose-900">Verification Failed</h3>
                        <p className="text-xs text-rose-700">{verificationResult?.message || 'No valid pass for current date'}</p>
                      </div>
                    </div>

                    {verificationResult?.user_details && (
                      <div className="bg-white rounded-lg p-4 ring-1 ring-slate-200">
                        <p className="text-sm text-slate-700">
                          User found:{' '}
                          <span className="font-medium text-slate-900">
                            {verificationResult.user_details?.first_name || ''} {verificationResult.user_details?.last_name || ''}
                          </span>
                        </p>
                        <p className="text-xs text-rose-700 font-medium mt-1">No valid pass for current date</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerificationPage;