import React, { useState } from 'react';
import AuthModal from './AuthModal';

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

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
          Create, share, and take practice tests with ease. Perfect for students, teachers, and professionals 
          who want to build custom assessments and track progress over time.
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
            boxShadow: '0 4px 12px rgba(102, 155, 188, 0.3)'
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
          Get Started - Sign In or Sign Up
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
