import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const MarksManagement = () => {
  const [studentClass, setStudentClass] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('unit_test');
  const [totalMarks, setTotalMarks] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
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

  const handleMarksChange = (studentId, value) => {
    setMarks({ ...marks, [studentId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentClass || !section || !subject || !examType || !totalMarks) {
      alert('Please fill all required fields');
      return;
    }

    const marksArray = students.map(student => ({
      studentId: student._id,
      marksObtained: parseFloat(marks[student._id]) || 0,
      totalMarks: parseFloat(totalMarks)
    }));

    try {
      await api.post('/api/teacher/marks', {
        class: studentClass,
        section,
        subject,
        examType,
        marks: marksArray
      });
      alert('Marks uploaded successfully!');
      setMarks({});
    } catch (error) {
      alert('Error uploading marks: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Upload Marks</h2>
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
          <div className="form-grid">
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Exam Type *</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                required
              >
                <option value="unit_test">Unit Test</option>
                <option value="mid_term">Mid Term</option>
                <option value="final">Final</option>
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div className="form-group">
              <label>Total Marks *</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Marks Obtained</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>
                      <input
                        type="number"
                        value={marks[student._id] || ''}
                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                        min="0"
                        max={totalMarks}
                        style={{ width: '100px', padding: '0.5rem' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="submit" className="btn-primary">Upload Marks</button>
        </form>
      )}
    </div>
  );
};

export default MarksManagement;



