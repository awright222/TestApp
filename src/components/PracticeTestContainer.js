import React, { useState } from 'react';
import TestSelector from './TestSelector';
import PracticeTest from './PracticeTest';

function PracticeTestContainer() {
  const [selectedTest, setSelectedTest] = useState(null);

  if (!selectedTest) {
    return <TestSelector onTestSelect={setSelectedTest} />;
  }

  return <PracticeTest selectedTest={selectedTest} onBackToSelection={() => setSelectedTest(null)} />;
}

export default PracticeTestContainer;
