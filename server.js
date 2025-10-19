import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './../css/Contact.css';
import logo from './../assets/home/roastlogo.png';

const Contact = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const API_URL = process.env.NODE_ENV === 'production'
        ? 'https://roastcwaft.onrender.com/api/send-email'
        : 'http://localhost:5000/api/send-email';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email
          // Removed the message field since backend doesn't expect it
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ fullName: '', email: '' });
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(''), 5000);
    }
  };

  return (
    <div className="contact-container">
      <header className="header">
        <nav className="navbar">
          <div className="nav-left">
            <div className="nav-brand">
              <img
                src={logo}
                alt="Roast Cwaft"
                className="brand-logo"
              />
            </div>
          </div>

          <div className="nav-right">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="auth-buttons">
            <button className="btn-signin">Sign In</button>
            <button className="btn-join">Join Now</button>
          </div>

          <button className="menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>

        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-nav-links">
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/products" onClick={toggleMenu}>Products</Link></li>
            <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
            <li><Link to="/contact" onClick={toggleMenu}>Contact Us</Link></li>
            <li>
              <div className="mobile-auth-buttons">
                <button className="btn-signin">Sign In</button>
                <button className="btn-join">Join Now</button>
              </div>
            </li>
          </ul>
        </div>

        <section className="contact-hero-section">
          <div className="contact-hero-content"></div>
        </section>
      </header>

      <section className="contact-content-section">
        <div className="contact-content-container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2 className="contact-title">Stay Connected</h2>
              <p className="contact-description">
                Join our coffee community! Receive exclusive updates, new roast
                releases, and special offers straight to your inbox.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <h3 className="detail-label">Address</h3>
                  <p className="detail-text">2137 Daang Bukid, Baccor City, Philippines</p>
                </div>

                <div className="contact-item">
                  <h3 className="detail-label">Phone</h3>
                  <p className="detail-text">(143) 042-7206</p>
                  <p className="detail-text">+63923456789</p>
                </div>

                <div className="contact-item">
                  <h3 className="detail-label">Email</h3>
                  <p className="detail-text">roastcwaft@gmail.com</p>
                </div>

                <div className="contact-item">
                  <h3 className="detail-label">Follow Us</h3>
                  <p className="detail-text">@RoastCwaft</p>
                </div>
              </div>
            </div>

            <div className="contact-form">
              <h3 className="form-title">Receive Updates & News</h3>

              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  Thanks for joining our mailing list! Check your inbox for a welcome email.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  Oops! Something went wrong. Please try again later.
                </div>
              )}

              <form className="message-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;