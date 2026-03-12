import React from 'react';
import { motion } from 'framer-motion';

const PrivacyTerms = () => {
  return (
    <motion.div 
      className="legal-page glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="page-title">Privacy Policy & Terms of Service</h2>
      <div className="legal-content">
        <section>
          <h3>1. Data Privacy</h3>
          <p>InsightX Pro processes all data locally in your browser. We do not upload your datasets to any external servers. Your data stays under your control at all times.</p>
        </section>
        <section>
          <h3>2. Usage Terms</h3>
          <p>This tool is provided for data analysis and cleaning purposes. Users are responsible for the data they upload and the transformations they apply.</p>
        </section>
        <section>
          <h3>3. Accuracy</h3>
          <p>While we strive for the highest accuracy in calculations and cleaning operations, users should verify critical results before making business decisions.</p>
        </section>
        <section>
          <h3>4. Contact</h3>
          <p>For any questions regarding these terms, please use the Contact page to reach out to the developer.</p>
        </section>
      </div>
    </motion.div>
  );
};

export default PrivacyTerms;
