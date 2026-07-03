import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';

const ApprovalPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingPasses, setPendingPasses] = useState([]);
  const { updatePassStatus, getPendingPasses, getLateReturns, addPassRemark } = usePass();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('pending');
  const [latePasses] = useState([]);

  const [remarks, setRemarks] = useState({});
  const [attendance] = useState(85);

  useEffect(() => {
    if(viewMode === 'pending'){
      loadPendingPasses()
    }
    if(viewMode === 'late'){
      loadLatePasses();
    }
  }, []);

  // const fetchStudentAttendance = () => {
  //   return 85;
  //   // TODO : add API to fetch attendance from ERP
  // }

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

  // const initializeRemarks = (passList) => {
  //   const initialRemarks = {};
  //   passList.forEach(p => {
  //     if(p.remark) initialRemarks[p.pass_id] = p.remark;
  //   });
  //   setRemarks(initialRemarks);
  // }

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

  // const StatusBadge = ({ status }) => {
  //   const s = (status || '').toLowerCase();
  //   if (s === 'approved') {
  //     return (
  //       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
  //         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approved
  //       </span>
  //     );
  //   }
  //   if (s === 'rejected') {
  //     return (
  //       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
  //         <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Rejected
  //       </span>
  //     );
  //   }
  //   return null;
  // };

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
      <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IMSEC Hostel Portal</h1>
              <p className="text-xs text-indigo-200">Warden Dashboard</p>
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Pass Management</h2>
            <p className="text-sm text-slate-500 mt-1">Review requests and monitor late market returns.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg ring-1 ring-slate-200">
              <button
                onClick={() => setViewMode('pending')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  viewMode === 'pending' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pending Requests
                {pendingCount > 0 && (
                  <span className="ml-2 bg-rose-100 text-rose-600 py-0.5 px-2 rounded-full text-xs">{pendingCount}</span>
                )}
              </button>
              <button
                onClick={() => setViewMode('late')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                  viewMode === 'late' 
                  ? 'bg-white text-rose-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Late Returns (&gt; 9 PM)
              </button>
            </div>

            <button
              onClick={viewMode === 'pending' ? loadPendingPasses : loadLatePasses}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-700 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm">Loading data…</p>
            </div>
          ) : displayData && displayData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Student</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Pass Type</th>
                    {viewMode === 'pending' ? (
                      <>
                        <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Date</th>
                        <th className="text-right font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Action</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Check-In Time</th>
                        <th className="text-right font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayData.map((pass, idx) => {
                    const isActed = pass.pass_status && ['approved', 'rejected'].includes(pass.pass_status.toLowerCase());
                    
                    return (
                      <tr key={pass.pass_id || idx} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold flex items-center justify-center">
                              {(pass.college_id || '?').slice(-2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {pass.user?.first_name ? `${pass.user.first_name} ${pass.user.last_name}` : pass.college_id}
                              </p>
                              <p className="text-xs text-slate-500">{pass.college_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ring-1 ${pass.pass_type === 'market' ? 'bg-orange-50 text-orange-700 ring-orange-100' : 'bg-indigo-50 text-indigo-700 ring-indigo-100'}`}>
                            {pass.pass_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-semibold ${attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {attendance}%
                          </span>
                        </td>

                        {viewMode === 'pending' && (
                          <>
                            <td className="px-6 py-4 text-slate-700">{pass.leave_start.split('T')[0]}</td>
                            <td className="px-4 py-4">
                              <input 
                                type="text"
                                placeholder="Add remark..."
                                value={remarks[pass.pass_id] || ''}
                                onChange={(e) => handleRemarkChange(pass.pass_id, e.target.value)}
                                disabled={isActed}
                                className="w-full text-xs px-3 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </td>
                            <td className="px-6 py-4">
                              {isActed ? (
                                <div className="flex justify-end">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${pass.pass_status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}>
                                    {pass.pass_status.toUpperCase()}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleApprove(pass.pass_id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(pass.pass_id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
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
                            <td className="px-6 py-4 font-semibold text-rose-600">
                              {pass.logs && pass.logs.length > 0 ? formatISTTime(pass.logs[0].scan_time) : 'N/A'}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="Disciplinary note..."
                                  value={remarks[pass.pass_id] || ''}
                                  onChange={(e) => handleRemarkChange(pass.pass_id, e.target.value)}
                                  className="w-full text-xs px-3 py-1.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                                <button
                                  onClick={() => handleSaveLateRemark(pass.pass_id)}
                                  className="px-2.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded hover:bg-slate-200 transition"
                                >
                                  Save
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200 border border-rose-300">
                                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                 </svg>
                                 RULE VIOLATION
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
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              {viewMode === 'pending' ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">All caught up</h3>
                  <p className="text-sm text-slate-500 mt-1">No pending pass requests right now.</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Hostel is secure</h3>
                  <p className="text-sm text-slate-500 mt-1">No students checked in after 9 PM today.</p>
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