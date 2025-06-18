import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { CaseStudies, CaseStudyDetail } from './CaseStudies';
import Timer from "./Timer";
import SavedTests from './SavedTests';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from './firebase/AuthContext';
import AuthModal from './components/AuthModal';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import SharedTests from './components/SharedTests';
import MyCreatedTests from './components/MyCreatedTests';
import CreateTest from './components/CreateTest';
import PracticeTestContainer from './components/PracticeTestContainer';
import Sidebar from './components/Sidebar';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-spinner">🔄</div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <Landing />;
  }

  // Main authenticated app
  return (
    <div className="app-container">
      <Sidebar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        showTimer={showTimer}
        setShowTimer={setShowTimer}
      />

      {/* Timer Toggle Button (desktop only) */}
      {!showTimer && (
        <button
          className="timer-toggle-btn desktop"
          onClick={() => setShowTimer(true)}
        >
          <FontAwesomeIcon icon={faClock} />
        </button>
      )}
      {showTimer && (
        <Timer onClose={() => setShowTimer(false)} />
      )}

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                searchTerm={searchTerm} 
                onClearSearch={() => setSearchTerm('')} 
              />
            } 
          />
          <Route 
            path="/practice" 
            element={
              <PracticeTestContainer 
                searchTerm={searchTerm} 
                onClearSearch={() => setSearchTerm('')} 
              />
            } 
          />
          <Route path="/shared-tests" element={<SharedTests />} />
          <Route path="/my-tests" element={<MyCreatedTests />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
          <Route 
            path="/saved-tests" 
            element={
              <SavedTests 
                searchTerm={searchTerm} 
                onClearSearch={() => setSearchTerm('')} 
              />
            } 
          />
          <Route 
            path="/" 
            element={
              <Dashboard 
                searchTerm={searchTerm} 
                onClearSearch={() => setSearchTerm('')} 
              />
            } 
          />
        </Routes>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default App;
