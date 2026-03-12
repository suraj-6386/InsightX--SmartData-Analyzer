import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 20h20M4 20V10l6-6 4 4 6-7"/><circle cx="4" cy="20" r="1" fill="currentColor"/>
        <circle cx="10" cy="14" r="1" fill="currentColor"/><circle cx="14" cy="18" r="1" fill="currentColor"/>
        <circle cx="20" cy="7" r="1" fill="currentColor"/>
      </svg>
    ),
    badge: 'NEW',
  },
  {
    id: 'cleaning',
    label: 'Data Cleaning',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M8 6V4h8v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
        <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

const Sidebar = ({ activePage, setActivePage }) => {
  const { currentData } = useData();

  return (
    <aside className="sidebar-nav">
      <nav className="sidebar-menu">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <motion.button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.badge && !isActive && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
              {isActive && (
                <motion.div
                  className="sidebar-active-bar"
                  layoutId="activeBar"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="data-status">
          <div className={`status-dot ${currentData ? 'active' : 'idle'}`} />
          <span className="status-text">
            {currentData
              ? `${currentData.length.toLocaleString()} rows loaded`
              : 'No data loaded'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

