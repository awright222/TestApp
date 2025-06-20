import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // For signup, validate role selection
    if (!isLogin && !selectedRole) {
      setError('Please select whether you are a teacher or student');
      setLoading(false);
      return;
    }

    const result = isLogin 
      ? await login(email, password)
      : await register(email, password, displayName, selectedRole);

    if (result.success) {
      onClose();
      setEmail('');
      setPassword('');
      setDisplayName('');
      setSelectedRole('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    const result = await loginWithGoogle();
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setSelectedRole('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>&times;</button>
        
        <h3 style={{ marginTop: 0, color: '#003049' }}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </h3>

        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: '0.75rem', 
            borderRadius: '6px', 
            marginBottom: '1rem',
            border: '1px solid #ef5350'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#003049' }}>
                Display Name:
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #669BBC',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  color: '#003049',
                  backgroundColor: '#FDF0D5',
                  boxSizing: 'border-box'
                }}
                placeholder="Your name"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#003049' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #669BBC',
                borderRadius: '6px',
                fontSize: '1rem',
                color: '#003049',
                backgroundColor: '#FDF0D5',
                boxSizing: 'border-box'
              }}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#003049' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #669BBC',
                borderRadius: '6px',
                fontSize: '1rem',
                color: '#003049',
                backgroundColor: '#FDF0D5',
                boxSizing: 'border-box'
              }}
              placeholder="Password"
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: '#003049', fontSize: '1.1rem' }}>
                I am a:
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: selectedRole === 'teacher' ? '3px solid #780000' : '2px solid #669BBC',
                    borderRadius: '8px',
                    backgroundColor: selectedRole === 'teacher' ? '#FDF0D5' : '#FFFFFF',
                    color: '#003049',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: selectedRole === 'teacher' ? 'bold' : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👨‍🏫</div>
                  <div style={{ fontWeight: 'bold' }}>Teacher</div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    Create tests, manage classes
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: selectedRole === 'student' ? '3px solid #780000' : '2px solid #669BBC',
                    borderRadius: '8px',
                    backgroundColor: selectedRole === 'student' ? '#FDF0D5' : '#FFFFFF',
                    color: '#003049',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: selectedRole === 'student' ? 'bold' : 'normal',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎓</div>
                  <div style={{ fontWeight: 'bold' }}>Student</div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    Take tests, track progress
                  </div>
                </button>
              </div>
            </div>
          )}

          {!isLogin && selectedRole && (
            <div style={{
              background: selectedRole === 'teacher' ? '#fff3e0' : '#e8f5e8',
              border: `1px solid ${selectedRole === 'teacher' ? '#ffcc80' : '#a5d6a7'}`,
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#003049'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {selectedRole === 'teacher' ? '🚀 Teacher Features:' : '🎯 Student Features:'}
              </div>
              {selectedRole === 'teacher' ? (
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  <li>Create unlimited tests (3 free, then $12/month)</li>
                  <li>Advanced analytics and reporting</li>
                  <li>Class management tools</li>
                </ul>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  <li>Take unlimited tests for free</li>
                  <li>Track your progress and results</li>
                  <li>Join classes and groups</li>
                </ul>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: loading ? '#ccc' : '#780000',
                color: '#FDF0D5',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: '#4285f4',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Please wait...' : 'Continue with Google'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setSelectedRole('');
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#669BBC',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
