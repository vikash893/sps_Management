import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherHome from './teacher/TeacherHome';
import AttendanceManagement from './teacher/AttendanceManagement';
import MarksManagement from './teacher/MarksManagement';
import EarlyLeaveManagement from './teacher/EarlyLeaveManagement';
import LeavesManagement from './teacher/LeavesManagement';
import TeacherFeesView from './teacher/TeacherFeesView';

const TeacherDashboard = () => {
  return (
    <Routes>
      <Route index element={<TeacherHome />} />
      <Route path="attendance" element={<AttendanceManagement />} />
      <Route path="marks" element={<MarksManagement />} />
      <Route path="early-leave" element={<EarlyLeaveManagement />} />
      <Route path="leaves" element={<LeavesManagement />} />
      <Route path="viewFee" element={<TeacherFeesView />} />
    </Routes>
  );
};

export default TeacherDashboard;



