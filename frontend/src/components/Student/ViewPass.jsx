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

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching passes from API...');
      const response = await passAPI.getMyPasses();
      console.log('API Response:', response.data);
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

  const getStatusClass = (status) => {
    switch((status || '').toLowerCase()) {
      case 'approved':
        return 'bg-[#21bf06] text-white';
      case 'rejected':
        return 'bg-[#ff4d6b] text-white';
      case 'pending':
        return 'bg-[#ffde73] text-[#333]';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-[#154360] text-white py-5 px-10 flex justify-between items-center">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>My Passes - {user?.first_name} {user?.last_name}</p>
        </div>
        <button onClick={handleLogout} className="py-2.5 px-5 bg-[#ff4d6b] text-white border-none rounded-md cursor-pointer font-semibold">
          Logout
        </button>
      </header>

      <div className="py-[30px] px-10 max-[700px]:p-2.5">
        <div className="mb-5">
          <button
            onClick={() => navigate('/apply-pass')}
            className="py-2.5 px-6 bg-[#3b86d1] border-none rounded-md text-white font-semibold cursor-pointer"
          >
            Apply for Pass
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 my-0 mx-auto max-w-[800px] max-[700px]:p-2.5">
          <h2>Student view pass page</h2>

          {loading ? (
            <div className="bg-[#ffebee] border-[1px] border-solid border-[#ff4d6b] text-[#dd175a] p-[22px] rounded-[7px] text-center text-[1.06rem]">
              <p>Loading passes...</p>
            </div>
          ) : error ? (
            <div className="bg-[#ffebee] border-[1px] border-solid border-[#ff4d6b] text-[#dd175a] p-[22px] rounded-[7px] text-center text-[1.06rem] text-[#ff4d6b] text-sm mt-0.5">
              <p>{error}</p>
              <button onClick={fetchPasses} className="py-2.5 px-6 bg-[#3b86d1] border-none rounded-md text-white font-semibold cursor-pointer">
                Retry
              </button>
            </div>
          ) : (!passes || passes.length === 0) ? (
            <div className="bg-[#ffeebee] border-[1px] border-solid border-[#ff4d6b] text-[#dd175a] p-[22px] rounded-[7px] text-center text-[1.06rem]">
              <p>No passes found. Apply for a pass!</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="last:border-b-0">
                  <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[700px]:p-2">ADMISSION NO.</th>
                  <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[700px]:p-2">NAME</th>
                  <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[700px]:p-2">PASS TYPE</th>
                  <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[700px]:p-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((pass, idx) => (
                  <tr className="last:border-b-0" key={pass.pass_id || idx}>
                    <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[700px]:p-2">{pass.college_id || user?.id}</td>
                    <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[700px]:p-2">{user?.first_name} {user?.last_name}</td>
                    <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[700px]:p-2" style={{textTransform: 'capitalize'}}>
                      {pass.pass_type}
                    </td>
                    <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[700px]:p-2">
                      <span className={`py-[7px] px-4 rounded-[5px] text-sm font-bold inline-block ${getStatusClass(pass.pass_status)}`}>
                        {pass.pass_status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPass;
