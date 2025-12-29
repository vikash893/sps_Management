import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  './image'
  // Gallery images - add your image filenames here
  const galleryImages = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg',
    'image5.jpg',
    'image6.jpg',
    'image7.jpg',
    'image8.jpg'
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Sristhi School Management System</h1>
          <p>A complete solution for managing students, teachers, and administrative tasks efficiently</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">Login to Dashboard</Link>
            <Link to="/about" className="btn btn-secondary">Learn About Features</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Everything You Need to Manage Your School</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍🎓</div>
              <h3>Student Management</h3>
              <p>Track student information, attendance, grades, and performance all in one place</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Teacher Portal</h3>
              <p>Teachers can manage classes, mark attendance, and submit grades easily</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Attendance System</h3>
              <p>Automated attendance tracking with real-time reports and notifications</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Parent Communication</h3>
              <p>Instant notifications to parents about attendance, events, and updates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Fee Management</h3>
              <p>Automated fee collection, receipts, and payment tracking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Report Cards</h3>
              <p>Generate and distribute digital report cards automatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* School Gallery Section */}
      <section className="gallery">
        <div className="container">
          <h2>Our School Gallery</h2>
          <p className="gallery-subtitle">A glimpse of life at Sristhi School</p>
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div className="gallery-item" key={index}>
                <img 
                  src={`./image/${image}`} 
                  alt={`School activity ${index + 1}`}
                  loading="lazy"
                />
                <div className="gallery-overlay">
                  <span>View Image</span>
                </div>
              </div>
            ))}
          </div>
          <div className="gallery-cta">
            <Link to="/gallery" className="btn btn-secondary">View Full Gallery</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

