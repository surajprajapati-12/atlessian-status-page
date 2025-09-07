import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StatusPage from './pages/StatusPage';
import UptimePage from './pages/UptimePage';
import IncidentHistoryPage from './pages/IncidentHistoryPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/statuspage/uptime" element={<UptimePage />} />
        <Route path="/statuspage/incident-history" element={<IncidentHistoryPage />} />
      </Routes>
    </div>
  );
}

export default App;