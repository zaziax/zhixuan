import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tarot from './pages/Tarot';
import IChing from './pages/IChing';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App min-h-screen">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tarot" element={<Tarot />} />
            <Route path="/iching" element={<IChing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 