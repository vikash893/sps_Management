import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>
              Have questions or need support? We're here to help!
            </p>
            <div className="contact-details">
              <div className="contact-item">
                <strong>📧 Email:</strong>
                <p>support@schoolmanagement.com</p>
              </div>
              <div className="contact-item">
                <strong>📞 Phone:</strong>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="contact-item">
                <strong>📍 Address:</strong>
                <p>123 Education Street<br />Learning City, LC 12345</p>
              </div>
            </div>
          </div>
          <div className="contact-form">
            <h2>Send us a Message</h2>
            <form>
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="your.email@example.com" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="Your message"></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;



