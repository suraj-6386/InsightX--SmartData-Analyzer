import React from 'react';

const Footer = ({ setActivePage }) => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section brand-section">
          <div className="footer-brand">
            <span className="brand-dot"></span>
            <span className="footer-brand-name">InsightX<span className="footer-brand-pro">Pro</span></span>
          </div>
          <p className="footer-tagline">Advanced Data Analytics & Data Cleaning Platform for Modern Specialists.</p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Product</h4>
          <ul className="footer-nav">
            <li><button onClick={() => setActivePage('dashboard')} className="footer-link-btn">Dashboard</button></li>
            <li><button onClick={() => setActivePage('cleaning')} className="footer-link-btn">Data Cleaning</button></li>
            <li><button onClick={() => setActivePage('analysis')} className="footer-link-btn">Deep Analysis</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-nav">
            <li><button onClick={() => setActivePage('privacy')} className="footer-link-btn">Privacy Policy</button></li>
            <li><button onClick={() => setActivePage('privacy')} className="footer-link-btn">Terms of Service</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-nav">
            <li><button onClick={() => setActivePage('contact')} className="footer-link-btn">Contact Me</button></li>
            <li><a href="https://www.linkedin.com/in/suraj6386/" target="_blank" rel="noopener noreferrer" className="footer-link-btn">LinkedIn</a></li>
            <li><a href="mailto:sg022529@gmail.com" className="footer-link-btn">Email Support</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          © 2026 InsightX Pro. Crafted with ❤️ by Suraj Gupta.
        </div>
        <div className="footer-social-mini">
           {/* Placeholder for icons if needed */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
