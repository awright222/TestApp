import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';

export default function DevPanel() {
  const { user, userProfile, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const quickLogin = async (email, password, role) => {
    setLoading(true);
    try {
      if (user) {
        await logout();
        // Small delay to ensure logout completes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const result = await login(email, password);
      if (result.success) {
        console.log(`🚀 Dev Login: Switched to ${role}`);
        // Redirect based on role
        if (role === 'Admin') {
          window.location.href = '/organization-admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        alert(`Login failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Dev login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Dev Panel"
      >
        🔧
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            right: '10px',
            zIndex: 9998,
            background: 'white',
            border: '2px solid #ff6b6b',
            borderRadius: '8px',
            padding: '1rem',
            minWidth: '250px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #eee',
            paddingBottom: '0.5rem'
          }}>
            <h4 style={{ margin: 0, color: '#333' }}>🧪 Dev Panel</h4>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
              Current: {user ? user.email : 'Not logged in'}
            </p>
            {userProfile && (
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#888' }}>
                Role: <strong>{userProfile.accountType || 'None'}</strong>
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => quickLogin('admin@testapp.com', 'password123', 'Admin')}
              disabled={loading}
              style={{
                background: '#6f42c1',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '0.9rem'
              }}
            >
              👑 Login as Admin
            </button>

            <button 
              onClick={() => quickLogin('teacher@testapp.com', 'password123', 'Teacher')}
              disabled={loading}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '0.9rem'
              }}
            >
              👨‍🏫 Login as Teacher
            </button>
            
            <button 
              onClick={() => quickLogin('student@testapp.com', 'password123', 'Student')}
              disabled={loading}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '0.9rem'
              }}
            >
              🎓 Login as Student
            </button>

            {user && (
              <button 
                onClick={async () => {
                  await logout();
                  window.location.href = '/';
                }}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🚪 Logout
              </button>
            )}
          </div>

          {/* Quick Access Links - Only show when logged in */}
          {user && (
            <div style={{ 
              marginTop: '1rem', 
              paddingTop: '1rem',
              borderTop: '1px solid #eee'
            }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '0.9rem' }}>🚀 Quick Access</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Always show Admin Dashboard in dev mode */}
                <a 
                  href="/organization-admin"
                  style={{
                    background: '#6f42c1',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}
                >
                  👑 Admin Dashboard
                </a>

                {/* Teacher/Admin features */}
                {(userProfile?.accountType === 'teacher' || userProfile?.accountType === 'admin') && (
                  <>
                    <a 
                      href="/class-management"
                      style={{
                        background: '#28a745',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}
                    >
                      📚 Class Management
                    </a>
                    <a 
                      href="/student-directory"
                      style={{
                        background: '#17a2b8',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}
                    >
                      👥 Student Directory
                    </a>
                  </>
                )}

                {/* Student features */}
                {userProfile?.accountType === 'student' && (
                  <a 
                    href="/dashboard"
                    style={{
                      background: '#007bff',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      textAlign: 'center'
                    }}
                  >
                    🎯 My Dashboard
                  </a>
                )}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '1rem', 
            paddingTop: '0.5rem',
            borderTop: '1px solid #eee',
            fontSize: '0.8rem',
            color: '#999'
          }}>
            Dev mode only - will not appear in production
          </div>
        </div>
      )}
    </>
  );
}
