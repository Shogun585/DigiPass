import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext'; // Assumes passes + updatePassStatus are here
import './ApprovalPage.css';

const ApprovalPage = () => {
  const { logout } = useAuth();
  const { passes, updatePassStatus } = usePass();
  const navigate = useNavigate();

  const handleApprove = (passId) => {
    updatePassStatus(passId, "Approved");
  };

  const handleReject = (passId) => {
    updatePassStatus(passId, "Rejected");
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusDisplay = (pass) => {
    if ((pass.status || "").toLowerCase() === "approved") {
      return <span className="status-badge status-approved">Approved</span>;
    } else if ((pass.status || "").toLowerCase() === "rejected") {
      return <span className="status-badge status-rejected">Rejected</span>;
    } else {
      return (
        <div className="approval-buttons">
          <button className="btn-approve" onClick={() => handleApprove(pass.id)}>Approve</button>
          <button className="btn-reject" onClick={() => handleReject(pass.id)}>Reject</button>
        </div>
      );
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>Pass Approval Management</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="content">
        <h2>Approval page</h2>
        <div className="approval-table-container">
          <table className="approval-table">
            <thead>
              <tr>
                <th>ADMISSION ID</th>
                <th>NAME</th>
                <th>PASS TYPE</th>
                <th>APPROVAL OPTION</th>
              </tr>
            </thead>
            <tbody>
              {passes && passes.length > 0 ? passes.map((pass, idx) => (
                <tr key={pass.id || idx}>
                  <td>{pass.admissionId}</td>
                  <td>{pass.name}</td>
                  <td>{pass.passType}</td>
                  <td>{getStatusDisplay(pass)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{textAlign:"center"}}>No pending requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;
