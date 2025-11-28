import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext'; // Assumes passes + updatePassStatus are here
import './ApprovalPage.css';

const ApprovalPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingPasses, setPendingPasses] = useState([]);
  const { updatePassStatus, getPendingPasses } = usePass();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadPendingPasses();
  }, []);

  const loadPendingPasses = async () => {
    setLoading(true);
    const passes = await getPendingPasses();
    // console.log('Pending passes:', passes); 
    setPendingPasses(passes || []);
    setLoading(false);
  };

  const handleApprove = async (passId) => {
    const result = await updatePassStatus(passId, "approved");
    if (result.success) {
      alert('Pass approved!');
      await loadPendingPasses(); // Refresh list
    }
  };

  const handleReject = async (passId) => {
    const result = await updatePassStatus(passId, "rejected");
    if (result.success) {
      alert('Pass rejected!');
      await loadPendingPasses(); // Refresh list
    }
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
                <th>PASS TYPE</th>
                <th>DATE</th>
                <th>APPROVAL OPTION</th>
              </tr>
            </thead>
            <tbody>
              {pendingPasses && pendingPasses.length > 0 ? (
                  pendingPasses.map((pass, idx) => (
                    <tr key={pass.pass_id || idx}>
                      <td>{pass.college_id}</td>
                      <td style={{textTransform: 'capitalize'}}>{pass.pass_type}</td>
                      <td>{pass.leave_start}</td>
                      <td>
                        {pass.pass_status && (pass.pass_status.toLowerCase() === 'approved' || pass.pass_status.toLowerCase() === 'rejected') ? (
                          <span className={`status-badge status-${pass.pass_status.toLowerCase()}`}>
                            {pass.pass_status}
                          </span>
                        ) : (
                          <div className="approval-buttons">
                            <button className="btn-approve" onClick={() => handleApprove(pass.pass_id)}>
                              Approve
                            </button>
                            <button className="btn-reject" onClick={() => handleReject(pass.pass_id)}>
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{textAlign:"center", padding: "20px"}}>
                      No pending pass requests
                    </td>
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
