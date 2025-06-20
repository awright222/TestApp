import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { CaseStudies, CaseStudyDetail } from './CaseStudies';
import SavedTests from './SavedTests';
import { useAuth } from './firebase/AuthContext';
import AuthModal from './components/AuthModal';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import SharedTests from './components/SharedTests';
import MyCreatedTests from './components/MyCreatedTests';
import CreateTest from './components/CreateTest';
import TestAnalytics from './components/TestAnalytics';
import Analytics from './components/Analytics';
// import TakeTest from './components/TakeTest';
import PracticeTestContainer from './components/PracticeTestContainer';
import SharedTestAccess from './components/SharedTestAccess';
import CrossDeviceDebug from './components/CrossDeviceDebug';
import SaveTestDebug from './components/SaveTestDebug';
import NoAuthDebug from './components/NoAuthDebug';
import Sidebar from './components/Sidebar';
import Debug from './components/Debug';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

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

  // Allow debug routes without authentication
  if (location.pathname.startsWith('/debug/no-auth')) {
    return (
      <Routes>
        <Route path="/debug/no-auth" element={<NoAuthDebug />} />
      </Routes>
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
      />

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
          <Route path="/shared-test/:testId" element={<SharedTestAccess />} />
          <Route path="/my-tests" element={<MyCreatedTests />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/test-analytics/:testId" element={<TestAnalytics />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/create-test/:testId" element={<CreateTest />} />
          <Route path="/custom-test/:testId" element={<PracticeTestContainer />} />
          {/* <Route path="/take-test/:shareId" element={<TakeTest />} /> */}
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
          {/* Debug route to clear localStorage if needed */}
          <Route path="/debug" element={<Debug />} />
          <Route path="/debug/cross-device" element={<CrossDeviceDebug />} />
          <Route path="/debug/save-test" element={<SaveTestDebug />} />
          <Route path="/debug/clear" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Debug Tools</h2>
              <button 
                onClick={() => {
                  localStorage.clear();
                  alert('localStorage cleared!');
                  window.location.href = '/';
                }}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Clear All Data
              </button>
            </div>
          } />
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
