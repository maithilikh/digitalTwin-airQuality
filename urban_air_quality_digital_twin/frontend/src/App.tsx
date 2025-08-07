import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
