import React from 'react';

export default function SharedTests() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#669BBC', marginBottom: '1rem' }}>📤 Shared Tests</h2>
        <p style={{ color: '#bfc9d1', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Tests that have been shared with you will appear here
        </p>
        
        <div style={{
          background: '#00243a',
          border: '2px solid rgba(102, 155, 188, 0.3)',
          borderRadius: '10px',
          padding: '2rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <h3 style={{ color: '#FDF0D5', marginBottom: '1rem' }}>Coming Soon!</h3>
          <p style={{ color: '#bfc9d1', lineHeight: '1.6' }}>
            Teachers and colleagues will be able to share tests with you directly. 
            You'll receive notifications and can access shared tests right here.
          </p>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(102, 155, 188, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 155, 188, 0.3)'
          }}>
            <h4 style={{ color: '#669BBC', marginBottom: '0.5rem' }}>Features in development:</h4>
            <ul style={{ 
              color: '#bfc9d1', 
              textAlign: 'left', 
              listStyle: 'none', 
              padding: 0 
            }}>
              <li style={{ marginBottom: '0.25rem' }}>📧 Email invitations to tests</li>
              <li style={{ marginBottom: '0.25rem' }}>🔗 Shareable test links</li>
              <li style={{ marginBottom: '0.25rem' }}>👥 Group test assignments</li>
              <li>📊 Real-time results sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
