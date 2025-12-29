import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClassSectionFilter from '../../../components/ClassSectionFilter';
import '../Dashboard.css';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    section: '',
    dob: '',
    fatherName: '',
    fatherMobile: '',
    motherName: '',
    address: '',
    photo: null
  });

  const fetchStudents = async () => {
    try {
      const params = {};
      if (filterClass) params.class = filterClass;
      if (filterSection) params.section = filterSection;

      const response = await axios.get('/api/admin/students', { params });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filterClass, filterSection]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'photo' && formData[key]) {
          formDataToSend.append('photo', formData[key]);
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post('/api/admin/students', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Student added successfully!');
      setShowAddForm(false);
      setFormData({
        name: '',
        class: '',
        section: '',
        dob: '',
        fatherName: '',
        fatherMobile: '',
        motherName: '',
        address: '',
        photo: null
      });
      fetchStudents();
    } catch (error) {
      alert('Error adding student: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await axios.delete(`/api/admin/students/${id}`);
      alert('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      alert('Error deleting student: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Students Management</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          {showAddForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      <ClassSectionFilter
        selectedClass={filterClass}
        selectedSection={filterSection}
        onClassChange={setFilterClass}
        onSectionChange={setFilterSection}
      />

      {showAddForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Add New Student</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Class *</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                required
              >
                <option value="">Select Class</option>
                {[
                  { value: 'Play', label: 'Play' },
                  { value: 'Nursery', label: 'Nursery' },
                  { value: 'LKG', label: 'LKG' },
                  { value: 'UKG', label: 'UKG' },
                  { value: '1', label: '1st' },
                  { value: '2', label: '2nd' },
                  { value: '3', label: '3rd' },
                  { value: '4', label: '4th' },
                  { value: '5', label: '5th' },
                  { value: '6', label: '6th' },
                  { value: '7', label: '7th' },
                  { value: '8', label: '8th' },
                  { value: '9', label: '9th' },
                  { value: '10', label: '10th' },
                  { value: '11', label: '11th' },
                  { value: '12', label: '12th' }
                ].map(cls => (
                  <option key={cls.value} value={cls.value}>{cls.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Section *</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                required
              >
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D', 'E', 'F'].map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Father's Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Father's Mobile *</label>
              <input
                type="tel"
                value={formData.fatherMobile}
                onChange={(e) => setFormData({ ...formData, fatherMobile: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Mother's Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Student</button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Village</th>
              <th>Father Mobile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.class}</td>
                <td>{student.address}</td>
                <td>{student.fatherMobile}</td>
                <td>
                  <button
                    onClick={() => handleDelete(student._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsManagement;

