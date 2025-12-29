import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

// Admin Components
import AdminHome from './admin/AdminHome';
import StudentsManagement from './admin/StudentsManagement';
import TeachersManagement from './admin/TeachersManagement';
import LeavesManagement from './admin/LeavesManagement';
import FeedbackManagement from './admin/FeedbackManagement';
import FeesManagement from './admin/FeesManagement';

const AdminDashboard = () => {
  return (
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="students" element={<StudentsManagement />} />
      <Route path="teachers" element={<TeachersManagement />} />
      <Route path="leaves" element={<LeavesManagement />} />
      <Route path="feedback" element={<FeedbackManagement />} />
      <Route path="fees" element={<FeesManagement />} />
    </Routes>
  );
};

export default AdminDashboard;



