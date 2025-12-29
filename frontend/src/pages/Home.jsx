import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {

  // Images must exist in: frontend/public/image/
  const galleryImages = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg',
    'image5.jpg',
    'image6.jpg',
    'image7.png'
  ];

  return (
    <div className="home">

      {/* ================= HERO SECTION ================= */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Sristhi School Management System</h1>
          <p>
            A complete solution for managing students, teachers,
            attendance, fees, and school administration efficiently.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">
              Login to Dashboard
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Learn About Features
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="features">
        <div className="container">
          <h2>Everything You Need to Manage Your School</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍🎓</div>
              <h3>Student Management</h3>
              <p>
                Manage student profiles, attendance, grades, and performance
                from one centralized system.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>Teacher Portal</h3>
              <p>
                Teachers can mark attendance, upload marks, and manage classes
                easily.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Attendance System</h3>
              <p>
                Accurate attendance tracking with real-time updates and reports.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Parent Communication</h3>
              <p>
                Instant SMS or WhatsApp notifications for parents regarding
                updates and attendance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Fee Management</h3>
              <p>
                Track fees, payment history, pending dues, and generate receipts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Report Cards</h3>
              <p>
                Generate digital report cards and academic performance reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GALLERY SECTION ================= */}
      {/* <section className="gallery">
        <div className="container">
          <h2>Our School Gallery</h2>
          <p className="gallery-subtitle">
            A glimpse of life and activities at Sristhi School
          </p>

          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div className="gallery-item" key={index}>
                <img
                  src={`/image/${image}`}
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
            <Link to="/gallery" className="btn btn-secondary">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section> */}

    </div>
  );
};

export default Home;
