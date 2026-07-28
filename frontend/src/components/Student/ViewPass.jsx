import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { passAPI } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';

export const getLocalDDMMYYY = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

const ViewPass = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  const [extendPassId, setExtendPassId] = useState(null);

  const [extendError, setExtendError] = useState('');

  const [activeQR, setActiveQR] = useState(null);

  const now = getLocalDDMMYYY()

  const handleConvertPass = async () =>{
    if(!newEndDate){
      alert("Please select a return date");
      return;
    }

    setIsConverting(true);
    try{
      await passAPI.convertPass(newEndDate);

      setShowConvertModal(false);
      setNewEndDate('');

      fetchPasses();

      alert("Pass successfully extended and sent to the warden for approval");
    }catch(error){
      console.error("Failed  to convert pass: ", error);
      alert(error.response?.data?.detail || "Failed to extend pass");
    }finally{
      setIsConverting(false);
    }
  }

  const handleExtendPass = async () =>{
    setExtendError('');

    if(!extendDate){
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

      // alert("Leave pass successfully extended and sent to the warden for approval");
    } catch (error) {
      console.error("Failed to extend pass: ", error);
      setExtendError(error.response?.data?.detail || "Failed to extend pass");
    } finally {
      setIsExtending(false);
    }
  }

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
      approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200 md:mr-2',
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

  const selectedPass = passes.find(p => p.pass_id === extendPassId);
  let minExtensionDate = getLocalDDMMYYY(); 

  if (selectedPass) {
      const currentEnd = new Date(selectedPass.leave_end);
   
      currentEnd.setDate(currentEnd.getDate() + 1); 
      minExtensionDate = getLocalDDMMYYY(currentEnd);
  }

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
                    {/* <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Admission No.</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Name</th> */}
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Pass Type</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Leave start</th>
                    <th className="text-left font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Leave end</th>
                    <th className="text-right font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Remarks</th>
                    <th className="text-right font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Status</th>
                    <th className="text-right font-medium text-slate-600 uppercase tracking-wider text-xs px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {
                    
                    passes.map((pass, idx) => {
                      const given = getLocalDDMMYYY(pass.leave_start);
                      const passEndDate = getLocalDDMMYYY(pass.leave_end);

                      const isCheckedIn = pass.logs && pass.logs.length > 0 && pass.logs[0].student_status === 'in';
                      const isEligibleForExtension = idx === 0 && pass.pass_type === 'market' && pass.pass_status !== 'rejected' && !isCheckedIn

                      const isEligibleForExtend = pass.pass_type === 'leave' && (pass.pass_status === 'approved' || pass.pass_status === 'pending') && passEndDate >= now && !isCheckedIn;

                      if(given === now){
                        return <tr key={pass.pass_id || idx} className="hover:bg-slate-50/60 transition">
                          {/* <td className="px-6 py-4 font-medium text-slate-900">{pass.college_id || user?.id}</td>
                          <td className="px-6 py-4 text-slate-700">{user?.first_name} {user?.last_name}</td> */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium capitalize ring-1 ring-indigo-100">
                              {pass.pass_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{given}</td>
                          <td className="px-6 py-4 text-slate-700">
                            {given === passEndDate ? "" : passEndDate}
                          </td>
                          <td className="px-6 py-4 text-slate-600 italic text-xs max-w-[200px] truncate md:flex md:justify-end" title={pass.remark}>
                            {pass.remark || '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                              <div className='flex gap-2 md:flex md:justify-end'>
                                <StatusBadge status={pass.pass_status} />

                                {pass.pass_status === 'approved' && pass.qr_token && !isCheckedIn && (
                                    <button 
                                      onClick={() => setActiveQR(pass.qr_token)}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                    </button>
                                  )}
                              </div>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {isEligibleForExtension && (
                              <button
                                onClick={() => setShowConvertModal(true)}
                                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-200 transition whitespace-nowrap"
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
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-200 transition whitespace-nowrap"
                              >
                                Extend Date
                              </button>
                            )}
                          </td>
                        </tr>  
                      }
                      return null;
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
        {activeQR && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveQR(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Your Gate Pass</h3>
            <p className="text-sm text-slate-500 mb-8 text-center">Present this QR code to the security guard at the gate for scanning.</p>
            
            <div className="bg-white p-4 rounded-2xl ring-4 ring-indigo-50 shadow-inner mb-6">
              <QRCodeSVG value={activeQR} size={200} level="H" fgColor="#0f172a" />
            </div>
            
            <p className="font-mono text-xs text-slate-400 mb-6 bg-slate-50 px-3 py-1 rounded">Token: {activeQR}</p>
            <button onClick={() => setActiveQR(null)} className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition">Close</button>
          </div>
        </div>
      )}
      </main>
      {showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Extend to Leave Pass</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will change your current market pass into a Leave Pass and require the warden's approval. 
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Return Date
              </label>
              <input 
                type="date" 
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowConvertModal(false);
                  setNewEndDate(''); 
                }}
                disabled={isConverting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConvertPass}
                disabled={isConverting}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition"
              >
                {isConverting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Extending...
                  </>
                ) : (
                  'Submit Extension'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showExtendModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Extend Leave Pass</h3>
            <p className="text-sm text-slate-500 mb-6">
              Select a new return date. This will set your pass back to "Pending" until the warden approves the extension.
            </p>

            {extendError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{extendError}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Return Date
              </label>
              <input 
                type="date" 
                value={extendDate}
                onChange={(e) => {
                  setExtendDate(e.target.value)
                  setExtendError('')
                }}
                min={minExtensionDate} 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowExtendModal(false);
                  setExtendDate(''); 
                  setExtendPassId(null);
                  setExtendError('');
                }}
                disabled={isExtending}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleExtendPass}
                disabled={isExtending}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition"
              >
                {isExtending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Extending...
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