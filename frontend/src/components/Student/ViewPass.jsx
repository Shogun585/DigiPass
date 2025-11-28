import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';
import './ViewPass.css';

const ViewPass = () => {
  const { user, logout } = useAuth();
  const { passes } = usePass();
  const navigate = useNavigate();

  // Filter passes for current user (if storing submittedBy)
  // or use passes directly if displaying all
  const userPasses = passes.filter(pass => pass.submittedBy === user?.username);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'active':
      case 'approved':
        return 'status-approved';
      case 'expired':
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>My Passes</p>
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

          {(!userPasses || userPasses.length === 0) ? (
            <div className="no-passes">
              <p>No passes found. Apply for a pass!</p>
            </div>
          ) : (
            <table className="passes-table">
              <thead>
                <tr>
                  <th>Admission No.</th>
                  <th>Name</th>
                  <th>Pass type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {userPasses.map((pass, idx) => (
                  <tr key={pass.id || idx}>
                    <td>{pass.admissionId}</td>
                    <td>{pass.name}</td>
                    <td>{pass.passType}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(pass.status)}`}>
                        {pass.status}
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
