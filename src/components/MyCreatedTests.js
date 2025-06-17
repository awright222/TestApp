import React from 'react';

export default function MyCreatedTests() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#669BBC', marginBottom: '1rem' }}>📝 My Created Tests</h2>
        <p style={{ color: '#bfc9d1', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Tests you've created will be managed here
        </p>
        
        <div style={{
          background: '#00243a',
          border: '2px solid rgba(102, 155, 188, 0.3)',
          borderRadius: '10px',
          padding: '2rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛠️</div>
          <h3 style={{ color: '#FDF0D5', marginBottom: '1rem' }}>Under Construction!</h3>
          <p style={{ color: '#bfc9d1', lineHeight: '1.6' }}>
            This is where you'll manage all the tests you've created. 
            Edit, share, duplicate, and track performance of your custom tests.
          </p>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(102, 155, 188, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 155, 188, 0.3)'
          }}>
            <h4 style={{ color: '#669BBC', marginBottom: '0.5rem' }}>Planned features:</h4>
            <ul style={{ 
              color: '#bfc9d1', 
              textAlign: 'left', 
              listStyle: 'none', 
              padding: 0 
            }}>
              <li style={{ marginBottom: '0.25rem' }}>📋 Test library management</li>
              <li style={{ marginBottom: '0.25rem' }}>✏️ Edit existing tests</li>
              <li style={{ marginBottom: '0.25rem' }}>📊 Performance analytics</li>
              <li style={{ marginBottom: '0.25rem' }}>🔄 Test duplication</li>
              <li>👥 Share with students/colleagues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
