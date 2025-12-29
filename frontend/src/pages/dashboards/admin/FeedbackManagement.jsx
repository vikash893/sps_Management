import React, { useState, useEffect } from 'react';
import api from '../../../api/axios'; // ✅ use centralized axios
import '../Dashboard.css';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await api.get('/api/admin/feedback'); // ✅ changed
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <h2>Feedback Management</h2>

      <div className="cards-grid">
        {feedback.map((item) => (
          <div key={item._id} className="card">
            <h3>From: {item.studentId?.name || 'Unknown'}</h3>

            {item.teacherId && (
              <p>
                <strong>Teacher:</strong> {item.teacherId.name}
              </p>
            )}

            {item.subject && (
              <p>
                <strong>Subject:</strong> {item.subject}
              </p>
            )}

            {item.rating && (
              <p>
                <strong>Rating:</strong> {'⭐'.repeat(item.rating)}
              </p>
            )}

            <p>
              <strong>Message:</strong> {item.message}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              <span className={`status-badge status-${item.status}`}>
                {item.status}
              </span>
            </p>

            {item.adminResponse && (
              <p>
                <strong>Response:</strong> {item.adminResponse}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackManagement;
