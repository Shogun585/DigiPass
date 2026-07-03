import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';

const getLocalYYYYMMDD = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ApplyPass = () => {
  const userDetails = JSON.parse(localStorage.getItem('user'));

  const [passType, setPassType] = useState('market');
  const [showLeaveSection, setShowLeaveSection] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');

  const [formData, setFormData] = useState({
    name: `${userDetails.first_name} ${userDetails.last_name}`,
    admissionId: userDetails.id,
    course: '',
    passType: '',
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const { addPass } = usePass();
  const navigate = useNavigate();

  useEffect(() => {
    const today = getLocalYYYYMMDD();
    setLeaveStartDate(today);
  }, []);

  const toggleLeaveSection = () => {
    setPassType(showLeaveSection ? 'market' : 'leave');
    setShowLeaveSection(!showLeaveSection);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.course.trim()) newErrors.course = 'Course is required';
    if (!formData.passType) newErrors.passType = 'Please select pass type';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const today = getLocalYYYYMMDD();

    const result = await addPass({
      name: formData.name,
      admissionId: formData.admissionId,
      course: formData.course,
      passType: formData.passType,
      leave_start: today,
      leave_end: formData.passType === 'Market Pass' ? today : leaveEndDate || today,
    });

    if (result.success) {
      alert('Pass application submitted successfully!');
      navigate('/view-pass');
    } else {
      setError(result.error || 'Failed to create pass');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = `${userDetails.first_name?.[0] || ''}${userDetails.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">IMSEC Hostel Portal</h1>
              <p className="text-xs text-indigo-200">Apply for a new pass</p>
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

      {/* Body */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">New Pass Application</h2>
            <p className="text-sm text-slate-500 mt-1">Fill in your details to request a hostel pass.</p>
          </div>
          <button
            onClick={() => navigate('/view-pass')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:border-indigo-400 hover:text-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View My Passes
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          {/* Profile strip */}
          <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-md">
              {initials || '👤'}
            </div>
            <div>
              <p className="text-sm text-slate-500">Applicant</p>
              <p className="font-semibold text-slate-900">{formData.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">ID: {formData.admissionId}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Admission ID</label>
                <input
                  type="text"
                  name="admissionId"
                  value={formData.admissionId}
                  onChange={handleChange}
                  placeholder="AXXXXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm focus:outline-none"
                  readOnly
                />
                {errors.admissionId && <p className="mt-1 text-xs text-red-600">{errors.admissionId}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME', 'MBA', 'MCA'].map((courseName) => (
                    <label 
                      key={courseName}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.course === courseName
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-indigo-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="course"
                        value={courseName}
                        checked={formData.course === courseName}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 bg-white"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-900">
                        {courseName}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.course && <p className="mt-2 text-xs text-red-600">{errors.course}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pass Type</label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, passType: 'Market Pass' });
                    setPassType('market');
                    if (showLeaveSection) setShowLeaveSection(false);
                  }}
                  className={`group text-left p-4 rounded-xl border-2 transition-all ${
                    formData.passType === 'Market Pass'
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.passType === 'Market Pass' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Market Pass</p>
                      <p className="text-xs text-slate-500">Same-day exit & return</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, passType: 'Leave Pass' });
                    if (!showLeaveSection) toggleLeaveSection();
                  }}
                  className={`group text-left p-4 rounded-xl border-2 transition-all ${
                    formData.passType === 'Leave Pass'
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.passType === 'Leave Pass' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Leave Pass</p>
                      <p className="text-xs text-slate-500">Multi-day leave</p>
                    </div>
                  </div>
                </button>
              </div>
              {errors.passType && <p className="mt-2 text-xs text-red-600">{errors.passType}</p>}

              {showLeaveSection && (
                <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Leave Start Date</label>
                      <input
                        type="date"
                        value={leaveStartDate}
                        readOnly
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Leave End Date</label>
                      <input
                        type="date"
                        value={leaveEndDate}
                        onChange={(e) => setLeaveEndDate(e.target.value)}
                        min={leaveStartDate}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/view-pass')}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ApplyPass;