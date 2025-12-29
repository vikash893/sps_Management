import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

const StudentFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    subject: '',
    message: '',
    rating: 5
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
    fetchTeachers();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('/api/student/feedback');
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/student/feedback', formData);
      alert('Feedback submitted successfully!');
      setShowForm(false);
      setFormData({
        teacherId: '',
        subject: '',
        message: '',
        rating: 5
      });
      fetchFeedback();
    } catch (error) {
      alert('Error submitting feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Feedback</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Submit Feedback'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Submit Feedback</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Teacher (Optional)</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              >
                <option value="">Select Teacher (Optional)</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.subject}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Subject or topic"
              />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              >
                <option value="5">5 ⭐⭐⭐⭐⭐</option>
                <option value="4">4 ⭐⭐⭐⭐</option>
                <option value="3">3 ⭐⭐⭐</option>
                <option value="2">2 ⭐⭐</option>
                <option value="1">1 ⭐</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows="5"
                placeholder="Your feedback message..."
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Submit Feedback</button>
        </form>
      )}

      <div className="cards-grid">
        {feedback.map((item) => (
          <div key={item._id} className="card">
            <h3>
              {item.teacherId ? `To: ${item.teacherId.name}` : 'General Feedback'}
            </h3>
            {item.subject && <p><strong>Subject:</strong> {item.subject}</p>}
            {item.rating && <p><strong>Rating:</strong> {'⭐'.repeat(item.rating)}</p>}
            <p><strong>Message:</strong> {item.message}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge status-${item.status}`}>
                {item.status}
              </span>
            </p>
            {item.adminResponse && (
              <p><strong>Admin Response:</strong> {item.adminResponse}</p>
            )}
            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
              Submitted: {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentFeedback;



