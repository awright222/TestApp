import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import './Sidebar.css';

function Sidebar({ 
  searchTerm, 
  setSearchTerm, 
  mobileMenuOpen, 
  setMobileMenuOpen
}) {
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/practice', icon: '📝', label: 'Practice Tests' },
      { path: '/case-studies', icon: '📖', label: 'Case Studies' }
    ];

    if (!userProfile) return baseItems;

    if (userProfile.accountType === 'teacher') {
      return [
        ...baseItems,
        { path: '/my-tests', icon: '📚', label: 'My Created Tests' },
        { path: '/class-management', icon: '🎓', label: 'Class Management' },
        { path: '/analytics', icon: '📊', label: 'Analytics' },
        { path: '/create-test', icon: '✨', label: 'Create Test' },
        { path: '/shared-tests', icon: '📤', label: 'Shared Tests' },
        { path: '/saved-tests', icon: '💾', label: 'Practice Saves' }
      ];
    } else if (userProfile.accountType === 'student') {
      return [
        ...baseItems,
        { path: '/my-classes', icon: '🎓', label: 'My Classes' },
        { path: '/shared-tests', icon: '📤', label: 'Available Tests' },
        { path: '/saved-tests', icon: '💾', label: 'My Progress' }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

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
