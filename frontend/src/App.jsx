import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PaymentPage from './pages/PaymentPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pay/:serviceId" element={<PaymentPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
