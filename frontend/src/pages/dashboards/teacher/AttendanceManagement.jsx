import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

const AttendanceManagement = () => {
  const [studentClass, setStudentClass] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('all');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState(null);

  const subjects = [
    'all',
    'math',
    'science',
    'english',
    'hindi',
    'social studies',
    'physics',
    'chemistry',
    'biology',
    'computer',
    'art',
    'music',
    'physical education'
  ];

  const fetchStudents = async () => {
    if (!studentClass || !section) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/teacher/students', {
        params: { class: studentClass, section }
      });
      setStudents(response.data);
      
      // Load existing attendance if available
      const attendanceResponse = await axios.get('/api/teacher/attendance', {
        params: { class: studentClass, section, subject, date }
      });
      
      const attendanceMap = {};
      attendanceResponse.data.forEach(record => {
        attendanceMap[record.studentId._id] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentClass || !section || !subject || !date) {
      alert('Please select class, section, subject, and date');
      return;
    }

    const attendanceArray = students.map(student => ({
      studentId: student._id,
      status: attendance[student._id] || 'absent'
    }));

    try {
      await axios.post('/api/teacher/attendance', {
        class: studentClass,
        section,
        subject,
        date,
        attendance: attendanceArray
      });
      alert(`Attendance marked successfully for ${subject === 'all' ? 'All Subjects' : subject}!`);
      fetchStudents();
    } catch (error) {
      alert('Error marking attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchAttendanceStats = async () => {
    if (!studentClass || !section) {
      alert('Please select class and section first');
      return;
    }

    try {
      const response = await axios.get('/api/teacher/attendance/stats', {
        params: { class: studentClass, section, subject }
      });
      setAttendanceStats(response.data);
      setShowStats(true);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Error fetching attendance statistics');
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Mark Attendance</h2>
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
          <div className="form-group">
            <label>Subject *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              {subjects.map(sub => (
                <option key={sub} value={sub}>
                  {sub === 'all' ? 'All Subjects' : sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary">Load Students</button>
          {students.length > 0 && (
            <button type="button" onClick={fetchAttendanceStats} className="btn-primary" style={{ background: '#17a2b8' }}>
              View Attendance Stats
            </button>
          )}
        </div>
      </form>

      {showStats && attendanceStats && (
        <div className="form-card" style={{ marginTop: '2rem', background: '#e7f3ff' }}>
          <h3>Attendance Statistics</h3>
          <div className="cards-grid">
            {attendanceStats.statsBySubject.map((stat) => (
              <div key={stat.subject} className="card">
                <h4>{stat.subject === 'all' ? 'All Subjects' : stat.subject.charAt(0).toUpperCase() + stat.subject.slice(1)}</h4>
                <p><strong>Total Classes:</strong> {stat.totalClasses}</p>
                <p><strong>Present:</strong> {stat.present}</p>
                <p><strong>Absent:</strong> {stat.absent}</p>
                <p><strong>Late:</strong> {stat.late}</p>
                <p><strong>Total Records:</strong> {stat.present + stat.absent + stat.late}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setShowStats(false)} className="btn-primary" style={{ marginTop: '1rem' }}>
            Close Stats
          </button>
        </div>
      )}

      {students.length > 0 && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Mark Attendance for {studentClass}-{section} - {subject === 'all' ? 'All Subjects' : subject.charAt(0).toUpperCase() + subject.slice(1)}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>
                      <input
                        type="radio"
                        name={`attendance-${student._id}`}
                        checked={attendance[student._id] === 'present'}
                        onChange={() => handleStatusChange(student._id, 'present')}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`attendance-${student._id}`}
                        checked={attendance[student._id] === 'absent'}
                        onChange={() => handleStatusChange(student._id, 'absent')}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`attendance-${student._id}`}
                        checked={attendance[student._id] === 'late'}
                        onChange={() => handleStatusChange(student._id, 'late')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="submit" className="btn-primary">Save Attendance</button>
        </form>
      )}
    </div>
  );
};

export default AttendanceManagement;

