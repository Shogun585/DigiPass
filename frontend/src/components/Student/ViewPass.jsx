import { LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { passAPI } from '../../services/api';

// Helper for Display (DD-MM-YYYY)
export const getLocalDDMMYYY = (dateInput) => {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

// Helper for HTML Date Inputs (YYYY-MM-DD)
export const getHtmlDate = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ViewPass = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPassId, setExpandedPassId] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Convert Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Extend Modal State
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  const [extendPassId, setExtendPassId] = useState(null);
  const [extendError, setExtendError] = useState('');

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await passAPI.getMyPasses();
      setPasses(response.data || []);
    } catch (err) {
      console.error('Error fetching passes:', err);
      setError(err.response?.data?.detail || 'Failed to fetch passes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConvertPass = async () => {
    if (!newEndDate) {
      alert("Please select a return date");
      return;
    }
    setIsConverting(true);
    try {
      await passAPI.convertPass(newEndDate);
      setShowConvertModal(false);
      setNewEndDate('');
      fetchPasses();
      alert("Pass successfully extended and sent to the warden for approval");
    } catch (error) {
      console.error("Failed to convert pass: ", error);
      alert(error.response?.data?.detail || "Failed to extend pass");
    } finally {
      setIsConverting(false);
    }
  };

  const handleExtendPass = async () => {
    setExtendError('');
    if (!extendDate) {
      alert("Please select a new return date");
      return;
    }
    setIsExtending(true);
    try {
      await passAPI.extendPass(extendPassId, extendDate);
      setShowExtendModal(false);
      setExtendDate('');
      setExtendPassId(null);
      fetchPasses();
    } catch (error) {
      console.error("Failed to extend pass: ", error);
      setExtendError(error.response?.data?.detail || "Failed to extend pass");
    } finally {
      setIsExtending(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const s = (status || 'pending').toLowerCase();
    const styles = {
      approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
      pending: 'bg-amber-50 text-amber-800 ring-amber-200',
    };
    const dot = {
      approved: 'bg-emerald-500',
      rejected: 'bg-rose-500',
      pending: 'bg-amber-500',
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${styles[s] || styles.pending}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot[s] || dot.pending}`} />
        {s.toUpperCase()}
      </span>
    );
  };

  // Compute stats
  const counts = passes.reduce(
    (acc, p) => {
      const s = (p.pass_status || 'pending').toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { approved: 0, rejected: 0, pending: 0 }
  );

  // Setup date boundaries for inputs
  const todayHtml = getHtmlDate(new Date());
  const selectedPass = passes.find(p => p.pass_id === extendPassId);
  let minExtensionDate = todayHtml; 

  if (selectedPass) {
      const currentEnd = new Date(selectedPass.leave_end);
      currentEnd.setDate(currentEnd.getDate() + 1); 
      minExtensionDate = getHtmlDate(currentEnd); // FIXED: Must be YYYY-MM-DD for HTML input
  }

  const todayDisplay = getLocalDDMMYYY(new Date());

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#10162F] text-white shadow-lg border-b border-indigo-950/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-default">
            <img
              src="/digipass logo lateral.png"
              alt="DigiPass Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
          <button
            onClick={handleLogout}
            className="group h-10 px-4 text-xs font-semibold rounded-[2.42px] bg-white/5 hover:bg-red-500/10 ring-1 ring-white/20 hover:ring-red-500/50 transition-all duration-300 text-white hover:text-red-400 flex items-center justify-center gap-2"
          >
            <span className="hidden sm:inline">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Pass History</h2>
            <p className="text-sm text-slate-500 mt-1">Track the status and details of your requested passes.</p>
          </div>
          <button
            onClick={() => navigate('/apply-pass')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2.42px] bg-indigo-600 text-white font-medium text-sm shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Apply for Pass
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Approved', value: counts.approved, color: 'text-emerald-600', bg: 'bg-emerald-500' },
            { label: 'Pending', value: counts.pending, color: 'text-amber-600', bg: 'bg-amber-500' },
            { label: 'Rejected', value: counts.rejected, color: 'text-rose-600', bg: 'bg-rose-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[2.42px] ring-1 ring-slate-200 p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-2 h-12 rounded-full ${s.bg} opacity-80`} />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[2.42px] shadow-sm ring-1 ring-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm font-medium text-slate-500">Loading your passes…</p>
            </div>
          ) : error ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4 ring-8 ring-rose-50/50">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p className="text-slate-900 font-semibold">{error}</p>
              <button
                onClick={fetchPasses}
                className="mt-4 px-5 py-2 rounded-[2.42px] bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
              >
                Try Again
              </button>
            </div>
          ) : !passes || passes.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No passes found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">You haven't requested any hostel passes yet. Apply for your first pass to see it here.</p>
            </div>
          ) : (
            <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="font-semibold uppercase tracking-wider text-xs px-6 py-4">Pass Type</th>
                    <th className="font-semibold uppercase tracking-wider text-xs px-6 py-4">Start Date</th>
                    <th className="font-semibold uppercase tracking-wider text-xs px-6 py-4">End Date</th>
                    <th className="font-semibold uppercase tracking-wider text-xs px-6 py-4">Remarks</th>
                    <th className="font-semibold uppercase tracking-wider text-xs px-6 py-4">Status</th>
                    <th className="font-semibold uppercase tracking-wider text-xs px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {passes.slice().sort((a, b) => new Date(b.leave_start) - new Date(a.leave_start)).map((pass, idx) => {
                    const given = getLocalDDMMYYY(pass.leave_start);
                    const passEndDate = getLocalDDMMYYY(pass.leave_end);
                    const isCheckedIn = pass.logs && pass.logs.length > 0 && pass.logs[0].student_status === 'in';
                    
                    // Business Logic Checks
                    const isEligibleForExtension = idx === 0 && pass.pass_type === 'market' && pass.pass_status !== 'rejected' && !isCheckedIn;
                    const isEligibleForExtend = pass.pass_type === 'leave' && (pass.pass_status === 'approved' || pass.pass_status === 'pending') && passEndDate >= todayDisplay && !isCheckedIn;

                    return (
                      <tr key={pass.pass_id || idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-[2.42px] bg-indigo-50 text-indigo-700 text-xs font-semibold capitalize ring-1 ring-indigo-200">
                            {pass.pass_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{given}</td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {given === passEndDate ? <span className="text-slate-300">-</span> : passEndDate}
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={pass.remark}>
                          {pass.remark || <span className="italic text-slate-400">No remarks</span>}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={pass.pass_status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {isEligibleForExtension && (
                              <button
                                onClick={() => setShowConvertModal(true)}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-[2.42px] hover:bg-indigo-100 hover:text-indigo-800 transition-colors whitespace-nowrap ring-1 ring-indigo-200"
                              >
                                Extend to Leave
                              </button>
                            )}
                            {isEligibleForExtend && (
                              <button
                                onClick={() => {
                                  setExtendPassId(pass.pass_id);
                                  setShowExtendModal(true);
                                }}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-[2.42px] hover:bg-purple-100 hover:text-purple-800 transition-colors whitespace-nowrap ring-1 ring-purple-200"
                              >
                                Extend Date
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>
            {/* Mobile View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {passes.slice().sort((a, b) => new Date(b.leave_start) - new Date(a.leave_start)).map((pass, idx) => {
                const given = getLocalDDMMYYY(pass.leave_start);
                const passEndDate = getLocalDDMMYYY(pass.leave_end);
                const isCheckedIn = pass.logs && pass.logs.length > 0 && pass.logs[0].student_status === 'in';
                const isEligibleForExtension = idx === 0 && pass.pass_type === 'market' && pass.pass_status !== 'rejected' && !isCheckedIn;
                const isEligibleForExtend = pass.pass_type === 'leave' && (pass.pass_status === 'approved' || pass.pass_status === 'pending') && passEndDate >= todayDisplay && !isCheckedIn;
                const isExpanded = expandedPassId === pass.pass_id;

                return (
                  <div key={pass.pass_id || idx} className="flex flex-col p-4 bg-white hover:bg-slate-50 transition-colors">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedPassId(isExpanded ? null : pass.pass_id)}
                    >
                      <div className="flex gap-4 items-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-[7.27px] bg-indigo-50 text-indigo-700 text-xs font-semibold capitalize ring-1 ring-indigo-200">
                          {pass.pass_type}
                        </span>
                        <StatusBadge status={pass.pass_status} />
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 font-medium text-sm">
                        <span>Info</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Start Date</span>
                          <span className="font-medium text-slate-700">{given}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">End Date</span>
                          <span className="font-medium text-slate-700">{given === passEndDate ? '-' : passEndDate}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500">Remarks</span>
                          <span className="text-slate-700">{pass.remark || <span className="italic text-slate-400">No remarks</span>}</span>
                        </div>
                        {(isEligibleForExtension || isEligibleForExtend) && (
                          <div className="flex justify-end gap-2 mt-2">
                            {isEligibleForExtension && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowConvertModal(true); }}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-[7.27px] hover:bg-indigo-100 ring-1 ring-indigo-200"
                              >
                                Extend to Leave
                              </button>
                            )}
                            {isEligibleForExtend && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setExtendPassId(pass.pass_id);
                                  setShowExtendModal(true); 
                                }}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-[7.27px] hover:bg-purple-100 ring-1 ring-purple-200"
                              >
                                Extend Date
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
            </>
          )}
        </div>
      </main>

      {/* Convert to Leave Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.42px] shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Extend to Leave Pass</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              This will upgrade your current market pass into a Leave Pass. The new return date requires warden approval.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Return Date
              </label>
              <input 
                type="date" 
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={todayHtml} 
                className="w-full px-4 py-2.5 rounded-[2.42px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-slate-50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button 
                onClick={() => {
                  setShowConvertModal(false);
                  setNewEndDate(''); 
                }}
                disabled={isConverting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-[2.42px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConvertPass}
                disabled={isConverting || !newEndDate}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-[2.42px] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isConverting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Extension'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Leave Pass Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.42px] shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Extend Leave Pass</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Select your new expected return date. Your pass will return to "Pending" status until approved by the warden.
            </p>

            {extendError && (
              <div className="mb-5 p-3.5 rounded-[2.42px] bg-rose-50 text-rose-700 text-sm font-medium border border-rose-100 flex items-start gap-2.5">
                <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{extendError}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Return Date
              </label>
              <input 
                type="date" 
                value={extendDate}
                onChange={(e) => {
                  setExtendDate(e.target.value);
                  setExtendError('');
                }}
                min={minExtensionDate} 
                className="w-full px-4 py-2.5 rounded-[2.42px] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-700 bg-slate-50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button 
                onClick={() => {
                  setShowExtendModal(false);
                  setExtendDate(''); 
                  setExtendPassId(null);
                  setExtendError('');
                }}
                disabled={isExtending}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-[2.42px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleExtendPass}
                disabled={isExtending || !extendDate}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-[2.42px] hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isExtending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Extension'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPass;