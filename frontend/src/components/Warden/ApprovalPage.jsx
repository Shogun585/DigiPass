import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';

const ApprovalPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingPasses, setPendingPasses] = useState([]);
  const { updatePassStatus, getPendingPasses } = usePass();
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingPasses();
  }, []);

  const loadPendingPasses = async () => {
    setLoading(true);
    const passes = await getPendingPasses();
    setPendingPasses(passes || []);
    setLoading(false);
  };

  const handleApprove = async (passId) => {
    const result = await updatePassStatus(passId, 'approved');
    if (result.success) {
      alert('Pass approved!');
      await loadPendingPasses();
    }
  };

  const handleReject = async (passId) => {
    const result = await updatePassStatus(passId, 'rejected');
    if (result.success) {
      alert('Pass rejected!');
      await loadPendingPasses();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Rejected
        </span>
      );
    }
    return null;
  };

  const pendingCount = pendingPasses.filter(
    (p) => !p.pass_status || !['approved', 'rejected'].includes((p.pass_status || '').toLowerCase())
  ).length;

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
              <p className="text-xs text-indigo-200">Pass Approval Management</p>
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
            <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
            <p className="text-sm text-slate-500 mt-1">Review and act on student pass requests.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-sm font-medium ring-1 ring-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {pendingCount} Pending
            </span>
            <button
              onClick={loadPendingPasses}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-700 transition"
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
              <p className="text-sm">Loading pending requests…</p>
            </div>
          ) : pendingPasses && pendingPasses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Student</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Pass Type</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Date</th>
                    <th className="text-right font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingPasses.map((pass, idx) => {
                    const acted =
                      pass.pass_status &&
                      ['approved', 'rejected'].includes((pass.pass_status || '').toLowerCase());
                    return (
                      <tr key={pass.pass_id || idx} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold flex items-center justify-center">
                              {(pass.college_id || '?').slice(-2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{pass.college_id}</p>
                              <p className="text-xs text-slate-500">Admission ID</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium capitalize ring-1 ring-indigo-100">
                            {pass.pass_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{pass.leave_start}</td>
                        <td className="px-6 py-4">
                          {acted ? (
                            <div className="flex justify-end">
                              <StatusBadge status={pass.pass_status} />
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleApprove(pass.pass_id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(pass.pass_id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">All caught up</h3>
              <p className="text-sm text-slate-500 mt-1">No pending pass requests right now.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApprovalPage;