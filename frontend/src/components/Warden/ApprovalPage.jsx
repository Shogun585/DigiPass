import { LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';
import { getLocalDDMMYYY } from '../Student/ViewPass';

const ApprovalPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingPasses, setPendingPasses] = useState([]);
  const { updatePassStatus, getPendingPasses, getLateReturns, addPassRemark } = usePass();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('pending');
  const [latePasses] = useState([]);
  const [expandedPassId, setExpandedPassId] = useState(null);

  const [remarks, setRemarks] = useState({});
  const [attendance] = useState(85);

  useEffect(() => {
    if(viewMode === 'pending'){
      loadPendingPasses()
    }
    if(viewMode === 'late'){
      loadLatePasses();
    }
  }, [viewMode]); // Added viewMode as dependency so it re-fetches when toggled

  const loadPendingPasses = async () => {
    setLoading(true);
    const passes = await getPendingPasses();
    setPendingPasses(passes || []);
    setLoading(false);
  };

  const loadLatePasses = async () => {
    setLoading(true);
    const passes = await getLateReturns();
    setPendingPasses(passes || []);
    setLoading(false);
  };

  const handleRemarkChange = (passId, value) => {
    setRemarks(prev => ({ ...prev, [passId]: value }));
  };

  const handleApprove = async (passId) => {
    const passRemark = remarks[passId] || '';
    const result = await updatePassStatus(passId, 'approved', passRemark);
    if (result.success) {
      alert('Pass approved!');
      await loadPendingPasses();
    }
  };

  const handleReject = async (passId) => {
    const passRemark = remarks[passId] || '';
    const result = await updatePassStatus(passId, 'rejected', passRemark);
    if (result.success) {
      alert('Pass rejected!');
      await loadPendingPasses();
    }
  };

  const handleSaveLateRemark = async (passId) => {
    const passRemark = remarks[passId] || '';
    try {
      await addPassRemark(passId, passRemark);
      alert('Remark saved successfully!');
    } catch (err) {
      alert('Failed to save remark.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pendingCount = pendingPasses.filter(
    (p) => !p.pass_status || !['approved', 'rejected'].includes((p.pass_status || '').toLowerCase())
  ).length;

  const formatISTTime = (isoString) => {
    if(!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString('en-IN', {
      timeZone : "Asia/Kolkata",
      hour : "2-digit",
      minute : "2-digit",
      hour12 : true
    });
  };

  const displayData = viewMode === 'pending' ? pendingPasses : latePasses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      
      {/* --- Standardized Header --- */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#10162F] to-[#10162F]/80 text-white shadow-lg border-b border-indigo-950/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-default">
            <img
              src="/digipass logo lateral.png"
              alt="DigiPass Logo"
              className="h-14 w-auto object-contain"
            />
            {/* Warden Badge indicator */}
            <span className="hidden sm:flex ml-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold tracking-widest uppercase">
              Warden
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="group h-10 px-4 text-xs font-semibold rounded-[3.19px] bg-white/5 hover:bg-red-500/10 ring-1 ring-white/20 hover:ring-red-500/50 transition-all duration-300 text-white hover:text-red-400 flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="hidden sm:inline">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pass Management</h2>
            <p className="text-sm text-slate-500 mt-1">Review requests and monitor late market returns.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Tabs */}
            <div className="flex bg-slate-200/60 p-1 rounded-[3.19px] ring-1 ring-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-[3.19px] transition-all duration-300 ${
                  viewMode === 'pending' 
                  ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Pending Requests
                {pendingCount > 0 && (
                  <span className="ml-2 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-[10px] font-bold shadow-sm transition-transform duration-300">{pendingCount}</span>
                )}
              </button>
              <button
                onClick={() => setViewMode('late')}
                className={`px-4 py-2 text-sm font-semibold rounded-[3.19px] transition-all duration-300 ${
                  viewMode === 'late' 
                  ? 'bg-white text-rose-700 shadow-md ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Late Returns (&gt; 9 PM)
              </button>
            </div>

            <button
              onClick={viewMode === 'pending' ? loadPendingPasses : loadLatePasses}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-[3.19px] bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[3.19px] shadow-sm ring-1 ring-slate-200 overflow-hidden transition-all duration-500">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500 animate-pulse">
              <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm font-medium">Loading data…</p>
            </div>
          ) : displayData && displayData.length > 0 ? (
            <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Student</th>
                    <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Pass Type</th>
                    {viewMode === 'pending' ? (
                      <>
                        <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Attendance</th>
                        <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Date</th>
                        <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Remark</th>
                        <th className="text-right font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Action</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Check-In Time</th>
                        <th className="text-right font-semibold text-slate-600 uppercase tracking-wider text-xs px-6 py-4">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayData.map((pass, idx) => {
                    const isActed = pass.pass_status && ['approved', 'rejected'].includes(pass.pass_status.toLowerCase());
                    
                    return (
                      <tr key={pass.pass_id || idx} className="hover:bg-indigo-50/30 transition-colors duration-200 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-inner ring-2 ring-white group-hover:scale-105 transition-transform duration-300">
                              {(pass.college_id || '?').slice(-2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                {pass.college?.first_name ? `${pass.college.first_name} ${pass.college.last_name}` : pass.college_id}
                              </p>
                              <p className="text-xs text-slate-500 font-medium tracking-wide">{pass.college_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-[3.19px] text-xs font-bold capitalize ring-1 shadow-sm ${pass.pass_type === 'market' ? 'bg-orange-50 text-orange-700 ring-orange-200' : 'bg-indigo-50 text-indigo-700 ring-indigo-200'}`}>
                            {pass.pass_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-bold ${attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {attendance}%
                          </span>
                        </td>

                        {viewMode === 'pending' && (
                          <>
                            <td className="px-6 py-4 font-medium text-slate-700">{getLocalDDMMYYY(pass.leave_start)}</td>
                            <td className="px-4 py-4">
                              <input 
                                type="text"
                                placeholder="Add remark..."
                                value={remarks[pass.pass_id] || ''}
                                onChange={(e) => handleRemarkChange(pass.pass_id, e.target.value)}
                                disabled={isActed}
                                className="w-full text-xs px-3 py-2 rounded-[3.19px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-400 transition-all duration-300 shadow-sm"
                              />
                            </td>
                            <td className="px-6 py-4">
                              {isActed ? (
                                <div className="flex justify-end">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${pass.pass_status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}>
                                    {pass.pass_status.toUpperCase()}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleApprove(pass.pass_id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3.19px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(pass.pass_id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[3.19px] bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold shadow-sm transition-all duration-300 active:scale-95"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        )}

                        {viewMode === 'late' && (
                          <>
                            <td className="px-6 py-4 font-bold text-rose-600">
                              {pass.logs && pass.logs.length > 0 ? formatISTTime(pass.logs[0].scan_time) : 'N/A'}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="Disciplinary note..."
                                  value={remarks[pass.pass_id] || ''}
                                  onChange={(e) => handleRemarkChange(pass.pass_id, e.target.value)}
                                  className="w-full text-xs px-3 py-2 rounded-[3.19px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 transition-all shadow-sm"
                                />
                                <button
                                  onClick={() => handleSaveLateRemark(pass.pass_id)}
                                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-[3.19px] border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 active:scale-95 shadow-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wide font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200 shadow-sm uppercase">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                 </svg>
                                 Rule Violation
                               </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>
            {/* Mobile View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100">
              {displayData.map((pass, idx) => {
                const isActed = pass.pass_status && ['approved', 'rejected'].includes(pass.pass_status.toLowerCase());
                const isExpanded = expandedPassId === pass.pass_id;

                return (
                  <div key={pass.pass_id || idx} className="flex flex-col p-4 bg-white hover:bg-slate-50 transition-colors">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedPassId(isExpanded ? null : pass.pass_id)}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-inner ring-2 ring-white">
                          {(pass.college_id || '?').slice(-2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {pass.college?.first_name ? `${pass.college.first_name} ${pass.college.last_name}` : pass.college_id}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-[7.27px] text-[10px] font-bold capitalize ring-1 shadow-sm ${pass.pass_type === 'market' ? 'bg-orange-50 text-orange-700 ring-orange-200' : 'bg-indigo-50 text-indigo-700 ring-indigo-200'}`}>
                            {pass.pass_type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 font-medium text-sm">
                        <span>Info</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 text-sm">
                        {viewMode === 'pending' ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Attendance</span>
                              <span className={`font-bold ${attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>{attendance}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Date</span>
                              <span className="font-medium text-slate-700">{getLocalDDMMYYY(pass.leave_start)}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-500">Remark</span>
                              <input 
                                type="text"
                                placeholder="Add remark..."
                                value={remarks[pass.pass_id] || ''}
                                onChange={(e) => handleRemarkChange(pass.pass_id, e.target.value)}
                                disabled={isActed}
                                className="w-full text-xs px-3 py-2 rounded-[9.7px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 disabled:bg-slate-50 transition-all shadow-sm"
                              />
                            </div>
                            <div className="mt-2">
                              {isActed ? (
                                <div className="flex justify-end">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${pass.pass_status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}>
                                    {pass.pass_status.toUpperCase()}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleApprove(pass.pass_id); }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9.7px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleReject(pass.pass_id); }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9.7px] bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Check-In Time</span>
                              <span className="font-bold text-rose-600">{pass.logs && pass.logs.length > 0 ? formatISTTime(pass.logs[0].scan_time) : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Status</span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-wide font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200 uppercase">
                                Rule Violation
                              </span>
                            </div>
                            <div className="flex flex-col gap-1 mt-2">
                              <span className="text-slate-500">Disciplinary note</span>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="Disciplinary note..."
                                  value={remarks[pass.pass_id] || ''}
                                  onChange={(e) => handleRemarkChange(pass.pass_id, e.target.value)}
                                  className="w-full text-xs px-3 py-2 rounded-[9.7px] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 shadow-sm"
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleSaveLateRemark(pass.pass_id); }}
                                  className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-[9.7px] border border-slate-200 hover:bg-slate-200 hover:text-slate-900 shadow-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
            </>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center animate-fade-in">
              {viewMode === 'pending' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 ring-4 ring-emerald-50 flex items-center justify-center mb-4 shadow-sm">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">All caught up</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">No pending pass requests right now.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-indigo-50 ring-4 ring-indigo-50 flex items-center justify-center mb-4 shadow-sm">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Hostel is secure</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">No students checked in after 9 PM today.</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApprovalPage;
