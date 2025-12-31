// components/teacher/TeacherStudentsManagement.js
import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';
import './teacherstudentmanagement.css';

const TeacherStudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
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

  // Fetch teacher profile and assigned class info
  const fetchTeacherInfo = async () => {
    try {
      const response = await api.get('/api/teacher/profile');
      setTeacherInfo(response.data);
      
      // Pre-fill class and section from teacher's assignment
      if (response.data.assignedClass) {
        setFormData(prev => ({
          ...prev,
          class: response.data.assignedClass,
          section: response.data.assignedSection || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      alert('Error loading teacher profile: ' + (error.response?.data?.message || error.message));
    }
  };

  // Fetch students for teacher's assigned class
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch students using teacher-specific endpoint
      const response = await api.get('/api/teacher/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error fetching students: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchTeacherInfo();
      await fetchStudents();
    };
    init();
  }, []);

  // Handle form submission for adding student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Validate required fields
      if (!formData.name || !formData.class || !formData.section || !formData.dob || !formData.fatherMobile) {
        alert('Please fill all required fields (Name, Class, Section, DOB, Father Mobile)');
        return;
      }
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'photo' && formData[key]) {
          formDataToSend.append('photo', formData[key]);
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Use teacher-specific endpoint to add student
      await api.post('/api/teacher/students/add', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Student added successfully!');
      setShowAddForm(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      alert('Error adding student: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle student deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      // Use teacher-specific endpoint to delete student
      await axios.delete(`/api/teacher/students/${id}`);
      alert('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      alert('Error deleting student: ' + (error.response?.data?.message || error.message));
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      class: teacherInfo?.assignedClass || '',
      section: teacherInfo?.assignedSection || '',
      dob: '',
      fatherName: '',
      fatherMobile: '',
      motherName: '',
      address: '',
      photo: null
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate student age
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>My Students Management</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary"
          disabled={!teacherInfo?.assignedClass}
        >
          {showAddForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {/* Teacher's Class Information */}
      {teacherInfo?.assignedClass && (
        <div className="teacher-class-info">
          <div className="info-card">
            <div className="info-header">
              <i className="fas fa-chalkboard-teacher"></i>
              <h3>Your Assigned Class</h3>
            </div>
            <div className="info-content">
              <p><strong>Class:</strong> {teacherInfo.assignedClass}</p>
              <p><strong>Section:</strong> {teacherInfo.assignedSection || 'All Sections'}</p>
              <p><strong>Subject:</strong> {teacherInfo.subject}</p>
              {teacherInfo.assignedClasses && teacherInfo.assignedClasses.length > 0 && (
                <div className="additional-classes">
                  <p><strong>Additional Classes:</strong></p>
                  <div className="class-tags">
                    {teacherInfo.assignedClasses.map((cls, index) => (
                      <span key={index} className="class-tag">
                        {cls.class}-{cls.section} ({cls.subject})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warning if teacher has no assigned class */}
      {!teacherInfo?.assignedClass && (
        <div className="alert warning">
          <i className="fas fa-exclamation-triangle"></i>
          You are not assigned to any class. Please contact the administrator to get class assignment.
        </div>
      )}

      {/* Add Student Form - Only show if teacher has assigned class */}
      {showAddForm && teacherInfo?.assignedClass && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Add New Student to Your Class</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Student Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter student's full name"
              />
            </div>

            <div className="form-group">
              <label>Class *</label>
              {teacherInfo.assignedClasses?.length > 0 ? (
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  required
                >
                  <option value="">Select Class</option>
                  {teacherInfo.assignedClasses.map((cls, index) => (
                    <option key={index} value={cls.class}>
                      {cls.class === 'Play' ? 'Play' : 
                       cls.class === 'Nursery' ? 'Nursery' : 
                       cls.class === 'LKG' ? 'LKG' : 
                       cls.class === 'UKG' ? 'UKG' : 
                       `${cls.class}${cls.class === '1' ? 'st' : cls.class === '2' ? 'nd' : cls.class === '3' ? 'rd' : 'th'}`}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.class}
                  disabled
                  className="disabled-input"
                />
              )}
            </div>

            <div className="form-group">
              <label>Section *</label>
              {teacherInfo.assignedClasses?.length > 0 ? (
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                >
                  <option value="">Select Section</option>
                  {teacherInfo.assignedClasses
                    .filter(cls => cls.class === formData.class)
                    .map((cls, index) => (
                      <option key={index} value={cls.section}>
                        Section {cls.section}
                      </option>
                    ))}
                </select>
              ) : teacherInfo.assignedSection ? (
                <input
                  type="text"
                  value={formData.section}
                  disabled
                  className="disabled-input"
                />
              ) : (
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                >
                  <option value="">Select Section</option>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Father's Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="Father's name"
              />
            </div>

            <div className="form-group">
              <label>Father's Mobile *</label>
              <input
                type="tel"
                value={formData.fatherMobile}
                onChange={(e) => setFormData({ ...formData, fatherMobile: e.target.value })}
                required
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="form-group">
              <label>Mother's Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                placeholder="Mother's name"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Complete address"
              />
            </div>

            <div className="form-group full-width">
              <label>Student Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                className="file-input"
              />
              {formData.photo && (
                <div className="photo-preview">
                  <img 
                    src={URL.createObjectURL(formData.photo)} 
                    alt="Preview" 
                    className="preview-img"
                  />
                  <span>Photo preview</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Add Student
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Students List Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Students List</h3>
          <div className="table-stats">
            <span className="stat-badge">
              <i className="fas fa-users"></i> Total: {students.length} students
            </span>
            {teacherInfo?.assignedClass && (
              <span className="stat-badge">
                <i className="fas fa-chalkboard"></i> Class: {teacherInfo.assignedClass}
                {teacherInfo.assignedSection && ` - Section: ${teacherInfo.assignedSection}`}
              </span>
            )}
          </div>
        </div>

        {students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h4>No Students Found</h4>
            <p>
              {teacherInfo?.assignedClass 
                ? `No students are enrolled in your class yet. Click "Add Student" to add your first student.`
                : 'You need to be assigned to a class to view students.'}
            </p>
            {teacherInfo?.assignedClass && !showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                <i className="fas fa-plus"></i> Add First Student
              </button>
            )}
          </div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Details</th>
                <th>Class & Section</th>
                <th>Parent Information</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id} className="student-row">
                  <td className="serial-no">{index + 1}</td>
                  <td>
                    <div className="student-info">
                      <div className="student-avatar">
                        {student.photo ? (
                          <img 
                            src={`/uploads/${student.photo}`} 
                            alt={student.name}
                            className="avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="student-details">
                        <strong className="student-name">{student.name}</strong>
                        <div className="student-meta">
                          <span className="meta-item">
                            <i className="fas fa-birthday-cake"></i>
                            {formatDate(student.dob)} ({calculateAge(student.dob)} yrs)
                          </span>
                          {student.address && (
                            <span className="meta-item">
                              <i className="fas fa-map-marker-alt"></i>
                              {student.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="class-section-info">
                      <span className="class-badge">
                        {student.class === 'Play' ? 'Play' : 
                         student.class === 'Nursery' ? 'Nursery' : 
                         student.class === 'LKG' ? 'LKG' : 
                         student.class === 'UKG' ? 'UKG' : 
                         `Class ${student.class}`}
                      </span>
                      <span className="section-badge">
                        Section {student.section}
                      </span>
                      <div className="admission-date">
                        <small>
                          <i className="fas fa-calendar-alt"></i>
                          Admitted: {formatDate(student.admissionDate)}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="parent-info">
                      {student.fatherName && (
                        <div className="parent-item">
                          <i className="fas fa-male"></i>
                          <span>{student.fatherName}</span>
                        </div>
                      )}
                      {student.motherName && (
                        <div className="parent-item">
                          <i className="fas fa-female"></i>
                          <span>{student.motherName}</span>
                        </div>
                      )}
                      <div className="parent-item">
                        <i className="fas fa-phone"></i>
                        <span>{student.fatherMobile}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => {
                          // View student details - you can implement a modal
                          alert(`Viewing details for ${student.name}`);
                        }}
                        className="btn-view btn-small"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="btn-delete btn-small"
                        title="Delete Student"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentsManagement;