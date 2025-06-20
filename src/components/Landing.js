import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { useAuth } from '../firebase/AuthContext';

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user was trying to access a specific test
  const pendingTestAccess = location.pathname.includes('/custom-test/') || sessionStorage.getItem('pendingTestAccess');
  const testId = pendingTestAccess 
    ? (location.pathname.includes('/custom-test/') 
        ? location.pathname.split('/custom-test/')[1] 
        : sessionStorage.getItem('pendingTestAccess'))
    : null;
  
  // If user logs in and there was a pending test, redirect to it
  useEffect(() => {
    if (user && pendingTestAccess && testId) {
      console.log('Redirecting to pending test after login:', testId);
      // Clear the pending access from sessionStorage
      sessionStorage.removeItem('pendingTestAccess');
      navigate(`/custom-test/${testId}`);
    }
  }, [user, pendingTestAccess, testId, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #003049 0%, #00243a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      {/* Main Content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        color: '#FDF0D5'
      }}>
        {/* App Title */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#FDF0D5'
        }}>
          Test Builder
        </h1>
        
        {/* App Description */}
        <p style={{
          fontSize: '1.2rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          color: '#bfc9d1'
        }}>
          {pendingTestAccess ? (
            <>
              🔐 <strong>Login Required</strong><br />
              You're trying to access a test, but you need to be logged in for cross-device sync. 
              Sign in below to access your tests from any device!
            </>
          ) : (
            <>
              Create, share, and take practice tests with ease. Perfect for students, teachers, and professionals 
              who want to build custom assessments and track progress over time.
            </>
          )}
        </p>

        {/* Features List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'rgba(102, 155, 188, 0.1)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(102, 155, 188, 0.3)'
          }}>
            <h3 style={{ color: '#669BBC', marginBottom: '0.5rem' }}>📝 Create Tests</h3>
            <p style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>Build custom tests with multiple choice, hotspot, and case study questions</p>
          </div>
          
          <div style={{
            background: 'rgba(102, 155, 188, 0.1)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(102, 155, 188, 0.3)'
          }}>
            <h3 style={{ color: '#669BBC', marginBottom: '0.5rem' }}>🚀 Share & Collaborate</h3>
            <p style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>Share tests with students or colleagues and track their progress</p>
          </div>
          
          <div style={{
            background: 'rgba(102, 155, 188, 0.1)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(102, 155, 188, 0.3)'
          }}>
            <h3 style={{ color: '#669BBC', marginBottom: '0.5rem' }}>📊 Track Progress</h3>
            <p style={{ color: '#bfc9d1', fontSize: '0.9rem' }}>Monitor performance with detailed analytics and progress tracking</p>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            background: '#669BBC',
            border: 'none',
            color: '#FDF0D5',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(102, 155, 188, 0.3)',
            marginBottom: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#577a9e';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#669BBC';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {pendingTestAccess ? '🚀 Sign In to Access Your Test' : 'Get Started - Sign In or Sign Up'}
        </button>

        {/* Footer */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#8a9ba8'
        }}>
          Join thousands of users creating and sharing tests worldwide
        </p>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
