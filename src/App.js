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
import TestLibrary from './components/TestLibrary';
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
import PracticeTestContainerDirect from './components/PracticeTestContainerDirect';
import Debug from './components/Debug';  
import RoleSelection from './components/RoleSelection';
import ClassManagement from './components/ClassManagement';
import StudentDirectory from './components/StudentDirectory';
import TeacherDirectory from './components/TeacherDirectory';
import OrganizationAdmin from './components/OrganizationAdmin';
import StudentClasses from './components/StudentClasses';
import DevPanel from './components/DevPanel';
import ProfileSettings from './components/ProfileSettings';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  const { user, userProfile, loading } = useAuth();

  // Check if user needs role selection
  const needsRoleSelection = user && userProfile && userProfile.isNewUser && !userProfile.accountType;
  
  // Debug logging
  console.log('App.js - Auth State:', {
    user: !!user,
    userProfile: !!userProfile,
    isNewUser: userProfile?.isNewUser,
    accountType: userProfile?.accountType,
    needsRoleSelection
  });

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
    return (
      <div>
        <Landing />
        <DevPanel />
      </div>
    );
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
            path="/test-library" 
            element={
              <TestLibrary 
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
          <Route 
            path="/practice-test/:testId" 
            element={<PracticeTestContainer />} 
          />
          <Route path="/shared-tests" element={<SharedTests />} />
          <Route path="/shared-test/:testId" element={<SharedTestAccess />} />
          <Route path="/my-tests" element={<MyCreatedTests />} />
          <Route path="/class-management" element={<ClassManagement />} />
          <Route path="/student-directory" element={<StudentDirectory />} />
          <Route path="/teacher-directory" element={<TeacherDirectory />} />
          <Route path="/organization-admin" element={<OrganizationAdmin />} />
          <Route path="/my-classes" element={<StudentClasses />} />
          <Route 
            path="/my-progress" 
            element={
              <SavedTests 
                searchTerm={searchTerm} 
                onClearSearch={() => setSearchTerm('')}
              />
            } 
          />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/test-analytics/:testId" element={<TestAnalytics />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/create-test/:testId" element={<CreateTest />} />
          <Route path="/custom-test/:testId" element={<PracticeTestContainer />} />
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
          <Route path="/debug" element={<Debug />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
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

      {/* Role Selection Modal for new users */}
      <RoleSelection
        isOpen={needsRoleSelection}
        onComplete={() => {
          // Role selection completed, the userProfile will update automatically
          window.location.reload(); // Simple refresh to update the UI
        }}
      />

      {/* Dev Panel - only shows in development */}
      <DevPanel />
    </div>
  );
}

export default App;
