import { LogOut } from 'lucide-react';
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
  const userDetails = JSON.parse(localStorage.getItem('user')) || {};

  const [passType, setPassType] = useState('market');
  const [showLeaveSection, setShowLeaveSection] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim(),
    admissionId: userDetails.id || '',
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
    // Error hatana jab user select kare
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
      setError(''); // Clear top banner error
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.course.trim()) newErrors.course = 'Please select your course';
    if (!formData.passType) newErrors.passType = 'Please select a pass type';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Professional Error Message
      setError('Oops! Looks like you missed a spot. Please fill in all required fields.');
      return;
    }

    setError(''); // Clear error on successful validation
    setIsSubmitting(true);
    const today = getLocalYYYYMMDD();

    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = `${userDetails.first_name?.[0] || ''}${userDetails.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#10162F] to-[#10162F]/80 text-white shadow-lg border-b border-indigo-950/50">
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
            className="group h-10 px-4 text-xs font-semibold rounded-[3.19px] bg-white/5 hover:bg-red-500/10 ring-1 ring-white/20 hover:ring-red-500/50 transition-all duration-300 text-white hover:text-red-400 flex items-center justify-center gap-2"
          >
            <span className="hidden sm:inline">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-6 py-10 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
              New Pass Application
            </h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fill in your details securely to request a hostel pass.
            </p>
          </div>
          <button
            onClick={() => navigate('/view-pass')}
            className="group inline-flex h-11 items-center gap-2 px-5 rounded-[3.19px] bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-[#00A9E8]/50 hover:text-[#00A9E8] hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View My Passes
          </button>
        </div>

        <div className="bg-white rounded-[3.19px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden backdrop-blur-sm">
          {/* Profile strip */}
          <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-100 flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-indigo-950 text-[#00A9E8] flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-white">
                {initials || '👤'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-900/50">Applicant Profile</p>
              <p className="font-bold text-slate-800 text-lg">{formData.name || 'Student Name'}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                ID: {formData.admissionId || 'N/A'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
            
            {/* NEW PROFESSIONAL ERROR BANNER */}
            {error && (
              <div className="flex items-center bg-[#fcebeb] border-l-4 border-[#e74c3c] text-[#c0392b] p-4 rounded-r-lg font-medium text-sm animate-[slideDownFadeIn_0.3s_ease-out_forwards]">
                <span className="mr-3 text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Name Input */}
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full h-12 pl-4 pr-10 rounded-[3.19px] border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed outline-none transition-all group-hover:border-slate-300"
                    readOnly
                  />
                  <svg className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Admission ID Input */}
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Admission ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="admissionId"
                    value={formData.admissionId}
                    onChange={handleChange}
                    placeholder="AXXXXXXXXXX"
                    className="w-full h-12 pl-4 pr-10 rounded-[3.19px] border border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium cursor-not-allowed outline-none transition-all group-hover:border-slate-300"
                    readOnly
                  />
                  <svg className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Course Selection */}
              <div className="sm:col-span-2">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${errors.course ? 'text-red-500' : 'text-slate-500'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Select Course
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME', 'MBA', 'MCA'].map((courseName) => (
                    <label 
                      key={courseName}
                      // ADDED selection-card and dynamic error classes
                      className={`selection-card relative flex items-center h-12 px-4 rounded-[3.19px] border cursor-pointer hover:shadow-md ${
                        formData.course === courseName
                          ? 'border-[#00A9E8] bg-[#00A9E8]/5 ring-1 ring-[#00A9E8] shadow-sm'
                          : errors.course 
                            ? 'border-red-400 bg-red-50 animate-shake' 
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="course"
                        value={courseName}
                        checked={formData.course === courseName}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#00A9E8] border-slate-300 focus:ring-[#00A9E8] transition-all"
                      />
                      <span className={`ml-3 text-sm font-semibold transition-colors selection-text ${formData.course === courseName ? 'text-indigo-950' : 'text-slate-600'}`}>
                        {courseName}
                      </span>
                      {formData.course === courseName && (
                        <svg className="absolute right-3 w-4 h-4 text-[#00A9E8] selection-icon animate-[fadeIn_0.2s_ease-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pass Type Selection */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${errors.passType ? 'text-red-500' : 'text-slate-500'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Pass Category
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, passType: 'Market Pass' });
                    setPassType('market');
                    if (errors.passType) { setErrors({...errors, passType: ''}); setError(''); }
                    if (showLeaveSection) setShowLeaveSection(false);
                  }}
                  // ADDED selection-card and error styling
                  className={`selection-card group relative text-left p-4 rounded-[3.19px] border hover:shadow-md ${
                    formData.passType === 'Market Pass'
                      ? 'border-[#00A9E8] bg-[#00A9E8]/5 ring-1 ring-[#00A9E8]'
                      : errors.passType
                        ? 'border-red-400 bg-red-50 animate-shake'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`icon-bg w-12 h-12 rounded-[3.19px] flex items-center justify-center transition-all duration-300 ${formData.passType === 'Market Pass' ? 'bg-gradient-to-br from-slate-800 to-indigo-950 text-[#00A9E8] scale-110 shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                      <svg className="w-6 h-6 selection-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`selection-text font-bold text-base transition-colors ${formData.passType === 'Market Pass' ? 'text-indigo-950' : 'text-slate-700'}`}>Market Pass</p>
                      <p className="selection-subtext text-xs font-medium text-slate-500 mt-0.5">Same-day exit & return</p>
                    </div>
                  </div>
                  {formData.passType === 'Market Pass' && (
                    <div className="absolute top-4 right-4 text-[#00A9E8] selection-icon">
                      <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, passType: 'Leave Pass' });
                    if (errors.passType) { setErrors({...errors, passType: ''}); setError(''); }
                    if (!showLeaveSection) toggleLeaveSection();
                  }}
                  // ADDED selection-card and error styling
                  className={`selection-card group relative text-left p-4 rounded-[3.19px] border hover:shadow-md ${
                    formData.passType === 'Leave Pass'
                      ? 'border-[#00A9E8] bg-[#00A9E8]/5 ring-1 ring-[#00A9E8]'
                      : errors.passType
                        ? 'border-red-400 bg-red-50 animate-shake'
                        : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`icon-bg w-12 h-12 rounded-[3.19px] flex items-center justify-center transition-all duration-300 ${formData.passType === 'Leave Pass' ? 'bg-gradient-to-br from-slate-800 to-indigo-950 text-[#00A9E8] scale-110 shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                      <svg className="w-6 h-6 selection-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`selection-text font-bold text-base transition-colors ${formData.passType === 'Leave Pass' ? 'text-indigo-950' : 'text-slate-700'}`}>Leave Pass</p>
                      <p className="selection-subtext text-xs font-medium text-slate-500 mt-0.5">Multi-day away leave</p>
                    </div>
                  </div>
                  {formData.passType === 'Leave Pass' && (
                    <div className="absolute top-4 right-4 text-[#00A9E8] selection-icon">
                      <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>

              {/* Smooth Collapsible Leave Section */}
              <div className={`grid transition-all duration-500 ease-in-out ${showLeaveSection ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                <div className="overflow-hidden">
                  <div className="p-5 rounded-[3.19px] bg-gradient-to-br from-slate-50 to-indigo-50/20 border border-slate-200/60 shadow-inner">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Departure Date
                        </label>
                        <input
                          type="date"
                          value={leaveStartDate}
                          readOnly
                          className="w-full h-12 px-4 rounded-[3.19px] border border-slate-200 bg-slate-100/80 text-sm font-medium text-slate-500 cursor-not-allowed outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          min={leaveStartDate}
                          className="w-full h-12 px-4 rounded-[3.19px] border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A9E8]/40 focus:border-[#00A9E8] transition-all hover:border-slate-400 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/view-pass')}
                className="h-12 px-6 rounded-[3.19px] border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative h-12 px-8 rounded-[3.19px] bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-bold text-sm shadow-lg shadow-indigo-950/20 hover:shadow-indigo-950/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <span className="relative flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin text-[#00A9E8]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* ADDED CSS: Shake Animation & Gradient Hover Logic */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%, 75% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
        }
        @keyframes slideDownFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        /* Hover Gradient Logic */
        .selection-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          z-index: 1;
        }
        
        .selection-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #00A9E8 0%, #1e1b4b 100%);
          opacity: 0;
          transition: opacity 0.4s ease-in-out;
          z-index: -1;
        }

        .selection-card:hover {
          transform: scale(1.03);
          border-color: transparent !important;
        }

        .selection-card:hover::before {
          opacity: 1;
        }
        
        /* Turning text and icons white on hover over gradient */
        .selection-card:hover .selection-text,
        .selection-card:hover .selection-subtext {
          color: #ffffff !important;
        }
        .selection-card:hover .selection-icon {
          stroke: #ffffff !important;
          color: #ffffff !important;
        }
        .selection-card:hover .icon-bg {
          background: rgba(255, 255, 255, 0.2) !important;
        }
      `}} />
    </div>
  );
};

export default ApplyPass;
