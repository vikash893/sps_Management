import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../Dashboard.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/student/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="loading">Profile not found</div>;
  }

  return (
    <div className="dashboard-section">
      <h2>My Profile</h2>
      <div className="card">
        {profile.photo && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src={profile.photo.startsWith('http') ? profile.photo : `http://localhost:5000${profile.photo}`}
              alt={profile.name}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #667eea'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="profile-info">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Class:</strong> {profile.class}</p>
          <p><strong>Section:</strong> {profile.section}</p>
          <p><strong>Date of Birth:</strong> {new Date(profile.dob).toLocaleDateString()}</p>
          {profile.fatherName && <p><strong>Father's Name:</strong> {profile.fatherName}</p>}
          <p><strong>Father's Mobile:</strong> {profile.fatherMobile}</p>
          {profile.motherName && <p><strong>Mother's Name:</strong> {profile.motherName}</p>}
          {profile.address && <p><strong>Address:</strong> {profile.address}</p>}
          {profile.userId && <p><strong>Username:</strong> {profile.userId.username}</p>}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

