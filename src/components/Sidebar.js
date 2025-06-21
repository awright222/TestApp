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
      { path: '/test-library', icon: '�', label: 'Test Library' }
    ];

    if (!userProfile) return baseItems;

    if (userProfile.accountType === 'teacher') {
      return [
        ...baseItems,
        { path: '/my-tests', icon: '✨', label: 'My Tests' },
        { path: '/class-management', icon: '🎓', label: 'Classes' },
        { path: '/analytics', icon: '📊', label: 'Analytics' },
        { path: '/saved-tests', icon: '📈', label: 'Practice Progress' }
      ];
    } else if (userProfile.accountType === 'student') {
      return [
        ...baseItems,
        { path: '/my-classes', icon: '🎓', label: 'My Classes' },
        { path: '/my-progress', icon: '�', label: 'My Progress' }
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
                  <Link
                    to="/profile-settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="profile-settings-link mobile"
                  >
                    👤 Profile Settings
                  </Link>
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
            <div className="profile-avatar-section">
              <Link to="/profile-settings" className="profile-avatar-link">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="sidebar-avatar" />
                ) : (
                  <div className="sidebar-default-avatar">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'}
                  </div>
                )}
                <span className="profile-settings-text">Profile Settings</span>
              </Link>
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
