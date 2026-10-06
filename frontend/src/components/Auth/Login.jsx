import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Shortened the slogans slightly to ensure they comfortably fit on 1 line
  const [sloganIdx, setSloganIdx] = useState(0);
  
  const slogans = [
    { title: "Digital Gate Pass System", subtitle: "Seamless, paperless campus movement from request to verification." },
    { title: "Secure & Transparent", subtitle: "Real-time tracking, instant approvals, and automated logging." },
    { title: "Empowering Campuses", subtitle: "Smart, reliable workflows for students, wardens, and guards." }
  ];

  // Rotate slogan every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSloganIdx((prev) => (prev + 1) % slogans.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slogans.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      const role = result.user.role.toLowerCase();
      if (role === 'student') navigate('/apply-pass');
      else if (role === 'warden') navigate('/warden-approval');
      else if (role === 'guard') navigate('/verification');
      else if (role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Brand panel - Now taking 70% width */}
      <div className="hidden lg:flex lg:w-[70%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        
        {/* Campus Background Image */}
        <div className="absolute inset-0 bg-slate-900/40 z-10" /> {/* Dark overlay for text readability */}
        <img 
          src="10631219_397091063791060_417750523363641973_o.jpg" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity" 
          alt="IMSEC Campus Background" 
        />
        
        {/* Current ambient background elements (Kept as fallback/enhancement) */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 30%, rgba(99,102,241,0.4), transparent 40%), radial-gradient(circle at 85% 80%, rgba(56,189,248,0.3), transparent 45%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 text-white w-full h-full">
          {/* Top Left Icon - Massively enlarged with heavier glow */}
          <div className="relative z-20">
            <a href="/" className="inline-block hover:scale-105 transition-transform duration-300">
              <img 
                src="digipass logo.png" 
                alt="DigiPass Home" 
                className="h-32 lg:h-[180px] w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
              />
            </a>
          </div>
          
          {/* Dynamic Text Section Restructured */}
          <div className="flex-1 flex flex-col mt-12 relative h-full">
            
            {/* Text Box - Centered vertically in the available upper space */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="relative h-32 max-w-4xl">
                {slogans.map((slogan, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col justify-center ${
                      index === sloganIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
                  >
                    <h2 className="text-4xl lg:text-5xl font-semibold leading-tight text-white mb-3 tracking-tight">
                      {slogan.title}
                    </h2>
                    {/* W-full to give it maximum horizontal space for 1 line */}
                    <p className="text-white/70 text-lg lg:text-xl font-light w-full">
                      {slogan.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Cards - Pushed to the absolute bottom using mt-auto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 mt-auto border-t border-white/10 mb-4">
              {[
                { 
                  k: 'Always On', 
                  v: 'Apply for passes anytime',
                  icon: <svg className="w-7 h-7 mb-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                },
                { 
                  k: 'Instant Workflow', 
                  v: 'Automated warden approvals',
                  icon: <svg className="w-7 h-7 mb-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                },
                { 
                  k: 'Gate Ready', 
                  v: 'Seamless QR verification',
                  icon: <svg className="w-7 h-7 mb-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                  {s.icon}
                  <div className="text-lg font-medium text-white mb-1">{s.k}</div>
                  <div className="text-sm text-white/60 font-light">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form panel - Now taking 30% width */}
      <div className="w-full lg:w-[30%] flex items-center justify-center px-8 py-12 bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-20">
        <div className="w-full max-w-sm">

          {/* Restructured Right Panel Header */}
          <div className="mb-4 text-center flex flex-col items-center">
            
            <a href="http://imsec.ac.in/" target="_blank" rel="noreferrer">
              <img 
                src="IMSEC Logo-3.jpg" 
                alt="IMS Engineering College" 
                className="w-[90%] max-w-[300px] h-auto object-contain rounded -mb-2"
              />
            </a>
            
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Hostel Management Portal</h1>
            {/* Powered By section moved up right below the header */}
            <div className="flex items-center justify-center gap-2 -mt-2 opacity-90 hover:opacity-100 transition-opacity">
              <span className="text-[13px] text-slate-400 font-medium tracking-wide">Powered by</span>
              <img 
                src="digipass logo.png" 
                alt="DigiPass Logo" 
                className="h-20 md:h-24 w-auto object-contain"
              />
            </div>

            {/* Credentials text moved down and given a negative top margin to counter image padding */}
            <p className="-mt-3 mb-2 text-sm text-center text-slate-500">
              Enter your campus credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                User ID
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.77 21.77 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.83 21.83 0 0 1-3.17 4.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-in fade-in slide-in-from-top-1">
                <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white text-sm font-semibold tracking-wide shadow-md hover:shadow-lg hover:from-slate-800 hover:to-indigo-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M22 12a10 10 0 0 1-10 10" /></svg>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-10 space-y-4">
            <p className="text-xs text-center text-slate-500 font-medium tracking-wide">
              Having trouble signing in? Contact your hostel office.
            </p>
            <p className="text-[11px] text-center text-slate-400 font-light tracking-wide">
              © {new Date().getFullYear()} DigiPass Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;