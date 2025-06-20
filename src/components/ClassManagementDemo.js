import React, { useState } from 'react';
import { ClassService } from '../services/ClassService';
import { useAuth } from '../firebase/AuthContext';

const ClassManagementDemo = () => {
  const { user } = useAuth();
  const [demoData, setDemoData] = useState(null);
  const [loading, setLoading] = useState(false);

  const createDemoClass = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const demoClassData = {
      name: 'Biology 101 - Demo Class',
      description: 'A demonstration class for testing the class management system',
      subject: 'Biology',
      allowSelfEnrollment: true
    };

    const result = await ClassService.createClass(user.uid, demoClassData);
    
    if (result.success) {
      setDemoData({
        class: result.class,
        enrollmentCode: result.class.settings.enrollmentCode
      });
    } else {
      alert('Error creating demo class: ' + result.error);
    }
    
    setLoading(false);
  };

  const joinDemoClass = async () => {
    if (!demoData || !user) return;
    
    const result = await ClassService.joinClassWithCode(
      demoData.enrollmentCode,
      user.uid + '_student', // Simulate different student
      'student@example.com'
    );
    
    if (result.success) {
      alert(`Successfully joined ${result.className}!`);
    } else {
      alert('Error joining class: ' + result.error);
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '12px', margin: '2rem' }}>
      <h2>🧪 Class Management Demo</h2>
      <p>Test the class management functionality with demo data</p>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={createDemoClass} 
          disabled={loading}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Demo Class'}
        </button>
        
        {demoData && (
          <button 
            onClick={joinDemoClass}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Join Demo Class
          </button>
        )}
      </div>

      {demoData && (
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Demo Class Created!</h3>
          <p><strong>Class Name:</strong> {demoData.class.name}</p>
          <p><strong>Enrollment Code:</strong> <code>{demoData.enrollmentCode}</code></p>
          <p><strong>Class ID:</strong> {demoData.class.id}</p>
          
          <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
            Students can use the enrollment code "{demoData.enrollmentCode}" to join this class.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassManagementDemo;
