import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentHome from './student/StudentHome';
import StudentProfile from './student/StudentProfile';
import StudentAttendance from './student/StudentAttendance';
import StudentMarks from './student/StudentMarks';
import StudentFees from './student/StudentFees';
import StudentFeedback from './student/StudentFeedback';

const StudentDashboard = () => {
  return (
    <Routes>
      <Route index element={<StudentHome />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="attendance" element={<StudentAttendance />} />
      <Route path="marks" element={<StudentMarks />} />
      <Route path="fees" element={<StudentFees />} />
      <Route path="feedback" element={<StudentFeedback />} />
    </Routes>
  );
};

export default StudentDashboard;



