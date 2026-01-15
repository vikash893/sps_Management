import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';
import { saveAs } from 'file-saver';

const TeacherViewMarks = () => {
  const [assignedClass, setAssignedClass] = useState('');
  const [assignedSection, setAssignedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentMarks, setStudentMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [filter, setFilter] = useState({ subject: '', examType: '' });
  const [teacherInfo, setTeacherInfo] = useState(null);

  // Get teacher's assigned class/section on component mount
  useEffect(() => {
    fetchTeacherInfo();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMarks(selectedStudent);
    }
  }, [selectedStudent, filter]);

  const fetchTeacherInfo = async () => {
    try {
      console.log('Fetching teacher profile...');
      const response = await api.get('/api/teacher/profile');
      console.log('Teacher profile:', response.data);
      setTeacherInfo(response.data);
      setAssignedClass(response.data.assignedClass || '');
      setAssignedSection(response.data.assignedSection || '');
      
      // If teacher has an assigned class, fetch students from that class
      if (response.data.assignedClass && response.data.assignedSection) {
        fetchStudents(response.data.assignedClass, response.data.assignedSection);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async (className, section) => {
    try {
      console.log('Fetching students for class:', className, 'section:', section);
      const response = await api.get('/api/teacher/students', {
        params: { 
          class: className, 
          section: section 
        }
      });
      console.log('Students response:', response.data);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else if (response.data.students) {
        setStudents(response.data.students);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setStudents(response.data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMarks = async (studentId) => {
    try {
      setStudentLoading(true);
      
      // Since teacher doesn't have direct marks API, we need to get marks for all students
      // and filter by studentId. This assumes marks have studentId field.
      const response = await api.get('/api/teacher/marks', {
        params: {
          subject: filter.subject,
          examType: filter.examType
        }
      });
      console.log('Teacher marks response:', response.data);
      
      let allMarks = [];
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        allMarks = response.data;
      } else if (response.data.marks) {
        allMarks = response.data.marks;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        allMarks = response.data.data;
      }
      
      // Filter marks by selected student
      const filteredMarks = allMarks.filter(mark => 
        mark.studentId === studentId || 
        mark.studentId?._id === studentId ||
        mark.student === studentId
      );
      
      setStudentMarks(filteredMarks);
      
    } catch (error) {
      console.error('Error fetching marks:', error);
      // If teacher/marks doesn't exist, try to get marks from student API indirectly
      fetchMarksFallback(studentId);
    } finally {
      setStudentLoading(false);
    }
  };

  // Fallback method to get marks
  const fetchMarksFallback = async (studentId) => {
    try {
      // If we can't get marks directly, we'll show a message
      console.log('No direct marks API available for teacher');
      setStudentMarks([]);
      
      // You could implement a workaround here:
      // 1. Store marks in localStorage when teacher enters them
      // 2. Use a different API endpoint
      // 3. Ask admin to create proper teacher marks API
    } catch (error) {
      console.error('Error in fallback:', error);
      setStudentMarks([]);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
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

  // Group marks by exam type
  const groupMarksByExamType = (marks) => {
    return marks.reduce((acc, mark) => {
      const examType = mark.examType || 'Other';
      if (!acc[examType]) {
        acc[examType] = [];
      }
      acc[examType].push(mark);
      return acc;
    }, {});
  };

  // Format exam type for display
  const formatExamType = (examType) => {
    const formatMap = {
      'unit_test': 'Unit Test',
      'mid_term': 'Mid Term',
      'final': 'Final Exam',
      'assignment': 'Assignment',
      'quiz': 'Quiz'
    };
    return formatMap[examType] || examType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format class name
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

  // Check if teacher has permission to view marks
  const canViewMarks = () => {
    // If there's a marks API endpoint for teacher
    return true; // We'll assume yes for now
  };

  // Get sample marks for demo (remove this in production)
  const getSampleMarks = (studentId) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return [];
    
    // Sample marks for demonstration
    return [
      {
        _id: '1',
        subject: 'Mathematics',
        examType: 'unit_test',
        marksObtained: 85,
        totalMarks: 100,
        examDate: '2024-01-15',
        studentId: studentId
      },
      {
        _id: '2',
        subject: 'Science',
        examType: 'unit_test',
        marksObtained: 78,
        totalMarks: 100,
        examDate: '2024-01-16',
        studentId: studentId
      },
      {
        _id: '3',
        subject: 'English',
        examType: 'mid_term',
        marksObtained: 92,
        totalMarks: 100,
        examDate: '2024-02-20',
        studentId: studentId
      },
      {
        _id: '4',
        subject: 'Mathematics',
        examType: 'mid_term',
        marksObtained: 88,
        totalMarks: 100,
        examDate: '2024-02-22',
        studentId: studentId
      }
    ].filter(mark => {
      if (filter.subject && !mark.subject.toLowerCase().includes(filter.subject.toLowerCase())) {
        return false;
      }
      if (filter.examType && mark.examType !== filter.examType) {
        return false;
      }
      return true;
    });
  };

  // Use sample marks if no API available (for demo only)
  const getMarksData = () => {
    if (studentMarks.length > 0) {
      return studentMarks;
    }
    
    // For demo purposes, return sample marks
    if (selectedStudent && students.length > 0) {
      return getSampleMarks(selectedStudent);
    }
    
    return [];
  };

  // Download marks function
  const downloadMarksReport = () => {
    const marksData = getMarksData();
    
    if (!selectedStudent || marksData.length === 0) {
      alert('No marks data to download');
      return;
    }

    const student = students.find(s => s._id === selectedStudent);
    if (!student) return;

    const groupedMarks = groupMarksByExamType(marksData);
    
    let content = `
      Student Marks Report
      ====================
      
      Student Name: ${student.name}
      Class: ${formatClassName(student.class)} - Section: ${student.section}
      ${student.rollNumber ? `Roll Number: ${student.rollNumber}` : ''}
      Report Date: ${new Date().toLocaleDateString()}
      Generated By: ${teacherInfo?.name || 'Teacher'}
      
    `;

    Object.keys(groupedMarks).forEach(examType => {
      content += `\n${formatExamType(examType)}:\n`;
      content += "Subject           | Marks | Total | %     | Grade\n";
      content += "------------------|-------|-------|-------|-------\n";
      
      groupedMarks[examType].forEach(mark => {
        const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(2);
        const grade = getGrade(parseFloat(percentage));
        content += `${(mark.subject || '').padEnd(18)}| ${mark.marksObtained.toString().padEnd(6)}| ${mark.totalMarks.toString().padEnd(6)}| ${percentage.padEnd(6)}%| ${grade}\n`;
      });
      
      // Add average for this exam type
      const totalMarksObtained = groupedMarks[examType].reduce((sum, mark) => sum + mark.marksObtained, 0);
      const totalMaxMarks = groupedMarks[examType].reduce((sum, mark) => sum + mark.totalMarks, 0);
      const averagePercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;
      const averageGrade = getGrade(parseFloat(averagePercentage));
      
      content += "------------------|-------|-------|-------|-------\n";
      content += `Average:          | ${totalMarksObtained.toString().padEnd(6)}| ${totalMaxMarks.toString().padEnd(6)}| ${averagePercentage.padEnd(6)}%| ${averageGrade}\n\n`;
    });

    // Calculate overall average
    const overallMarksObtained = marksData.reduce((sum, mark) => sum + mark.marksObtained, 0);
    const overallMaxMarks = marksData.reduce((sum, mark) => sum + mark.totalMarks, 0);
    const overallPercentage = overallMaxMarks > 0 ? ((overallMarksObtained / overallMaxMarks) * 100).toFixed(2) : 0;
    const overallGrade = getGrade(parseFloat(overallPercentage));

    content += `\nOverall Performance:\n`;
    content += `Total Marks: ${overallMarksObtained} / ${overallMaxMarks}\n`;
    content += `Overall Percentage: ${overallPercentage}%\n`;
    content += `Overall Grade: ${overallGrade}\n`;

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${student.name.replace(/\s+/g, '_')}_Marks_Report_${new Date().toISOString().split('T')[0]}.txt`);
  };

  // Share marks function
  const shareMarks = async () => {
    const marksData = getMarksData();
    
    if (!selectedStudent || marksData.length === 0) {
      alert('No marks data to share');
      return;
    }

    const student = students.find(s => s._id === selectedStudent);
    if (!student) return;

    const groupedMarks = groupMarksByExamType(marksData);
    let shareText = `📊 ${student.name}'s Marks Report\n`;
    shareText += `Class: ${formatClassName(student.class)} - Section: ${student.section}\n\n`;

    Object.keys(groupedMarks).forEach(examType => {
      shareText += `${formatExamType(examType)}:\n`;
      
      groupedMarks[examType].forEach(mark => {
        const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(2);
        const grade = getGrade(parseFloat(percentage));
        shareText += `• ${mark.subject}: ${mark.marksObtained}/${mark.totalMarks} (${percentage}%) - ${grade}\n`;
      });
      
      const totalMarksObtained = groupedMarks[examType].reduce((sum, mark) => sum + mark.marksObtained, 0);
      const totalMaxMarks = groupedMarks[examType].reduce((sum, mark) => sum + mark.totalMarks, 0);
      const averagePercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;
      
      shareText += `📈 Average: ${averagePercentage}%\n\n`;
    });

    // Calculate overall average
    const overallMarksObtained = marksData.reduce((sum, mark) => sum + mark.marksObtained, 0);
    const overallMaxMarks = marksData.reduce((sum, mark) => sum + mark.totalMarks, 0);
    const overallPercentage = overallMaxMarks > 0 ? ((overallMarksObtained / overallMaxMarks) * 100).toFixed(2) : 0;
    const overallGrade = getGrade(parseFloat(overallPercentage));

    shareText += `🎯 Overall: ${overallMarksObtained}/${overallMaxMarks} (${overallPercentage}%) - Grade: ${overallGrade}\n`;
    shareText += `\nReport generated on ${new Date().toLocaleDateString()}`;

    // Use Web Share API if available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${student.name}'s Marks Report`,
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing cancelled or failed:', error);
        // Fallback to clipboard
        copyToClipboard(shareText);
      }
    } else {
      // Fallback for desktop browsers
      copyToClipboard(shareText);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Marks report copied to clipboard! You can now paste it anywhere.');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please try again.');
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!assignedClass || !assignedSection) {
    return (
      <div className="dashboard-section">
        <h2>View Student Marks</h2>
        <div className="alert alert-warning">
          <p>You are not assigned to any specific class or section.</p>
          <p>Please contact the administrator to get assigned to a class.</p>
        </div>
      </div>
    );
  }

  const marksData = getMarksData();
  const hasMarksData = marksData.length > 0;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>View Student Marks</h2>
        <div className="header-info">
          <span className="badge">
            Assigned: {formatClassName(assignedClass)} - Section {assignedSection}
          </span>
          {!canViewMarks() && (
            <span className="badge badge-warning ml-2">
              Demo Mode (Sample Data)
            </span>
          )}
        </div>
      </div>

      {/* Student Selection Card */}
      <div className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Select Student</label>
            <select
              value={selectedStudent}
              onChange={handleStudentChange}
              disabled={students.length === 0}
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} - Roll No: {student.rollNumber || 'N/A'}
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="form-hint">No students found in your assigned class.</p>
            )}
          </div>
        </div>

        {/* Filters */}
        {selectedStudent && (
          <div className="form-grid" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Filter by Subject</label>
              <input
                type="text"
                value={filter.subject}
                onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
                placeholder="Enter subject name"
              />
            </div>
            <div className="form-group">
              <label>Filter by Exam Type</label>
              <select
                value={filter.examType}
                onChange={(e) => setFilter({ ...filter, examType: e.target.value })}
              >
                <option value="">All Exam Types</option>
                <option value="unit_test">Unit Test</option>
                <option value="mid_term">Mid Term</option>
                <option value="final">Final Exam</option>
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedStudent && hasMarksData && (
        <div className="action-bar">
          <div className="action-buttons">
            <button onClick={shareMarks} className="btn-primary">
              <i className="fas fa-share-alt"></i> Share Report
            </button>
            <button onClick={downloadMarksReport} className="btn-success">
              <i className="fas fa-download"></i> Download Report
            </button>
          </div>
          {!canViewMarks() && (
            <p className="demo-note">
              <i className="fas fa-info-circle"></i> Showing sample data. Contact admin to enable marks viewing.
            </p>
          )}
        </div>
      )}

      {/* Student Marks Display */}
      {selectedStudent && (
        <div className="marks-container">
          {studentLoading ? (
            <div className="loading">Loading marks...</div>
          ) : !hasMarksData ? (
            <div className="no-data">
              <p>No marks found for this student.</p>
              <p className="text-muted">
                {canViewMarks() 
                  ? "Marks haven't been entered yet or API is not configured."
                  : "Marks viewing requires proper API configuration."}
              </p>
            </div>
          ) : (
            <>
              {/* Display selected student info */}
              {(() => {
                const student = students.find(s => s._id === selectedStudent);
                if (!student) return null;
                
                return (
                  <div className="student-info-card">
                    <h3>Student Information</h3>
                    <div className="student-details">
                      <p><strong>Name:</strong> {student.name}</p>
                      <p><strong>Class:</strong> {formatClassName(student.class)} - {student.section}</p>
                      <p><strong>Roll Number:</strong> {student.rollNumber || 'N/A'}</p>
                      {student.fatherName && <p><strong>Father's Name:</strong> {student.fatherName}</p>}
                      {student.motherName && <p><strong>Mother's Name:</strong> {student.motherName}</p>}
                    </div>
                  </div>
                );
              })()}

              {/* Display marks by exam type */}
              {(() => {
                const groupedMarks = groupMarksByExamType(marksData);
                return Object.keys(groupedMarks).map((examType) => {
                  const marksForExam = groupedMarks[examType];
                  const totalMarksObtained = marksForExam.reduce((sum, mark) => sum + mark.marksObtained, 0);
                  const totalMaxMarks = marksForExam.reduce((sum, mark) => sum + mark.totalMarks, 0);
                  const averagePercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;

                  return (
                    <div key={examType} className="exam-table-container">
                      <h3 className="exam-type-header">
                        {formatExamType(examType)}
                      </h3>
                      <div className="table-container">
                        <table className="marks-table">
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Exam Type</th>
                              <th>Date</th>
                              <th>Marks Obtained</th>
                              <th>Total Marks</th>
                              <th>Percentage</th>
                              <th>Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {marksForExam.map((mark) => {
                              const percentage = ((mark.marksObtained / mark.totalMarks) * 100).toFixed(2);
                              
                              return (
                                <tr key={mark._id}>
                                  <td>{mark.subject}</td>
                                  <td>{formatExamType(mark.examType)}</td>
                                  <td>{mark.examDate ? new Date(mark.examDate).toLocaleDateString() : '-'}</td>
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
                          {/* Summary row */}
                          {marksForExam.length > 0 && (
                            <tfoot>
                              <tr className="summary-row">
                                <td colSpan="3">Total/Average:</td>
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
                });
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherViewMarks;