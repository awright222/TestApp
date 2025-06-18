import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { useAuth } from '../firebase/AuthContext';
import './Sidebar.css';

function Sidebar({ 
  searchTerm, 
  setSearchTerm, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  showTimer, 
  setShowTimer 
}) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/practice', icon: '📝', label: 'Practice Test' },
    { path: '/shared-tests', icon: '📤', label: 'Shared Tests' },
    { path: '/my-tests', icon: '📚', label: 'My Created Tests' },
    { path: '/create-test', icon: '✨', label: 'Create Test' },
    { path: '/case-studies', icon: '📚', label: 'Case Studies' },
    { path: '/saved-tests', icon: '💾', label: 'Saved Tests' }
  ];

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(open => !open)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        <span className="hamburger-icon">{mobileMenuOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-dropdown-menu${mobileMenuOpen ? " open" : ""}`}>
        <div className="mobile-menu-content">
          <nav>
            <ul>
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    {item.icon} {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  className="timer-toggle-btn mobile"
                  onClick={() => {
                    setShowTimer(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faClock} /> Timer
                </button>
              </li>
              <li className="mobile-auth-section">
                <div>
                  <div className="welcome-text">
                    Welcome, {user.displayName || user.email}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="sign-out-btn mobile"
                  >
                    Sign Out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}>
              Clear
            </button>
          )}
        </div>
        
        <ul className="sidebar-nav">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Auth Section */}
        <div className="sidebar-auth">
          <div>
            <div className="welcome-text">
              Welcome, {user.displayName || user.email}
            </div>
            <div className="sync-status">
              <span className="sync-indicator">☁️ Tests synced across devices</span>
            </div>
            <button onClick={logout} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
