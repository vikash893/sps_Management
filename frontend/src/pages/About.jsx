import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <div className="about-container">
        <h1>About School Management System</h1>
        <div className="about-content">
          <section>
            <h2>Our Mission</h2>
            <p>
              To provide a comprehensive, user-friendly platform that streamlines 
              school operations and enhances communication between administrators, 
              teachers, students, and parents.
            </p>
          </section>
          <section>
            <h2>What We Offer</h2>
            <ul>
              <li>Complete student and teacher management</li>
              <li>Real-time attendance tracking</li>
              <li>Grade and marks management</li>
              <li>Fee tracking and updates</li>
              <li>Leave management system</li>
              <li>Feedback and communication tools</li>
              {/* <li>Parent notifications via SMS/WhatsApp</li> */}
            </ul>
          </section>
          <section>
            <h2>Technology Stack</h2>
            <p>
              Built with modern technologies including MongoDB, Express, React, 
              and Node.js (MERN stack) to ensure scalability, security, and 
              excellent user experience.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;



