import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const LeavesManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/leaves' 
        : `/api/admin/leave?status=${filter}`;
      const response = await api.get(url);
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/api/admin/leaves/${id}`, { status });
      alert(`Leave ${status} successfully!`);
      fetchLeaves();
    } catch (error) {
      alert('Error updating leave: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Leave Requests</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="cards-grid">
        {leaves.map((leave) => (
          <div key={leave._id} className="card">
            <h3>{leave.teacherId?.name || 'Unknown Teacher'}</h3>
            <p><strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
            <p><strong>Reason:</strong> {leave.reason}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge status-${leave.status}`}>
                {leave.status}
              </span>
            </p>
            {leave.status === 'pending' && (
              <div className="card-actions">
                <button
                  onClick={() => handleStatusUpdate(leave._id, 'approved')}
                  className="btn-success"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                  className="btn-danger"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeavesManagement;



