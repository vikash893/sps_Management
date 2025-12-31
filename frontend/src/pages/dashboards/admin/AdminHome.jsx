import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Added missing import
import api from '../../../api/axios';
import '../Dashboard.css';
import '../Adminhome.css';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingLeaves: 0,
    pendingFeedback: 0,
    pendingFees: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Added missing hook

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type) => {
    switch(type) {
      case 'students':
        navigate('/admin/students');
        break;
      case 'teachers':
        navigate('/admin/teachers');
        break;
      case 'leaves':
        navigate('/admin/leaves');
        break;
      case 'feedback':
        navigate('/admin/feedback');
        break;
      case 'fees':
        navigate('/admin/fees');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-home">
      <h2>Admin Dashboard</h2>

      <div className="stats-grid">
        <div 
          className="stat-card clickable" // ✅ Added clickable class
          onClick={() => handleCardClick('students')}
          title="Click to view Students"
        >
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div 
          className="stat-card clickable" // ✅ Added clickable class
          onClick={() => handleCardClick('teachers')}
          title="Click to view Teachers"
        >
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>{stats.totalTeachers}</h3>
            <p>Total Teachers</p>
          </div>
        </div>

        <div 
          className="stat-card clickable" // ✅ Added clickable class
          onClick={() => handleCardClick('leaves')}
          title="Click to view Pending Leaves"
        >
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.pendingLeaves}</h3>
            <p>Pending Leaves</p>
          </div>
        </div>

        <div 
          className="stat-card clickable" // ✅ Added clickable class
          onClick={() => handleCardClick('feedback')}
          title="Click to view Pending Feedback"
        >
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <h3>{stats.pendingFeedback}</h3>
            <p>Pending Feedback</p>
          </div>
        </div>

        <div 
          className="stat-card clickable" // ✅ Added clickable class
          onClick={() => handleCardClick('fees')}
          title="Click to view Pending Fees"
        >
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{stats.pendingFees}</h3>
            <p>Pending Fees</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;