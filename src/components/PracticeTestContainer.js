import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TestSelector from './TestSelector';
import PracticeTest from './PracticeTest';
import { CreatedTestsService } from '../services/CreatedTestsService';

function PracticeTestContainer({ searchTerm, onClearSearch }) {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCustomTest = async () => {
      setLoading(true);
      try {
        const customTest = await CreatedTestsService.getTestById(testId);
        if (customTest && customTest.questions && Array.isArray(customTest.questions)) {
          // Transform the custom test to match the expected format
          const transformedTest = {
            title: customTest.title,
            color: customTest.color || '#669BBC',
            questions: customTest.questions.map((q, index) => ({
              ...q,
              id: index + 1
            })),
            isCustomTest: true,
            customTestId: customTest.id
          };
          setSelectedTest(transformedTest);
        } else {
          alert('Custom test not found or has no questions!');
          navigate('/my-tests');
        }
      } catch (error) {
        console.error('Error loading custom test:', error);
        alert('Failed to load custom test.');
        navigate('/my-tests');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadCustomTest();
    }
  }, [testId, navigate]);

  const handleBackToSelection = () => {
    if (testId) {
      // If launched from custom test, go back to My Created Tests
      navigate('/my-tests');
    } else {
      // If from normal test selection, go back to test selector
      setSelectedTest(null);
    }
  };

  if (loading) {
    return (
      <div className="practice-test-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '1rem',
        background: '#FDF0D5',
        borderRadius: '16px',
        minHeight: 'calc(100vh - 4rem)',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '2rem' }}>🔄</div>
        <p style={{ color: '#669BBC' }}>Loading your custom test...</p>
      </div>
    );
  }

  if (!selectedTest) {
    return (
      <div className="practice-test-container" style={{ background: '#FDF0D5', borderRadius: '16px', minHeight: 'calc(100vh - 4rem)', padding: '2rem' }}>
        <TestSelector onTestSelect={setSelectedTest} />
      </div>
    );
  }

  return (
    <div className="practice-test-container" style={{ background: '#FDF0D5', borderRadius: '16px', minHeight: 'calc(100vh - 4rem)' }}>
      <PracticeTest 
        selectedTest={selectedTest} 
        onBackToSelection={handleBackToSelection}
        searchTerm={searchTerm}
        onClearSearch={onClearSearch}
      />
    </div>
  );
}

export default PracticeTestContainer;
