import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { useAuth } from '../firebase/AuthContext';
import './Landing.css';

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
    <div className="landing-page">
      <div className="landing-content">
        {/* Header */}
        <header className="landing-header">
          <div className="landing-logo">
            <img 
              src="/nobglogomono.png" 
              alt="Formulate Logo" 
              className="landing-logo-image"
            />
            <span>Formulate</span>
          </div>
          
          <nav className="landing-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <button 
              className="sign-in-btn"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="hero-section">
          {/* Pending Test Access Banner */}
          {pendingTestAccess && (
            <div className="pending-access-banner">
              <div className="pending-access-icon">🔐</div>
              <h2 className="pending-access-title">Login Required</h2>
              <p className="pending-access-description">
                You're trying to access a test, but you need to be logged in for cross-device sync. 
                Sign in below to access your tests from any device!
              </p>
            </div>
          )}

          {/* Hero Content */}
          <h1 className="hero-title">
            Where Tests Take Shape
          </h1>
          
          <p className="hero-subtitle">
            {pendingTestAccess ? (
              "Access your test and sync your progress across all devices with a free account."
            ) : (
              "The ultimate platform for creating custom tests, managing classes, and tracking student progress. Join thousands of educators revolutionizing assessment with Formulate."
            )}
          </p>

          {/* Call to Action */}
          <div className="hero-cta">
            <button 
              className="cta-primary"
              onClick={() => setShowAuthModal(true)}
            >
              {pendingTestAccess ? '🚀 Sign In to Access Test' : 'Get Started Free'}
            </button>
            {!pendingTestAccess && (
              <button className="cta-secondary">
                Watch Demo
              </button>
            )}
          </div>

          {/* Features Grid */}
          <div className="features-section" id="features">
            <div className="feature-card">
              <span className="feature-icon floating">📝</span>
              <h3 className="feature-title">Smart Test Creation</h3>
              <p className="feature-description">
                Build comprehensive tests with multiple choice, hotspot questions, and interactive case studies. 
                Formulate's AI-powered suggestions help create better assessments.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon floating">👥</span>
              <h3 className="feature-title">Class Management</h3>
              <p className="feature-description">
                Organize students into classes, assign tests, and track progress. 
                Enrollment codes make joining classes effortless.
              </p>
            </div>
            
            <div className="feature-card">
              <span className="feature-icon floating">📊</span>
              <h3 className="feature-title">Advanced Analytics</h3>
              <p className="feature-description">
                Detailed performance insights, progress tracking, and exportable reports. 
                Identify learning gaps and measure improvement over time.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon floating">🌐</span>
              <h3 className="feature-title">Cross-Device Sync</h3>
              <p className="feature-description">
                Access your tests from anywhere, on any device. 
                Seamless synchronization keeps your work safe and accessible.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon floating">�</span>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Enterprise-grade security protects your data. 
                Role-based access ensures students only see what they should.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon floating">⚡</span>
              <h3 className="feature-title">Lightning Fast</h3>
              <p className="feature-description">
                Built for speed and reliability. 
                No more waiting - create, share, and take tests instantly.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Tests Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500K+</span>
              <span className="stat-label">Questions Answered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>

          {/* Testimonials */}
          <div className="testimonials-section">
            <h2 className="testimonials-title">What Educators Are Saying</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <p className="testimonial-quote">
                  "Formulate transformed how I assess my students. The analytics help me understand exactly where each student needs support."
                </p>
                <div className="testimonial-author">Sarah Johnson</div>
                <div className="testimonial-role">High School Biology Teacher</div>
              </div>
              
              <div className="testimonial-card">
                <p className="testimonial-quote">
                  "Creating and sharing tests has never been easier. My students love the interactive features and immediate feedback."
                </p>
                <div className="testimonial-author">Dr. Michael Chen</div>
                <div className="testimonial-role">University Professor</div>
              </div>
              
              <div className="testimonial-card">
                <p className="testimonial-quote">
                  "The class management features are incredible. I can track progress across all my courses from one dashboard."
                </p>
                <div className="testimonial-author">Emily Rodriguez</div>
                <div className="testimonial-role">Middle School Math Teacher</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2025 Formulate. Empowering education through innovative assessment tools.</p>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
