import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Papa from 'papaparse';
import PracticeTestNew from './PracticeTestNew';

function PracticeTestContainerDirect() {
  console.log('🧪 DIRECT PracticeTestContainer loaded!');
  
  const { testId } = useParams();
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🧪 useEffect running for testId:', testId);
    
    if (testId === 'mb800-practice') {
      console.log('🧪 Loading MB-800 test directly...');
      
      const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDO68GqAelFKS2G6SwiUWdPs2tw5Gt62D5xLiB_9zyLyBPLSZm5gTthaQz9yCpmDKuymWMc83PV5a2/pub?gid=0&single=true&output=csv";
      
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: (result) => {
          console.log('✅ CSV parse complete!');
          console.log('✅ Data rows:', result.data.length);
          
          const filtered = result.data.filter(q => q.question_text && q.question_text.trim());
          console.log('✅ Filtered questions:', filtered.length);
          
          if (filtered.length > 0) {
            const transformedTest = {
              title: 'MB-800: Microsoft Dynamics 365 Business Central Functional Consultant',
              color: '#003049',
              questions: filtered.map((q, index) => ({
                ...q,
                id: index + 1
              })),
              isCustomTest: true,
              customTestId: testId
            };
            
            console.log('✅ Test loaded successfully for PracticeTestNew!');
            setSelectedTest(transformedTest);
          } else {
            setError('No questions found in CSV');
          }
          setLoading(false);
        },
        error: (err) => {
          console.error('❌ CSV parse error:', err);
          setError('Failed to load CSV: ' + err.message);
          setLoading(false);
        }
      });
    } else {
      setError('Test not found: ' + testId);
      setLoading(false);
    }
  }, [testId]);

  const handleBackToSelection = () => {
    window.location.href = '/dashboard';
  };

  if (loading) {
    return (
      <div style={{ 
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
        <div style={{ fontSize: '2rem' }}>📊</div>
        <p style={{ color: '#669BBC' }}>Loading questions from CSV file...</p>
        <p style={{ color: '#999', fontSize: '0.9rem' }}>Parsing test data, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
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
        <div style={{ fontSize: '2rem' }}>❌</div>
        <h2 style={{ color: '#003049' }}>Error Loading Test</h2>
        <p style={{ color: '#669BBC' }}>{error}</p>
        <button 
          onClick={handleBackToSelection}
          style={{
            background: '#669BBC',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Render the full PracticeTestNew component with all features!
  return (
    <div className="practice-test-container" style={{ background: '#FDF0D5', borderRadius: '16px', minHeight: 'calc(100vh - 4rem)' }}>
      <PracticeTestNew 
        selectedTest={selectedTest} 
        onBackToSelection={handleBackToSelection}
        searchTerm=""
        onClearSearch={() => {}}
        onTestComplete={() => {}}
      />
    </div>
  );
}

export default PracticeTestContainerDirect;
