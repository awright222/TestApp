import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import './ProfileSettings.css';

function ProfileSettings() {
  const { user, userProfile, refreshUserProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    photoURL: '',
    // Test preferences
    defaultTimerMinutes: 90,
    autoStartTimer: false,
    showExplanationsImmediately: false,
    defaultDifficulty: 'Intermediate',
    preferredQuestionTypes: [],
    // Interface preferences
    theme: 'light',
    fontSize: 'medium',
    colorTheme: 'blue',
    timerPosition: 'floating',
    viewMode: 'detailed',
    // Privacy and notifications
    emailNotifications: true,
    progressTracking: true,
    publicProfile: false,
    showEmail: false,
    allowMessages: true,
    testSharingEnabled: true
  });

  useEffect(() => {
    if (user && userProfile) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        defaultTimerMinutes: userProfile.defaultTimerMinutes || 90,
        autoStartTimer: userProfile.autoStartTimer || false,
        showExplanationsImmediately: userProfile.showExplanationsImmediately || false,
        defaultDifficulty: userProfile.defaultDifficulty || 'Intermediate',
        preferredQuestionTypes: userProfile.preferredQuestionTypes || [],
        theme: userProfile.theme || 'light',
        fontSize: userProfile.fontSize || 'medium',
        colorTheme: userProfile.colorTheme || 'blue',
        timerPosition: userProfile.timerPosition || 'floating',
        viewMode: userProfile.viewMode || 'detailed',
        emailNotifications: userProfile.emailNotifications !== false,
        progressTracking: userProfile.progressTracking !== false,
        publicProfile: userProfile.publicProfile || false,
        showEmail: userProfile.showEmail || false,
        allowMessages: userProfile.allowMessages !== false,
        testSharingEnabled: userProfile.testSharingEnabled !== false
      }));
    }
  }, [user, userProfile]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    console.log('Starting photo upload for user:', user?.uid);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    setUploadingPhoto(true);
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload to Firebase Storage
      const fileName = `${user.uid}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `profile-photos/${user.uid}/${fileName}`);
      
      console.log('Uploading to:', storageRef.fullPath);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Upload successful, URL:', downloadURL);
      
      // Update profile data
      setProfileData(prev => ({
        ...prev,
        photoURL: downloadURL
      }));
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        alert('Upload failed: You do not have permission to upload files. Please check Firebase Storage rules.');
      } else if (error.code === 'storage/cors-error') {
        alert('Upload failed: CORS error. Please check Firebase Storage configuration.');
      } else if (error.message.includes('CORS')) {
        alert('Upload failed: CORS policy error. Please configure Firebase Storage rules or try again later.');
      } else {
        alert(`Failed to upload photo: ${error.message}`);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        preferences: {
          defaultTimerMinutes: profileData.defaultTimerMinutes,
          autoStartTimer: profileData.autoStartTimer,
          showExplanationsImmediately: profileData.showExplanationsImmediately,
          defaultDifficulty: profileData.defaultDifficulty,
          preferredQuestionTypes: profileData.preferredQuestionTypes,
          theme: profileData.theme,
          fontSize: profileData.fontSize,
          colorTheme: profileData.colorTheme,
          timerPosition: profileData.timerPosition,
          viewMode: profileData.viewMode,
          emailNotifications: profileData.emailNotifications,
          progressTracking: profileData.progressTracking,
          publicProfile: profileData.publicProfile,
          showEmail: profileData.showEmail,
          allowMessages: profileData.allowMessages,
          testSharingEnabled: profileData.testSharingEnabled
        },
        updatedAt: new Date()
      });

      // Refresh user profile in context
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while authentication is loading
  if (authLoading) {
    return (
      <div className="profile-settings">
        <div className="settings-header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="profile-settings">
        <div className="settings-header">
          <h1>Please Log In</h1>
          <p>You need to be logged in to access profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      <div className="settings-header">
        <h1>Profile Settings</h1>
        <p>Customize your profile and display preferences</p>
      </div>

      <div className="settings-content">
        {/* Profile Information Section */}
        <div className="settings-section">
          <h2>👤 Profile Information</h2>
          
          <div className="photo-upload-section">
            <div className="current-photo">
              {profileData.photoURL ? (
                <img src={profileData.photoURL} alt="Profile" className="profile-photo" />
              ) : (
                <div className="default-avatar">
                  {profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : '👤'}
                </div>
              )}
            </div>
            
            <div className="photo-upload-controls">
              {/* Temporarily disabled photo upload */}
              <div className="upload-btn disabled">
                📷 Photo Upload (Coming Soon)
              </div>
              <p className="upload-hint">Profile photo feature temporarily disabled</p>
              {/* 
              <label className="upload-btn">
                {uploadingPhoto ? '📤 Uploading...' : '📷 Upload Avatar'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="upload-hint">Max 5MB • JPG, PNG, GIF</p>
              */}
            </div>
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-website.com"
              />
            </div>
          </div>
        </div>

        {/* Test Preferences Section */}
        <div className="settings-section">
          <h2>⚙️ Test Preferences</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Default Timer Duration</label>
              <select
                value={profileData.defaultTimerMinutes}
                onChange={(e) => handleInputChange('defaultTimerMinutes', parseInt(e.target.value))}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
            <div className="form-group">
              <label>Default Difficulty</label>
              <select
                value={profileData.defaultDifficulty}
                onChange={(e) => handleInputChange('defaultDifficulty', e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.autoStartTimer}
                onChange={(e) => handleInputChange('autoStartTimer', e.target.checked)}
              />
              Auto-start timer when beginning tests
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.showExplanationsImmediately}
                onChange={(e) => handleInputChange('showExplanationsImmediately', e.target.checked)}
              />
              Show explanations immediately after each question
            </label>
          </div>

          <div className="form-group">
            <label>Preferred Question Types</label>
            <div className="question-types-grid">
              {['Multiple Choice', 'Essay', 'Short Answer', 'Drag and Drop', 'Hotspot', 'True/False'].map(type => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profileData.preferredQuestionTypes.includes(type)}
                    onChange={(e) => {
                      const types = [...profileData.preferredQuestionTypes];
                      if (e.target.checked) {
                        types.push(type);
                      } else {
                        const index = types.indexOf(type);
                        if (index > -1) types.splice(index, 1);
                      }
                      handleInputChange('preferredQuestionTypes', types);
                    }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Interface & Display Section */}
        <div className="settings-section">
          <h2>🎨 Interface & Display</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Theme</label>
              <select
                value={profileData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (system)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Font Size</label>
              <select
                value={profileData.fontSize}
                onChange={(e) => handleInputChange('fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color Theme</label>
              <select
                value={profileData.colorTheme}
                onChange={(e) => handleInputChange('colorTheme', e.target.value)}
              >
                <option value="blue">Ocean Blue</option>
                <option value="green">Forest Green</option>
                <option value="purple">Royal Purple</option>
                <option value="orange">Sunset Orange</option>
                <option value="red">Cherry Red</option>
                <option value="teal">Teal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Timer Position</label>
              <select
                value={profileData.timerPosition}
                onChange={(e) => handleInputChange('timerPosition', e.target.value)}
              >
                <option value="floating">Floating (draggable)</option>
                <option value="fixed">Fixed (top right)</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>View Mode</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="compact"
                  checked={profileData.viewMode === 'compact'}
                  onChange={(e) => handleInputChange('viewMode', e.target.value)}
                />
                Compact - More questions per page
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="detailed"
                  checked={profileData.viewMode === 'detailed'}
                  onChange={(e) => handleInputChange('viewMode', e.target.value)}
                />
                Detailed - Full explanations and feedback
              </label>
            </div>
          </div>

          <div className="color-preview">
            <h3>Preview</h3>
            <div className={`preview-card theme-${profileData.colorTheme} font-${profileData.fontSize}`}>
              <div className="preview-header">Sample Header</div>
              <div className="preview-content">
                This is how your chosen color theme and font size will look in the app.
              </div>
              <div className="preview-button">Sample Button</div>
            </div>
          </div>
        </div>

        {/* Privacy & Notifications Section */}
        <div className="settings-section">
          <h2>� Privacy & Notifications</h2>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              />
              Email notifications for shared tests and updates
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.progressTracking}
                onChange={(e) => handleInputChange('progressTracking', e.target.checked)}
              />
              Track my progress and provide insights
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.publicProfile}
                onChange={(e) => handleInputChange('publicProfile', e.target.checked)}
              />
              Make my profile public (others can view your profile and test results)
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.showEmail}
                onChange={(e) => handleInputChange('showEmail', e.target.checked)}
              />
              Show my email address on my public profile
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.allowMessages}
                onChange={(e) => handleInputChange('allowMessages', e.target.checked)}
              />
              Allow other users to send me messages
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profileData.testSharingEnabled}
                onChange={(e) => handleInputChange('testSharingEnabled', e.target.checked)}
              />
              Allow others to share tests with me
            </label>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="settings-section">
          <h2>📧 Account Information</h2>
          
          <div className="account-info">
            <div className="info-item">
              <label>Email Address</label>
              <div className="info-value">{user?.email}</div>
            </div>
            
            <div className="info-item">
              <label>Account Created</label>
              <div className="info-value">
                {user?.metadata?.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 
                  'Unknown'
                }
              </div>
            </div>
            
            <div className="info-item">
              <label>Last Sign In</label>
              <div className="info-value">
                {user?.metadata?.lastSignInTime ? 
                  new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                  'Unknown'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button 
            className="save-btn"
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? '💾 Saving...' : '💾 Save Profile'}
          </button>
          
          {saveSuccess && (
            <div className="save-success">
              ✅ Profile saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
