import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import Translate from './pages/Translate';
import Learn from './pages/Learn';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <main className="flex-1 text-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/learn" element={<Learn />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
