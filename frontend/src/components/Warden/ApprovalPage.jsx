import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext'; // Assumes passes + updatePassStatus are here

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
      return <span className="py-[7px] px-4 rounded-[5px] text-sm font-bold inline-block bg-[#21bf06] text-white">Approved</span>;
    } else if ((pass.status || "").toLowerCase() === "rejected") {
      return <span className="py-[7px] px-4 rounded-[5px] text-sm font-bold inline-block bg-[#ff4d6b] text-white">Rejected</span>;
    } else {
      return (
        <div className="flex gap-2.5">
          <button className="py-2 px-4 bg-[#21bf06] text-white border-none rounded cursor-pointer font-semibold transition duration-200 hover:bg-[#189c05]" onClick={() => handleApprove(pass.id)}>Approve</button>
          <button className="py-2 px-4 bg-[#ff4d6b] text-white border-none rounded cursor-pointer font-semibold transition duration-200 hover:bg-[#d12b50]" onClick={() => handleReject(pass.id)}>Reject</button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-[#154360] text-white py-5 px-10 flex justify-between items-center">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>Pass Approval Management</p>
        </div>
        <button onClick={handleLogout} className="py-2.5 px-5 bg-[#ff4d6b] text-white border-none rounded-md cursor-pointer font-semibold">
          Logout
        </button>
      </header>

      <div className="py-[30px] px-10 max-[900px]:p-[14px]">
        <h2>Approval page</h2>
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 my-0 mx-auto max-w-[900px]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[900px]:p-[7px]">ADMISSION ID</th>
                <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[900px]:p-[7px]">PASS TYPE</th>
                <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[900px]:p-[7px]">DATE</th>
                <th className="p-[15px] text-left border-b-[1px] border-b-solid border-b-[#e0e0e0] text-[#154360] uppercase text-[13px] bg-[#e3f2fd] font-semibold max-[900px]:p-[7px]">APPROVAL OPTION</th>
              </tr>
            </thead>
            <tbody>
              {pendingPasses && pendingPasses.length > 0 ? (
                  pendingPasses.map((pass, idx) => (
                    <tr key={pass.pass_id || idx}>
                      <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[900px]:p-[7px]">{pass.college_id}</td>
                      <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[900px]:p-[7px]" style={{textTransform: 'capitalize'}}>{pass.pass_type}</td>
                      <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[900px]:p-[7px]">{pass.leave_start}</td>
                      <td className="p-[15px] text-left border-b-solid border-b-[#e0e0e0] border-b-0 max-[900px]:p-[7px]">
                        {pass.pass_status && (pass.pass_status.toLowerCase() === 'approved' || pass.pass_status.toLowerCase() === 'rejected') ? (
                          <span className={`status-badge status-${pass.pass_status.toLowerCase()}`}>
                            {pass.pass_status}
                          </span>
                        ) : (
                          <div className="flex gap-2.5">
                            <button className="py-2 px-4 bg-[#21bf06] text-white border-none rounded-[4px] cursor-pointer transition duration-200 hover:bg-[#189c05]" onClick={() => handleApprove(pass.pass_id)}>
                              Approve
                            </button>
                            <button className="py-2 px-4 bg-[#ff4d6b] text-white border-none rounded-[4px] cursor-pointer transition duration-200 hover:bg-[#d12b50]" onClick={() => handleReject(pass.pass_id)}>
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
