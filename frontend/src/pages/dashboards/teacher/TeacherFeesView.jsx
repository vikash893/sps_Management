import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const TeacherFeesView = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState(null);
  
  // Filter states
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeeType, setFilterFeeType] = useState('');

  // Fee types
  const feeTypes = [
    { value: 'tuition', label: 'Tuition Fee' },
    { value: 'library', label: 'Library Fee' },
    { value: 'sports', label: 'Sports Fee' },
    { value: 'lab', label: 'Lab Fee' },
    { value: 'transport', label: 'Transport Fee' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchTeacherInfo();
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      console.log('Fetching teacher profile...');
      const res = await api.get('/api/teacher/profile');
      console.log('Teacher profile:', res.data);
      setTeacherInfo(res.data);
      
      // Set default filters based on teacher's assignment
      if (res.data.assignedClass) {
        setFilterClass(res.data.assignedClass);
      }
      if (res.data.assignedSection) {
        setFilterSection(res.data.assignedSection);
      }
      
      // Now fetch data based on teacher's assignment
      if (res.data.assignedClass) {
        fetchFees(res.data);
        fetchStudents(res.data);
      } else {
        // Teacher has no specific assignment
        console.log('Teacher has no assigned class');
        setFees([]);
        setStudents([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching teacher info:', err);
      // If profile endpoint doesn't exist, check if we're logged in as teacher
      checkIfTeacherAndFetch();
    }
  };

  const checkIfTeacherAndFetch = async () => {
    try {
      // Try to fetch from admin endpoint first (for testing)
      const userRes = await axios.get('/api/auth/me');
      console.log('Current user:', userRes.data);
      
      if (userRes.data.role === 'teacher') {
        // If teacher but no profile endpoint, use fallback
        setTeacherInfo({ 
          name: userRes.data.username,
          assignedClass: null,
          assignedSection: null 
        });
        fetchFeesFromAdmin(); // Fallback to admin endpoint
        fetchAllStudents();
      } else {
        // Not a teacher
        setFees([]);
        setStudents([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setLoading(false);
    }
  };

  const fetchFees = async (teacherData) => {
    try {
      console.log('Fetching fees for teacher:', teacherData);
      const res = await axios.get('/api/teacher/fees');
      console.log('Teacher fees:', res.data);
      setFees(res.data);
    } catch (err) {
      console.error('Error fetching teacher fees:', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeesFromAdmin = async () => {
    try {
      console.log('Trying to fetch fees from admin endpoint...');
      const res = await axios.get('/api/admin/fees');
      setFees(res.data);
    } catch (err) {
      console.error('Error fetching admin fees:', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (teacherData) => {
    try {
      console.log('Fetching students for teacher:', teacherData);
      const res = await axios.get('/api/teacher/students');
      console.log('Teacher students:', res.data);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    }
  };

  const fetchAllStudents = async () => {
  try {
    console.log('Fetching all students...');
    // Use the new endpoint
    const res = await axios.get('/api/teacher/students/all');
    setStudents(res.data);
  } catch (err) {
    console.error('Error fetching all students:', err);
    setStudents([]);
  }
};

  const calculateStats = () => {
    let filteredFees = fees;
    
    // Apply filters
    filteredFees = filteredFees.filter(f => {
      if (filterClass && f.class !== filterClass) return false;
      if (filterSection && f.section !== filterSection) return false;
      if (filterStudent && f.studentId?._id !== filterStudent) return false;
      if (filterStatus && f.status !== filterStatus) return false;
      if (filterFeeType && f.feeType !== filterFeeType) return false;
      return true;
    });

    const totalAmount = filteredFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const totalPaid = filteredFees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
    const totalPending = totalAmount - totalPaid;
    const totalStudents = new Set(filteredFees.map(f => f.studentId?._id)).size;
    const paidPercentage = totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(1) : 0;

    return { totalAmount, totalPaid, totalPending, totalStudents, paidPercentage };
  };

  const stats = calculateStats();

  const formatClassName = (className) => {
    if (!className) return '';
    
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

  if (loading) {
    return <div className="loading">Loading fees data...</div>;
  }

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Student Fees (View Only)</h2>
        <div className="teacher-info">
          <span className="badge badge-info">
            <i className="fas fa-chalkboard-teacher"></i> Teacher View
          </span>
          {teacherInfo?.assignedClass ? (
            <span className="badge badge-secondary ml-2">
              Class: {formatClassName(teacherInfo.assignedClass)}
              {teacherInfo.assignedSection && ` - Section: ${teacherInfo.assignedSection}`}
            </span>
          ) : (
            <span className="badge badge-warning ml-2">
              No class assigned
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">₹{stats.totalAmount.toLocaleString()}</div>
          <div className="stat-label">Total Fees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#28a745' }}>
            ₹{stats.totalPaid.toLocaleString()}
          </div>
          <div className="stat-label">Total Paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#dc3545' }}>
            ₹{stats.totalPending.toLocaleString()}
          </div>
          <div className="stat-label">Total Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
      </div>

      {/* Filters */}
      <div className="form-card">
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="form-group">
            <label>Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {teacherInfo?.assignedClass ? (
                <option value={teacherInfo.assignedClass}>
                  {formatClassName(teacherInfo.assignedClass)}
                </option>
              ) : (
                [...new Set(fees.map(f => f.class))].map(className => (
                  <option key={className} value={className}>
                    {formatClassName(className)}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {teacherInfo?.assignedSection ? (
                <option value={teacherInfo.assignedSection}>
                  {teacherInfo.assignedSection}
                </option>
              ) : (
                [...new Set(fees.map(f => f.section))].map(section => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Student</label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} - {formatClassName(student.class)}-{student.section}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fee Type</label>
            <select
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value)}
            >
              <option value="">All Types</option>
              {feeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fees Table - View Only */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Class-Section</th>
              <th>Fee Type</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  <div className="empty-state">
                    <i className="fas fa-info-circle"></i>
                    <p>No fees data available</p>
                    {!teacherInfo?.assignedClass && (
                      <p className="text-muted">Teacher not assigned to any class</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              fees
                .filter(fee => {
                  if (filterClass && fee.class !== filterClass) return false;
                  if (filterSection && fee.section !== filterSection) return false;
                  if (filterStudent && fee.studentId?._id !== filterStudent) return false;
                  if (filterStatus && fee.status !== filterStatus) return false;
                  if (filterFeeType && fee.feeType !== filterFeeType) return false;
                  return true;
                })
                .map((fee) => {
                  const paid = fee.amountPaid || 0;
                  const remaining = fee.amount - paid;
                  const isOverdue = new Date(fee.dueDate) < new Date() && remaining > 0;
                  const feeTypeLabel = feeTypes.find(t => t.value === fee.feeType)?.label || fee.feeType;

                  return (
                    <tr key={fee._id}>
                      <td>{fee.studentId?.name || 'N/A'}</td>
                      <td>{formatClassName(fee.class)}-{fee.section}</td>
                      <td>{feeTypeLabel}</td>
                      <td>₹{fee.amount?.toFixed(2) || '0.00'}</td>
                      <td style={{ color: '#28a745' }}>₹{paid.toFixed(2)}</td>
                      <td style={{ color: remaining > 0 ? '#dc3545' : '#28a745' }}>
                        ₹{remaining.toFixed(2)}
                      </td>
                      <td className={isOverdue ? 'text-danger' : ''}>
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                        {isOverdue && <i className="fas fa-exclamation-circle ml-1"></i>}
                      </td>
                      <td>
                        <span className={`status-badge status-${fee.status}`}>
                          {fee.status}
                          {isOverdue && fee.status !== 'paid' && ' (Overdue)'}
                        </span>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherFeesView;