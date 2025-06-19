import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { ShareService } from '../services/ShareService';
import './ShareTest.css';

function ShareTest({ test, onClose }) {
  const { user } = useAuth();
  const [shareCode, setShareCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isPublic, setIsPublic] = useState(test?.settings?.isPublic || false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(test?.settings?.maxAttempts || 0);
  const [emailList, setEmailList] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  // Generate share code on mount and check if already shared
  useEffect(() => {
    if (test && user) {
      loadSharedTestData();
    }
  }, [test, user]);

  const loadSharedTestData = async () => {
    try {
      // Check if test is already shared
      const existingShare = await ShareService.getSharedTest(test.id);
      
      if (existingShare) {
        setIsShared(true);
        setShareCode(existingShare.shareCode);
        setIsPublic(existingShare.isPublic);
        setMaxAttempts(existingShare.maxAttempts || 0);
        
        if (existingShare.deadline) {
          setHasDeadline(true);
          setDeadline(existingShare.deadline.slice(0, 16)); // Format for datetime-local
        }
        
        const url = `${window.location.origin}/shared-test/${test.id}?code=${existingShare.shareCode}`;
        setShareUrl(url);
        generateQRCode(url);
        
        // Load analytics
        loadAnalytics();
      } else {
        // Generate new share data
        const code = ShareService.generateShareCode();
        setShareCode(code);
        const url = `${window.location.origin}/shared-test/${test.id}?code=${code}`;
        setShareUrl(url);
        generateQRCode(url);
      }
    } catch (error) {
      console.error('Error loading shared test data:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await ShareService.getTestAnalytics(test.id, user.uid);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const generateQRCode = async (url) => {
    setIsGeneratingQR(true);
    try {
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  const handleSendInvitations = async () => {
    if (!emailList.trim()) {
      alert('Please enter at least one email address');
      return;
    }

    const emails = emailList.split(/[,\n]/).map(email => email.trim()).filter(email => email);
    
    try {
      const result = await ShareService.sendEmailInvitations(
        emails, 
        shareUrl, 
        customMessage || `You've been invited to take the practice test: "${test.title}". Click the link below to get started!`,
        test.title
      );
      
      alert(result.message || `Invitations sent to ${emails.length} recipients!`);
      setEmailList('');
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Failed to send invitations. Please try again.');
    }
  };

  const handleSaveSettings = async () => {
    if (!user) {
      alert('You must be logged in to share tests');
      return;
    }

    setIsSaving(true);
    try {
      const shareSettings = {
        isPublic,
        deadline: hasDeadline ? deadline : null,
        maxAttempts: maxAttempts || null,
        customMessage
      };

      const result = await ShareService.shareTest(test.id, shareSettings, user.uid);
      
      setIsShared(true);
      setShareUrl(result.shareUrl);
      generateQRCode(result.shareUrl);
      
      // Reload analytics
      await loadAnalytics();
      
      alert('Test shared successfully!');
    } catch (error) {
      console.error('Error sharing test:', error);
      alert('Failed to share test. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!test) return null;

  return (
    <div className="share-test-modal">
      <div className="share-test-content">
        <div className="share-test-header">
          <h2>Share Test: {test.title}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="share-test-body">
          {/* Analytics Section (if test is already shared) */}
          {isShared && analytics && (
            <section className="share-section analytics-section">
              <h3>📊 Test Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-number">{analytics.summary.accessCount}</div>
                  <div className="analytics-label">Total Access</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-number">{analytics.summary.completionCount}</div>
                  <div className="analytics-label">Completions</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-number">{analytics.summary.completionRate}%</div>
                  <div className="analytics-label">Completion Rate</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-number">{analytics.summary.averageScore}%</div>
                  <div className="analytics-label">Average Score</div>
                </div>
              </div>
              
              {analytics.summary.averageTimeSpent > 0 && (
                <div className="analytics-detail">
                  <span>Average time spent: {Math.floor(analytics.summary.averageTimeSpent / 60)}m {analytics.summary.averageTimeSpent % 60}s</span>
                </div>
              )}
              
              <button onClick={loadAnalytics} className="refresh-analytics-btn">
                🔄 Refresh Analytics
              </button>
            </section>
          )}

          {/* Access Control */}
          <section className="share-section">
            <h3>Access Control</h3>
            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Make test publicly accessible
              </label>
            </div>

            <div className="setting-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={hasDeadline}
                  onChange={(e) => setHasDeadline(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Set deadline
              </label>
              {hasDeadline && (
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="deadline-input"
                />
              )}
            </div>

            <div className="setting-group">
              <label>Max attempts per student (0 = unlimited):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                className="attempts-input"
              />
            </div>

            <button onClick={handleSaveSettings} className="save-settings-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : isShared ? 'Update Settings' : 'Share Test'}
            </button>
          </section>

          {/* Share Methods */}
          <section className="share-section">
            <h3>Share Methods</h3>
            
            {/* Share Code */}
            <div className="share-method">
              <h4>Share Code</h4>
              <p>Students can enter this code to access the test</p>
              <div className="share-code-display">
                <span className="share-code">{shareCode}</span>
                <button onClick={() => copyToClipboard(shareCode)} className="copy-btn">
                  Copy Code
                </button>
              </div>
            </div>

            {/* Share URL */}
            <div className="share-method">
              <h4>Direct Link</h4>
              <p>Share this link for direct access to the test</p>
              <div className="share-url-display">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-url-input"
                />
                <button onClick={() => copyToClipboard(shareUrl)} className="copy-btn">
                  Copy Link
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="share-method">
              <h4>QR Code</h4>
              <p>Students can scan this QR code with their mobile devices</p>
              <div className="qr-code-container">
                {isGeneratingQR ? (
                  <div className="qr-loading">Generating QR Code...</div>
                ) : (
                  <img src={qrCodeUrl} alt="QR Code for test access" className="qr-code" />
                )}
                <button onClick={() => copyToClipboard(shareUrl)} className="copy-btn">
                  Copy QR Link
                </button>
              </div>
            </div>
          </section>

          {/* Email Invitations */}
          <section className="share-section">
            <h3>Send Email Invitations</h3>
            <div className="email-invitation-form">
              <label>Email addresses (one per line or comma-separated):</label>
              <textarea
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                placeholder="student1@email.com&#10;student2@email.com&#10;student3@email.com"
                rows="4"
                className="email-list-input"
              />
              
              <label>Custom message (optional):</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Hi! You've been invited to take a practice test. Click the link below to get started..."
                rows="3"
                className="custom-message-input"
              />
              
              <button onClick={handleSendInvitations} className="send-invitations-btn">
                Send Invitations
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ShareTest;
