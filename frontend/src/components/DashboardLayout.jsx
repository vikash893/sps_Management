import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleNavItemClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
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
        { path : '/teacher/viewFee' , label : 'Student Fee' , icon: '💰'},
        { path : '/teacher/student-management', label : 'student management' , icon:'👨‍🏫'}
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

  const sidebarClasses = `sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`;

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      <div 
        className={`overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />
      
      <aside className={sidebarClasses}>
        <div className="sidebar-header">
          <h2>🏫 School</h2>
          <button 
            className="toggle-btn"
            onClick={toggleSidebar}
          >
            {isMobile ? (mobileMenuOpen ? '✕' : '▶') : (sidebarOpen ? '◀' : '▶')}
          </button>
        </div>
        <nav className="sidebar-nav">
          {getMenuItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={handleNavItemClick}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span>
            {(sidebarOpen || mobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
      
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-content">
            {isMobile && (
              <button 
                className="mobile-menu-toggle" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <span>{mobileMenuOpen ? '✕' : '☰'}</span>
              </button>
            )}
            <h1>Welcome, {user?.profile?.name || user?.username}</h1>
            <div className="user-info">
              <span className="role-badge">{role}</span>
            </div>
          </div>
        </header>
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;