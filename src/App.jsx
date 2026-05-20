import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PhishingDetector from './pages/tools/PhishingDetector';
import URLScanner from './pages/tools/URLScanner';
import PasswordAnalyzer from './pages/tools/PasswordAnalyzer';
import ChatBot from './pages/tools/ChatBot';
import CyberRiskScore from './pages/tools/CyberRiskScore';
import FloatingAssistant from './components/FloatingAssistant';
import NetworkBackground from './components/NetworkBackground';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen" style={{ background: '#020408' }}>
        <NetworkBackground />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools/phishing" element={<PhishingDetector />} />
          <Route path="/tools/url-scanner" element={<URLScanner />} />
          <Route path="/tools/password" element={<PasswordAnalyzer />} />
          <Route path="/tools/chatbot" element={<ChatBot />} />
          <Route path="/tools/risk-score" element={<CyberRiskScore />} />
        </Routes>
        <FloatingAssistant isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
      </div>
    </HashRouter>
  );
}

export default App;
