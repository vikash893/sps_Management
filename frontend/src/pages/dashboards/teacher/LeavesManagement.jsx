import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const LeavesManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/api/teacher/leaves');
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/teacher/leaves', formData);
      alert('Leave application submitted successfully!');
      setShowForm(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchLeaves();
    } catch (error) {
      alert('Error submitting leave: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>My Leave Applications</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Apply for Leave'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Apply for Leave</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows="4"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Submit Application</button>
        </form>
      )}

      <div className="cards-grid">
        {leaves.map((leave) => (
          <div key={leave._id} className="card">
            <h3>Leave Application</h3>
            <p><strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
            <p><strong>Reason:</strong> {leave.reason}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge status-${leave.status}`}>
                {leave.status}
              </span>
            </p>
            {leave.adminResponse && (
              <p><strong>Admin Response:</strong> {leave.adminResponse}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeavesManagement;



