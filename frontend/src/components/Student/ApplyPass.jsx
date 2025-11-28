import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePass } from '../../context/PassContext';
import './ApplyPass.css';

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
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>IMSEC Hostel Portal</h1>
          <p>Apply for Pass</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="content">
        <div className="navigation-buttons">
          <button 
            onClick={() => navigate('/view-pass')}
            className="btn-secondary"
          >
            View My Passes
          </button>
        </div>

        <div className="apply-pass-form">
          <h2>Apply for pass page</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-layout">
              <div className="profile-section">
                <div className="profile-photo">
                  <div className="avatar-placeholder">
                    👤
                  </div>
                </div>
              </div>

              <div className="form-fields">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                  {errors.name && <span className="error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Admission Id:</label>
                  <input
                    type="text"
                    name="admissionId"
                    value={formData.admissionId}
                    onChange={handleChange}
                    placeholder="AXXXXXXXXXX"
                  />
                  {errors.admissionId && <span className="error">{errors.admissionId}</span>}
                </div>

                <div className="form-group">
                  <label>Course:</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Enter your course"
                  />
                  {errors.course && <span className="error">{errors.course}</span>}
                </div>

                <div className="form-group">
                  <label>Pass:</label>
                  <div className="pass-type-buttons">
                    <button
                      type="button"
                      className={`btn-pass-type ${formData.passType === 'Market Pass' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, passType: 'Market Pass' })}
                    >
                      Market Pass
                    </button>
                    <button
                      type="button"
                      className={`btn-pass-type ${formData.passType === 'Leave Pass' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, passType: 'Leave Pass' })}
                    >
                      Leave Pass
                    </button>
                  </div>
                  {errors.passType && <span className="error">{errors.passType}</span>}
                </div>

                <button type="submit" className="btn-submit">
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