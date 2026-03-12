import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';


const StatCard = ({ icon, label, value, color = 'var(--primary-color)', subtitle, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const isNumeric = typeof value === 'number';
  const duration = 1200;
  const startTime = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isNumeric) return;
    startTime.current = null;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, isNumeric, delay]);

  return (
    <motion.div
      className="stat-card glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      whileHover={{ translateY: -4 }}
    >
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: color + '22', color }}>
          {icon}
        </div>
        <div className="stat-meta">
          <span className="stat-label">{label}</span>
          <span className="stat-value" style={{ color }}>
            {isNumeric ? displayValue.toLocaleString() : value}
          </span>
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;

