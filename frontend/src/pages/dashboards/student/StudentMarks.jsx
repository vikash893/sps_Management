import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [marksBySubject, setMarksBySubject] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', examType: '' });

  useEffect(() => {
    fetchMarks();
  }, [filter]);

  const fetchMarks = async () => {
    try {
      const params = {};
      if (filter.subject) params.subject = filter.subject;
      if (filter.examType) params.examType = filter.examType;
      
      const response = await api.get('/api/student/marks', { params });
      setMarks(response.data.marks);
      setMarksBySubject(response.data.marksBySubject);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-section">
      <h2>My Marks</h2>
      
      <div className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={filter.subject}
              onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
              placeholder="Filter by subject"
            />
          </div>
          <div className="form-group">
            <label>Exam Type</label>
            <select
              value={filter.examType}
              onChange={(e) => setFilter({ ...filter, examType: e.target.value })}
            >
              <option value="">All</option>
              <option value="unit_test">Unit Test</option>
              <option value="mid_term">Mid Term</option>
              <option value="final">Final</option>
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Exam Type</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((mark) => {
              const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(2);
              return (
                <tr key={mark._id}>
                  <td>{mark.subject}</td>
                  <td>{mark.examType}</td>
                  <td>{mark.marksObtained}</td>
                  <td>{mark.totalMarks}</td>
                  <td>{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentMarks;



