import React from 'react';
import '../Dashboard.css';

const StudentHome = () => {
  return (
    <div className="dashboard-home">
      <h2>Student Dashboard</h2>
      <p>Welcome to your dashboard. View your attendance, marks, fees, and more.</p>
      <div className="cards-grid">
        <div className="card">
          <h3>👤 Profile</h3>
          <p>View and update your profile information</p>
        </div>
        <div className="card">
          <h3>✅ Attendance</h3>
          <p>Check your attendance records and statistics</p>
        </div>
        <div className="card">
          <h3>📝 Marks</h3>
          <p>View your marks and grades for all subjects</p>
        </div>
        <div className="card">
          <h3>💰 Fees</h3>
          <p>Check your fee status and payment history</p>
        </div>
        <div className="card">
          <h3>💬 Feedback</h3>
          <p>Submit feedback to teachers and admin</p>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;



