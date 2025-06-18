import React, { useState } from 'react';
import TestSelector from './TestSelector';
import PracticeTest from './PracticeTest';

function PracticeTestContainer({ searchTerm, onClearSearch }) {
  const [selectedTest, setSelectedTest] = useState(null);

  if (!selectedTest) {
    return <TestSelector onTestSelect={setSelectedTest} />;
  }

  return (
    <PracticeTest 
      selectedTest={selectedTest} 
      onBackToSelection={() => setSelectedTest(null)}
      searchTerm={searchTerm}
      onClearSearch={onClearSearch}
    />
  );
}

export default PracticeTestContainer;
