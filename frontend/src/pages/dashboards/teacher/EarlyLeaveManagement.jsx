import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const EarlyLeaveManagement = () => {
  const [studentClass, setStudentClass] = useState('');
  const [section, setSection] = useState('');
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    pickupPersonName: '',
    relation: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    if (!studentClass || !section) return;
    
    setLoading(true);
    try {
      const response = await api.get('/api/teacher/students', {
        params: { class: studentClass, section }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.pickupPersonName || !formData.relation) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await api.post('/api/teacher/early-leave', formData);
      alert('Early leave recorded and SMS/WhatsApp sent to parent!');
      setFormData({
        studentId: '',
        pickupPersonName: '',
        relation: ''
      });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Early Student Leave</h2>
      <form onSubmit={(e) => { e.preventDefault(); fetchStudents(); }} className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Class *</label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Section *</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-primary">Load Students</button>
      </form>

      {students.length > 0 && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Record Early Leave</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Pickup Person Name *</label>
              <input
                type="text"
                value={formData.pickupPersonName}
                onChange={(e) => setFormData({ ...formData, pickupPersonName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Relation *</label>
              <input
                type="text"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                placeholder="e.g., Father, Mother, Uncle"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Record Leave & Send Notification</button>
        </form>
      )}
    </div>
  );
};

export default EarlyLeaveManagement;



