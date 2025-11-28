import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { passAPI } from '../../services/api';
import './ViewPass.css';

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
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
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
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>My Passes - {user?.first_name} {user?.last_name}</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="content">
        <div className="navigation-buttons">
          <button
            onClick={() => navigate('/apply-pass')}
            className="btn-secondary"
          >
            Apply for Pass
          </button>
        </div>

        <div className="passes-table-container">
          <h2>Student view pass page</h2>

          {loading ? (
            <div className="no-passes">
              <p>Loading passes...</p>
            </div>
          ) : error ? (
            <div className="no-passes error">
              <p>{error}</p>
              <button onClick={fetchPasses} className="btn-secondary">
                Retry
              </button>
            </div>
          ) : (!passes || passes.length === 0) ? (
            <div className="no-passes">
              <p>No passes found. Apply for a pass!</p>
            </div>
          ) : (
            <table className="passes-table">
              <thead>
                <tr>
                  <th>ADMISSION NO.</th>
                  <th>NAME</th>
                  <th>PASS TYPE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((pass, idx) => (
                  <tr key={pass.pass_id || idx}>
                    <td>{pass.college_id || user?.id}</td>
                    <td>{user?.first_name} {user?.last_name}</td>
                    <td style={{textTransform: 'capitalize'}}>
                      {pass.pass_type}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(pass.pass_status)}`}>
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
