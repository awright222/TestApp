import React from 'react';

export default function CreateTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#669BBC', marginBottom: '1rem' }}>✨ Create New Test</h2>
        <p style={{ color: '#bfc9d1', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Build custom tests with your own questions and answers
        </p>
        
        <div style={{
          background: '#00243a',
          border: '2px solid rgba(102, 155, 188, 0.3)',
          borderRadius: '10px',
          padding: '2rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h3 style={{ color: '#FDF0D5', marginBottom: '1rem' }}>Coming Soon!</h3>
          <p style={{ color: '#bfc9d1', lineHeight: '1.6' }}>
            The test creation tool is in development. You'll be able to create 
            custom tests with multiple question types, images, and detailed explanations.
          </p>
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(102, 155, 188, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 155, 188, 0.3)'
          }}>
            <h4 style={{ color: '#669BBC', marginBottom: '0.5rem' }}>What you'll be able to create:</h4>
            <ul style={{ 
              color: '#bfc9d1', 
              textAlign: 'left', 
              listStyle: 'none', 
              padding: 0 
            }}>
              <li style={{ marginBottom: '0.25rem' }}>❓ Multiple choice questions</li>
              <li style={{ marginBottom: '0.25rem' }}>🎯 Hotspot/interactive questions</li>
              <li style={{ marginBottom: '0.25rem' }}>📚 Case study scenarios</li>
              <li style={{ marginBottom: '0.25rem' }}>🖼️ Image-based questions</li>
              <li style={{ marginBottom: '0.25rem' }}>💡 Detailed explanations</li>
              <li>⏱️ Timed assessments</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <button
              disabled
              style={{
                background: '#666',
                color: '#ccc',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'not-allowed',
                fontSize: '1rem'
              }}
            >
              🔒 Test Builder (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
