import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [marksBySubject, setMarksBySubject] = useState({});
  const [groupedMarks, setGroupedMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', examType: '' });

  useEffect(() => {
    fetchMarks();
  }, [filter]);

  useEffect(() => {
    // Group marks by exam type
    if (marks.length > 0) {
      const grouped = marks.reduce((acc, mark) => {
        const examType = mark.examType || 'Other';
        if (!acc[examType]) {
          acc[examType] = [];
        }
        acc[examType].push(mark);
        return acc;
      }, {});
      
      setGroupedMarks(grouped);
    }
  }, [marks]);

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

  // Function to calculate grade
  const getGrade = (percent) => {
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B+';
    if (percent >= 60) return 'B';
    if (percent >= 50) return 'C';
    if (percent >= 40) return 'D';
    return 'F';
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

      {/* Display tables for each exam type */}
      {Object.keys(groupedMarks).length > 0 ? (
        Object.keys(groupedMarks).map((examType) => {
          // Calculate totals for this exam type
          const totalMarksObtained = groupedMarks[examType].reduce((sum, mark) => sum + mark.marksObtained, 0);
          const totalMaxMarks = groupedMarks[examType].reduce((sum, mark) => sum + mark.totalMarks, 0);
          const averagePercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;
          
          return (
            <div key={examType} className="exam-table-container">
              <h3 className="exam-type-header">
                {examType === 'unit_test' ? 'Unit Test' : 
                 examType === 'mid_term' ? 'Mid Term' : 
                 examType === 'final' ? 'Final Exam' : 
                 examType === 'assignment' ? 'Assignment' : 
                 examType === 'quiz' ? 'Quiz' : examType}
              </h3>
              <div className="table-container">
                <table className="marks-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam Type</th>
                      <th>Marks Obtained</th>
                      <th>Total Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedMarks[examType].map((mark) => {
                      const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(2);
                      
                      return (
                        <tr key={mark._id}>
                          <td>{mark.subject}</td>
                          <td>{mark.examType}</td>
                          <td>{mark.marksObtained}</td>
                          <td>{mark.totalMarks}</td>
                          <td>{percentage}%</td>
                          <td className={`grade-${getGrade(parseFloat(percentage)).toLowerCase()}`}>
                            {getGrade(parseFloat(percentage))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Add summary row if there are multiple subjects */}
                  {groupedMarks[examType].length > 1 && (
                    <tfoot>
                      <tr className="summary-row">
                        <td colSpan="2">Total/Average:</td>
                        <td>{totalMarksObtained}</td>
                        <td>{totalMaxMarks}</td>
                        <td>{averagePercentage}%</td>
                        <td className={`grade-${getGrade(parseFloat(averagePercentage)).toLowerCase()}`}>
                          {getGrade(parseFloat(averagePercentage))}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          );
        })
      ) : marks.length > 0 ? (
        // Fallback to original table if grouping didn't work
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
      ) : (
        <div className="no-data">
          <p>No marks data available</p>
        </div>
      )}
    </div>
  );
};

export default StudentMarks;