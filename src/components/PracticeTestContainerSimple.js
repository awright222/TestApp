import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';

function PracticeTestContainerSimple() {
  console.log('🧪 SIMPLE PracticeTestContainer loaded!');
  
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🧪 testId:', testId);
  console.log('🧪 user:', !!user);

  useEffect(() => {
    console.log('🧪 useEffect running...');
    
    // Simulate loading
    setTimeout(() => {
      console.log('🧪 Setting loading to false');
      setLoading(false);
      setSelectedTest({ 
        title: 'Test Found!', 
        id: testId,
        questions: [{question_text: 'Sample question'}]
      });
    }, 2000);
  }, [testId]);

  if (loading) {
    console.log('🧪 Rendering loading state');
    return (
      <div style={{ 
        padding: '2rem', 
        background: '#FDF0D5', 
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        <h1>🔄 Simple Loading Test</h1>
        <p>Test ID: {testId}</p>
        <p>Loading for 2 seconds...</p>
      </div>
    );
  }

  console.log('🧪 Rendering loaded state');
  return (
    <div style={{ 
      padding: '2rem', 
      background: '#FDF0D5', 
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1>✅ Simple Test Loaded!</h1>
      <p>Test ID: {testId}</p>
      <p>Test: {selectedTest?.title}</p>
      <p>Questions: {selectedTest?.questions?.length}</p>
    </div>
  );
}

export default PracticeTestContainerSimple;
