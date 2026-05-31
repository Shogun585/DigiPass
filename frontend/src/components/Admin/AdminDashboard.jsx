import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // UI State
  const [activeTab, setActiveTab] = useState('single'); // 'single', 'bulk', 'manage'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Single User State
  const [singleUser, setSingleUser] = useState({ id: '', first_name: '', last_name: '',contact_details: '', parent_email: '',   role: 'student' });

  // Bulk Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [bulkResults, setBulkResults] = useState(null);

  // Manage User State
  const [manageId, setManageId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const showMessage = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  // --- HANDLERS ---

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminAPI.createUser(singleUser);
      showMessage('success', `User ${res.data.user.id} created! Default password: ${res.data.default_password}`);
      setSingleUser({ id: '', first_name: '', last_name: '', role: 'student' });
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return showMessage('error', 'Please select a CSV file first.');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await adminAPI.bulkUploadUsers(formData);
      setBulkResults(res.data);
      showMessage('success', `Processed ${res.data.total_processed} rows. Successfully created ${res.data.success_count} users.`);
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Bulk upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPasswords = () => {
    if (!bulkResults || !bulkResults.successful_users.length) return;
    
    const headers = ['Admission ID', 'Full Name', 'Default Password'];
    const rows = bulkResults.successful_users.map(u => 
      `${u.id},"${u.name}",${u.initial_password}`
    );
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `new_users_passwords_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeactivate = async () => {
    if(!manageId) return showMessage('error', 'Please enter a User ID.');
    if(!window.confirm(`Are you sure you want to deactivate ${manageId}? They will lose login access.`)) return;

    setLoading(true);
    try {
      await adminAPI.deactivateUser(manageId);
      showMessage('success', `User ${manageId} has been successfully deactivated.`);
      setManageId('');
    } catch (err) {
      showMessage('error', 'Failed to deactivate user.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if(!manageId || !newPassword) return showMessage('error', 'Please enter both User ID and a new password.');
    
    setLoading(true);
    try {
      await adminAPI.resetPassword(manageId, newPassword);
      showMessage('success', `Password successfully updated for ${manageId}.`);
      setManageId('');
      setNewPassword('');
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IMSEC Administrator</h1>
              <p className="text-xs text-slate-300">System Management Console</p>
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        
        {/* FEEDBACK TOAST */}
        {feedback.message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border shadow-sm ${
            feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {feedback.type === 'success' 
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              }
            </svg>
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          
          {/* TABS */}
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
            {['single', 'bulk', 'manage'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab 
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                {tab === 'single' ? 'Add Single User' : tab === 'bulk' ? 'Bulk Import (CSV)' : 'Manage & Reset'}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            
            {/* TAB 1: SINGLE USER */}
            {activeTab === 'single' && (
              <form onSubmit={handleSingleSubmit} className="max-w-xl mx-auto space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
                  <p className="text-sm text-slate-500">Manually add a student or warden to the system.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">User ID / Admission No.</label>
                  <input type="text" required value={singleUser.id} onChange={e => setSingleUser({...singleUser, id: e.target.value.toUpperCase()})} placeholder="e.g. A2023CS001" className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500 uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" required value={singleUser.first_name} onChange={e => setSingleUser({...singleUser, first_name: e.target.value})} className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" required value={singleUser.last_name} onChange={e => setSingleUser({...singleUser, last_name: e.target.value})} className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact details</label>
                    <input type="text" required value={singleUser.contact_details} onChange={e => setSingleUser({...singleUser, contact_details: e.target.value})} className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent Email</label>
                    <input type="text" required value={singleUser.parent_email} onChange={e => setSingleUser({...singleUser, parent_email: e.target.value})} className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select value={singleUser.role} onChange={e => setSingleUser({...singleUser, role: e.target.value})} className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="student">Student</option>
                    <option value="warden">Warden</option>
                    <option value="guard">Security Guard</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button disabled={loading} type="submit" className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </form>
            )}

            {/* TAB 2: BULK UPLOAD */}
            {activeTab === 'bulk' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Bulk Import via CSV</h2>
                  <p className="text-sm text-slate-500">Upload a CSV file with headers: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-rose-600">id, first_name, last_name, role</code></p>
                </div>

                <form onSubmit={handleBulkSubmit} className="mb-8">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition">
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={e => setCsvFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                  </div>
                  <button disabled={loading || !csvFile} type="submit" className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
                    {loading ? 'Processing File...' : 'Upload & Process'}
                  </button>
                </form>

                {/* Bulk Results Display */}
                {bulkResults && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Upload Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                      <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <p className="text-2xl font-bold text-slate-700">{bulkResults.total_processed}</p>
                        <p className="text-xs text-slate-500 uppercase">Processed</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border shadow-sm border-emerald-200">
                        <p className="text-2xl font-bold text-emerald-600">{bulkResults.success_count}</p>
                        <p className="text-xs text-slate-500 uppercase">Created</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border shadow-sm border-rose-200">
                        <p className="text-2xl font-bold text-rose-600">{bulkResults.failed_count}</p>
                        <p className="text-xs text-slate-500 uppercase">Failed</p>
                      </div>
                    </div>
                    
                    {bulkResults.success_count > 0 && (
                      <button onClick={downloadPasswords} className="w-full py-2.5 mb-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Default Passwords (CSV)
                      </button>
                    )}

                    {bulkResults.failed_count > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-rose-800 mb-2">Errors & Duplicates:</p>
                        <div className="max-h-40 overflow-y-auto text-xs text-slate-600 bg-white border border-rose-100 rounded p-3">
                          {bulkResults.failures.map((f, i) => (
                            <div key={i} className="mb-1"><span className="font-bold text-slate-800">{f.id}:</span> {f.reason}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MANAGE (DELETE / PASSWORD) */}
            {activeTab === 'manage' && (
              <div className="max-w-xl mx-auto">
                 <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Manage Users</h2>
                  <p className="text-sm text-slate-500">Deactivate accounts or reset forgotten passwords.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target User ID</label>
                    <input type="text" value={manageId} onChange={e => setManageId(e.target.value.toUpperCase())} placeholder="Enter ID (e.g. A2023CS001)" className="w-full p-3 text-lg font-mono rounded border-2 border-slate-300 focus:border-slate-500 focus:outline-none uppercase" />
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                    <h3 className="font-bold text-rose-900 mb-1">Danger Zone</h3>
                    <p className="text-xs text-rose-700 mb-4">Deactivating a user immediately revokes their login access, but preserves their pass history.</p>
                    <button disabled={loading || !manageId} onClick={handleDeactivate} className="px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded hover:bg-rose-700 disabled:opacity-50 transition">
                      Deactivate User
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-900 mb-1">Force Password Reset</h3>
                    <p className="text-xs text-slate-500 mb-4">Set a new password for this user manually.</p>
                    <div className="flex gap-2">
                      <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className="flex-1 p-2 rounded border border-slate-300 text-sm focus:outline-none focus:border-indigo-500" />
                      <button disabled={loading || !manageId || !newPassword} onClick={handlePasswordReset} className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded hover:bg-slate-900 disabled:opacity-50 transition">
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;