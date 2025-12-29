import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
        { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
        { path: '/admin/leaves', label: 'Leave Requests', icon: '📝' },
        { path: '/admin/feedback', label: 'Feedback', icon: '💬' },
        { path: '/admin/fees', label: 'Fees', icon: '💰' }
      ];
    } else if (role === 'teacher') {
      return [
        { path: '/teacher', label: 'Dashboard', icon: '📊' },
        { path: '/teacher/attendance', label: 'Attendance', icon: '✅' },
        { path: '/teacher/marks', label: 'Marks', icon: '📝' },
        { path: '/teacher/early-leave', label: 'Early Leave', icon: '🚪' },
        { path: '/teacher/leaves', label: 'My Leaves', icon: '📋' },
        { path : '/teacher/viewFee' , label : 'Student Fee' , icon: '💰'}
      ];
    } else if (role === 'student') {
      return [
        { path: '/student', label: 'Dashboard', icon: '📊' },
        { path: '/student/profile', label: 'Profile', icon: '👤' },
        { path: '/student/attendance', label: 'Attendance', icon: '✅' },
        { path: '/student/marks', label: 'Marks', icon: '📝' },
        { path: '/student/fees', label: 'Fees', icon: '💰' },
        { path: '/student/feedback', label: 'Feedback', icon: '💬' }
      ];
    }
    return [];
  };

  return (
    <div className="dashboard-layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🏫 School</h2>
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {getMenuItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.profile?.name || user?.username}</h1>
          <div className="user-info">
            <span className="role-badge">{role}</span>
          </div>
        </div>
        <div className="dashboard-main">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;



