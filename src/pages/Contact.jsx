import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <motion.div 
      className="contact-page glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="page-title">Get in Touch</h2>
      <div className="contact-card">
        <div className="contact-info">
          <h3>Suraj Gupta</h3>
          <p className="contact-role">Aspiring Data Scientist & Developer</p>
          
          <div className="contact-methods">
            <div className="contact-method">
              <span className="method-icon">📧</span>
              <a href="mailto:sg022529@gmail.com" className="method-link">sg022529@gmail.com</a>
            </div>
            <div className="contact-method">
              <span className="method-icon">🔗</span>
              <a href="https://www.linkedin.com/in/suraj6386/" target="_blank" rel="noopener noreferrer" className="method-link">linkedin.com/in/suraj6386/</a>
            </div>
          </div>
        </div>
        
        <div className="contact-message">
          <p>I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.</p>
          <div className="contact-links">
             <a href="https://www.linkedin.com/in/suraj6386/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Connect on LinkedIn</a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
