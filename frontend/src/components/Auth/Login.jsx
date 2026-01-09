import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      // Redirect based on role
      const role = result.user.role.toLowerCase();
      
      if (role === 'student') {
        navigate('/apply-pass');
      } else if (role === 'warden') {
        navigate('/warden-approval');
      } else if (role === 'guard') {
        navigate('/verification');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gradient-to-br from-sky-900 to-blue-500
    ">
      <div className="
        w-[400px]
        p-10
        bg-white
        rounded-md
        shadow-2xl
      ">
        <div className="
            text-center
        ">
          <h1 className="
            text-[48px]
            text-[#154360]
            m-0
          ">IMSEC</h1>
        </div>
        <h2 className="
            text-center
            text-[#3b86d1]
            mb-7
            text-2xl
        ">IMSEC Hostel Portal</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="
            mb-5
          ">
            <input
              type="text"
              placeholder="College ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="
                w-full
                p-3
                border-2
                border-solid
                border-[#e0e0e0]
                rounded-md
                text-sm
                transition-colors duration-300 focus:outline-none focus:border-[#3b86d1]

              "
            />
          </div>
          
          <div className="mb-5">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="
                w-full
                p-3
                border-2
                border-solid
                border-[#e0e0e0]
                rounded-md
                text-sm
                transition-colors duration-300 focus:outline-none focus:border-[#3b86d1]

              "
            />
          </div>
          
          {error && <div className="
            text-[#ff4d6b]
            p-2.5
            bg-[#ffe0e6]
            rounded-[4px]
            mb-4
            text-center
            text-[14px]
          ">{error}</div>}
          
          <button type="submit" className="
            w-full
            p-[14px]
            bg-[#38ce3c]
            text-white
            border-none
            rounded-md
            text-lg
            font-semibold
            cursor-pointer
            transition-colors duration-300 hover:bg-[#2fb533]
          " disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;