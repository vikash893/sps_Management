import React from 'react';
import '../Dashboard.css';

const TeacherHome = () => {
  return (
    <div className="dashboard-home">
      <h2>Teacher Dashboard</h2>
      <p>Welcome to your dashboard. Use the navigation menu to access different features.</p>
      <div className="cards-grid">
        <div className="card">
          <h3>✅ Mark Attendance</h3>
          <p>Select class and section to mark student attendance</p>
        </div>
        <div className="card">
          <h3>📝 Upload Marks</h3>
          <p>Upload student marks for different subjects and exams</p>
        </div>
        <div className="card">
          <h3>🚪 Early Student Leave</h3>
          <p>Record early student leave and notify parents via SMS/WhatsApp</p>
        </div>
        <div className="card">
          <h3>📋 Leave Application</h3>
          <p>Apply for leave and track your leave requests</p>
        </div>
        
      </div>
    </div>
  );
};

export default TeacherHome;



