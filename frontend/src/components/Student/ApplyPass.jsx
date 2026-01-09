import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';

const ApplyPass = () => {
  const [formData, setFormData] = useState({
    name: '',
    admissionId: '',
    course: '',
    passType: ''
  });
  
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const { addPass } = usePass();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // if (!formData.admissionId.trim()) {
    //   newErrors.admissionId = 'Admission ID is required';
    // } else if (!/^AXXXXCS\d{4}$/.test(formData.admissionId)) {
    //   newErrors.admissionId = 'Invalid format (e.g., AXXXXCS1234)';
    // }
    
    if (!formData.course.trim()) {
      newErrors.course = 'Course is required';
    }
    
    if (!formData.passType) {
      newErrors.passType = 'Please select pass type';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Get today's date for pass validity
    const today = new Date().toISOString().split('T')[0];

    // Add pass via API (now it goes to backend!)
    const result = await addPass({
      name: formData.name,
      admissionId: formData.admissionId,
      course: formData.course,
      passType: formData.passType,
      leave_start: today,
      leave_end: formData.passType === 'Market Pass' ? today : formData.leave_end || today
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

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="bg-[#154360] text-white py-5 px-10 flex justify-between items-center">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>Apply for Pass</p>
        </div>
        <button onClick={handleLogout} className="py-2.5 px-5 bg-[#ff4d6b] text-white border-none rounded-md cursor-pointer font-semibold hover:bg-[#e6445f]">
          Logout
        </button>
      </header>

      <div className="py-7.5 px-10">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/view-pass')}
            className="py-2.5 px-6 bg-[#3b86d1] border-none rounded-md text-white font-semibold cursor-pointer hover:bg-[#1e5090]"
          >
            View My Passes
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.1)] p-8 max-w-[700px] my-0 mx-auto max-md:p-4">
          <h2>Apply for pass page</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="flex items-start gap-10 max-md:flex-col max-md:gap-4">
              <div className="flex-[0_0_100px]">
                <div className="w-[100px] h-[100px] rounded-full bg-[#e3f2fd] flex items-center justify-center">
                  <div className="text-5xl">
                    👤
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-[18px]">
                  <label className="block font-semibold text-[#154360] mb-[6px]">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full p-3 border-2 border-solid border-[#e0e0e0] rounded-md text-[16px]"
                  />
                  {errors.name && <span className="text-[#ff4d6b] text-sm mt-0.5">{errors.name}</span>}
                </div>

                <div className="mb-[18px]">
                  <label className="block font-semibold text-[#154360] mb-[6px]">Admission Id:</label>
                  <input
                    type="text"
                    name="admissionId"
                    value={formData.admissionId}
                    onChange={handleChange}
                    placeholder="AXXXXXXXXXX"
                    className="w-full p-3 border-2 border-solid border-[#e0e0e0] rounded-md text-[16px]"
                  />
                  {errors.admissionId && <span className="error">{errors.admissionId}</span>}
                </div>

                <div className="mb-[18px]">
                  <label className="block font-semibold text-[#154360] mb-[6px]">Course:</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Enter your course"
                    className="w-full p-3 border-2 border-solid border-[#e0e0e0] rounded-md text-[16px]"
                  />
                  {errors.course && <span className="error">{errors.course}</span>}
                </div>

                <div className="mb-[18px]">
                  <label className="block font-semibold text-[#154360] mb-[6px]">Pass:</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`py-2 px-5 border-2 border-solid border-[#3b86d1] bg-white text-[#3b86d1] font-semibold rounded-md cursor-pointer transition duration-200 active:bg-[#368bd1] active:text-white ${formData.passType === 'Market Pass' ? 'bg-[#368bd1] text-white' : ''}`}
                      onClick={() => setFormData({ ...formData, passType: 'Market Pass' })}
                    >
                      Market Pass
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-5 border-2 border-solid border-[#3b86d1] bg-white text-[#3b86d1] font-semibold rounded-md cursor-pointer transition duration-200 active:bg-[#368bd1] active:text-white ${formData.passType === 'Leave Pass' ? 'bg-[#368bd1] text-white' : ''}`}
                      onClick={() => setFormData({ ...formData, passType: 'Leave Pass' })}
                    >
                      Leave Pass
                    </button>
                  </div>
                  {errors.passType && <span className="text-[#ff4d6b] text-sm mt-0.5">{errors.passType}</span>}
                </div>

                <button type="submit" className="py-3 px-8 text-[16px] bg-[#38ce3c] text-white border-none rounded-md font-bold cursor-pointer hover:bg-[#2cb027]">
                  Submit Application
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyPass;