import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Tarot from './pages/Tarot';
import IChing from './pages/IChing';
import Navbar from './components/Navbar';
import Stats from './pages/Stats';
import { incrementPageView } from './services/api';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // 页面变化时增加访问统计
    incrementPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="App min-h-screen">
      {!isHome && <Navbar />}
      <main className={!isHome ? 'pt-16' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tarot" element={<Tarot />} />
          <Route path="/iching" element={<IChing />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 