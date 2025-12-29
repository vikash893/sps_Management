import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [error, setError] = useState(null);
  
  // Store class as numbers but display formatted
  const availableClasses = [
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
  ];
  
  const availableSections = ['A', 'B', 'C', 'D', 'E', 'F'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    qualification: '',
    experience: '',
    username: '',
    password: '',
    assignedClass: '',
    assignedSection: ''
  });

  const [assignmentData, setAssignmentData] = useState({
    assignedClass: '',
    assignedSection: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching teachers...');
      
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Teachers API response:', response.data);
      
      // ✅ FIXED: The backend returns an array directly, not a success object
      if (Array.isArray(response.data)) {
        setTeachers(response.data);
        console.log('Teachers data set:', response.data.length, 'teachers');
      } else {
        console.warn('Unexpected response format:', response.data);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatClassName = (className) => {
    if (!className) return 'Not assigned';
    
    if (className === 'Play') return 'Play';
    if (className === 'Nursery') return 'Nursery';
    if (className === 'LKG') return 'LKG';
    if (className === 'UKG') return 'UKG';
    
    if (/^\d+$/.test(className)) {
      const num = parseInt(className);
      if (num === 1) return '1st';
      if (num === 2) return '2nd';
      if (num === 3) return '3rd';
      return `${num}th`;
    }
    
    return className;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('SENDING THIS DATA TO BACKEND:', formData);
      
      // Validate required fields for new teacher
      if (!editingTeacher && (!formData.name || !formData.username || !formData.password || !formData.phone)) {
        alert('Please fill all required fields: Name, Username, Password, and Phone');
        return;
      }
      
      // Validate required fields for editing teacher
      if (editingTeacher && (!formData.name || !formData.phone)) {
        alert('Please fill all required fields: Name and Phone');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (editingTeacher) {
        // When editing, send data but NOT username/password unless specifically changed
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          qualification: formData.qualification,
          experience: formData.experience,
          assignedClass: formData.assignedClass,
          assignedSection: formData.assignedSection
        };
        
        console.log('Update data:', updateData);
        await axios.put(`/api/admin/teachers/${editingTeacher._id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('Teacher updated successfully!');
      } else {
        // For new teacher, include username and password
        const createData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          qualification: formData.qualification,
          experience: formData.experience,
          username: formData.username,
          password: formData.password,
          assignedClass: formData.assignedClass,
          assignedSection: formData.assignedSection
        };
        
        console.log('Create data:', createData);
        const response = await api.post('/api/admin/teachers', createData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Teacher created:', response.data);
        alert('Teacher added successfully!');
      }
      setShowAddForm(false);
      setEditingTeacher(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        qualification: '',
        experience: '',
        username: '',
        password: '',
        assignedClass: '',
        assignedSection: ''
      });
      fetchTeachers();
    } catch (error) {
      console.error('🚨 FULL ERROR DETAILS:', error);
      console.error('🚨 Error response data:', error.response?.data);
      console.error('🚨 Error response status:', error.response?.status);
      console.error('🚨 Error message:', error.message);
      
      let errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Unknown error occurred';
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join(', ');
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      subject: teacher.subject || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      username: '', // Don't prefill for editing
      password: '', // Don't prefill password
      assignedClass: teacher.assignedClass || '',
      assignedSection: teacher.assignedSection || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/admin/teachers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Teacher deleted successfully!');
      fetchTeachers();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting teacher: ' + (error.response?.data?.message || error.message));
    }
  };

  const openAssignForm = (teacher) => {
    setSelectedTeacher(teacher);
    setAssignmentData({
      assignedClass: teacher.assignedClass || '',
      assignedSection: teacher.assignedSection || ''
    });
    setShowAssignForm(true);
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Use PATCH for class assignment endpoint
      const response = await axios.patch(
        `/api/admin/teachers/${selectedTeacher._id}/assign-class`,
        assignmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Assignment response:', response.data);
      alert('Class assignment updated successfully!');
      setShowAssignForm(false);
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (error) {
      console.error('Error assigning class:', error);
      alert('Error assigning class: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add user status toggle
  const handleToggleStatus = async (teacher) => {
    if (!window.confirm(`Are you sure you want to ${teacher.isActive === false ? 'activate' : 'deactivate'} this teacher?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/admin/users/${teacher.userId?._id || teacher.userId}/status`, {
        isActive: teacher.isActive === false
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert(`Teacher ${teacher.isActive === false ? 'activated' : 'deactivated'} successfully!`);
      fetchTeachers();
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Error updating status: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-section">
        <div className="error-message">
          <h3>Error loading teachers</h3>
          <p>{error}</p>
          <button onClick={fetchTeachers} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Teachers Management</h2>
        <div className="header-info">
          <span className="badge">{teachers.length} teachers</span>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Cancel' : '+ Add Teacher'}
          </button>
        </div>
      </div>

      {/* Add/Edit Teacher Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Full name"
              />
            </div>
            
            {!editingTeacher && (
              <>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder="Unique username"
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="At least 6 characters"
                    minLength="6"
                  />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@school.com"
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
              />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Mathematics, Science"
              />
            </div>
            <div className="form-group">
              <label>Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., M.Sc, B.Ed"
              />
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                min="0"
                max="50"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Class Incharge</label>
              <select
                value={formData.assignedClass}
                onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
              >
                <option value="">Select Class</option>
                {availableClasses.map(cls => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Section</label>
              <select
                value={formData.assignedSection}
                onChange={(e) => setFormData({ ...formData, assignedSection: e.target.value })}
              >
                <option value="">Select Section</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => {
              setShowAddForm(false);
              setEditingTeacher(null);
            }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Class Assignment Modal */}
      {showAssignForm && selectedTeacher && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Class Assignment - {selectedTeacher.name}</h3>
              <button className="modal-close" onClick={() => setShowAssignForm(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Class Incharge</label>
                  <select
                    value={assignmentData.assignedClass}
                    onChange={(e) => setAssignmentData({...assignmentData, assignedClass: e.target.value})}
                  >
                    <option value="">Select Class</option>
                    {availableClasses.map(cls => (
                      <option key={cls.value} value={cls.value}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Section</label>
                  <select
                    value={assignmentData.assignedSection}
                    onChange={(e) => setAssignmentData({...assignmentData, assignedSection: e.target.value})}
                  >
                    <option value="">Select Section</option>
                    {availableSections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div className="current-assignment">
                  <p><strong>Current:</strong> {
                    selectedTeacher.assignedClass 
                      ? `${formatClassName(selectedTeacher.assignedClass)} - ${selectedTeacher.assignedSection}` 
                      : 'Not assigned'
                  }</p>
                  <p><strong>New:</strong> {
                    assignmentData.assignedClass 
                      ? `${formatClassName(assignmentData.assignedClass)} - ${assignmentData.assignedSection}` 
                      : 'Not selected'
                  }</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary">
                  Save Assignment
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAssignForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teachers Table */}
      <div className="table-container">
        {teachers.length === 0 ? (
          <div className="empty-state">
            <h3>No Teachers Found</h3>
            <p>Add your first teacher using the "Add Teacher" button above.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Assigned Class/Section</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td>
                    <div className="teacher-info">
                      <strong>{teacher.name}</strong>
                      <small>{teacher.qualification || 'No qualification'}</small>
                    </div>
                  </td>
                  <td>{teacher.email || '-'}</td>
                  <td>{teacher.phone || '-'}</td>
                  <td>{teacher.subject || 'General'}</td>
                  <td>
                    {teacher.assignedClass ? (
                      <span className="class-badge">
                        {formatClassName(teacher.assignedClass)} - {teacher.assignedSection}
                      </span>
                    ) : (
                      <span className="text-muted">Not assigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${teacher.userId?.isActive === false ? 'inactive' : 'active'}`}>
                      {teacher.userId?.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openAssignForm(teacher)}
                        className="btn-info btn-small"
                        title="Update Class Assignment"
                      >
                        <i className="fas fa-chalkboard-teacher"></i> Assign
                      </button>
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="btn-primary btn-small"
                        title="Edit Teacher"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(teacher)}
                        className={`btn-warning btn-small ${teacher.userId?.isActive === false ? 'btn-success' : ''}`}
                        title={teacher.userId?.isActive === false ? 'Activate Teacher' : 'Deactivate Teacher'}
                      >
                        <i className={`fas fa-${teacher.userId?.isActive === false ? 'check' : 'ban'}`}></i> {teacher.userId?.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id)}
                        className="btn-danger btn-small"
                        title="Delete Teacher"
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

export default TeachersManagement;