import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { passAPI } from '../../services/api';

const ViewPass = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const now = new Date().getDate()

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

  const counts = passes.reduce(
    (acc, p) => {
      const s = (p.pass_status || 'pending').toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { approved: 0, rejected: 0, pending: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IMSEC Hostel Portal</h1>
              <p className="text-xs text-indigo-200">My Passes — {user?.first_name} {user?.last_name}</p>
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Pass History</h2>
            <p className="text-sm text-slate-500 mt-1">Track the status of every pass you've requested.</p>
          </div>
          <button
            onClick={() => navigate('/apply-pass')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Apply for Pass
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Approved', value: counts.approved, color: 'emerald' },
            { label: 'Pending', value: counts.pending, color: 'amber' },
            { label: 'Rejected', value: counts.rejected, color: 'rose' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm">Loading passes…</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p className="text-slate-700 font-medium">{error}</p>
              <button
                onClick={fetchPasses}
                className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Retry
              </button>
            </div>
          ) : !passes || passes.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">No passes yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Apply for your first hostel pass to get started.</p>
              <button
                onClick={() => navigate('/apply-pass')}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Apply for Pass
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Admission No.</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Name</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Pass Type</th>
                    <th className="text-right font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {
                    
                    passes.map((pass, idx) => {
                      const given = new Date(pass.leave_start).getDate()
                      if(given === now){
                        return <tr key={pass.pass_id || idx} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-4 font-medium text-slate-900">{pass.college_id || user?.id}</td>
                          <td className="px-6 py-4 text-slate-700">{user?.first_name} {user?.last_name}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium capitalize ring-1 ring-indigo-100">
                              {pass.pass_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <StatusBadge status={pass.pass_status} />
                          </td>
                        </tr>  
                      }
                      
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewPass;