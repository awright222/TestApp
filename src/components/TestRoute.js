// Simple test component to verify the route works
import React from 'react';
import { useParams } from 'react-router-dom';

function TestRoute() {
  console.log('🧪 TEST ROUTE COMPONENT LOADED!');
  const { testId } = useParams();
  console.log('🧪 TEST ROUTE testId:', testId);
  
  return (
    <div style={{ 
      padding: '2rem', 
      background: '#FDF0D5', 
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1>🧪 Test Route Working!</h1>
      <p>Test ID: {testId}</p>
      <p>Check console for debug logs</p>
      <div style={{ 
        background: 'white', 
        padding: '1rem', 
        borderRadius: '8px', 
        margin: '1rem auto',
        maxWidth: '500px'
      }}>
        <h3>Route is working if you see this page!</h3>
        <p>Now we can debug why PracticeTestContainer isn't loading...</p>
      </div>
    </div>
  );
}

export default TestRoute;
