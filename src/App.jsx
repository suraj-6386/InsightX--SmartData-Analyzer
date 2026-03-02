import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import DataCleaningPage from './pages/DataCleaning';
import ReportsPage from './pages/Reports';
import AnalysisDashboard from './pages/AnalysisDashboard';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'cleaning':  return <DataCleaningPage />;
      case 'reports':   return <ReportsPage />;
      case 'analysis':  return <AnalysisDashboard />;
      default:          return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="app-shell">
        <Topbar activePage={activePage} setActivePage={setActivePage} />
        <div className="app-body">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="app-main">
            {renderPage()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}

export default App;