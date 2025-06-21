const fs = require('fs');

// Create a test with essay and short answer questions
const testWithWrittenQuestions = {
  id: 'test-written-questions',
  title: 'Written Questions Test',
  description: 'Test containing essay and short answer questions',
  questions: [
    {
      id: 'essay-1',
      question_type: 'essay',
      question: 'Explain the importance of renewable energy sources and their impact on environmental sustainability. Discuss at least three types of renewable energy and their advantages.',
      grading_rubric: 'Look for discussion of environmental benefits, specific renewable energy types (solar, wind, hydro, etc.), and understanding of sustainability concepts.'
    },
    {
      id: 'short-answer-1',
      question_type: 'short answer',
      question: 'What is photosynthesis and why is it important for life on Earth?',
      expected_keywords: 'process, plants, sunlight, carbon dioxide, oxygen, glucose, energy, atmosphere'
    },
    {
      id: 'essay-2',
      question_type: 'essay question',
      question: 'Analyze the role of technology in modern education. Consider both positive and negative impacts on student learning.',
      grading_rubric: 'Should address both benefits and drawbacks, provide specific examples, and demonstrate critical thinking about educational technology.'
    },
    {
      id: 'short-answer-2',
      question_type: 'short answer question',
      question: 'Define artificial intelligence and give two examples of its application in everyday life.',
      expected_keywords: 'computer systems, human intelligence, learning, problem-solving, examples like smartphones, recommendations, virtual assistants'
    }
  ],
  instructions: 'Please answer all questions thoughtfully. Essay questions should be detailed and well-structured, while short answer questions should be concise but complete.',
  time_limit: null,
  created_by: 'test-user',
  created_at: new Date().toISOString()
};

// Save the test to localStorage format
const testData = JSON.stringify(testWithWrittenQuestions, null, 2);
console.log('Test data for written questions:');
console.log(testData);

// Also create a simple HTML file to manually input this data
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Add Written Questions Test</title>
</head>
<body>
    <h1>Add Written Questions Test</h1>
    <p>Copy and paste this test data into localStorage:</p>
    <h2>Key: publishedTests</h2>
    <textarea style="width: 100%; height: 400px;" readonly>${testData.replace(/"/g, '&quot;')}</textarea>
    
    <h2>Instructions:</h2>
    <ol>
        <li>Go to your React app at localhost:3000</li>
        <li>Open browser developer tools (F12)</li>
        <li>Go to Application/Storage → Local Storage → localhost:3000</li>
        <li>Add a new key: <code>publishedTests</code></li>
        <li>Set the value to: <code>[${testData}]</code></li>
        <li>Refresh the page and look for "Written Questions Test" in the test list</li>
    </ol>
    
    <script>
        console.log('Test data for localStorage:');
        console.log('Key: publishedTests');
        console.log('Value: [' + ${JSON.stringify(testData)} + ']');
    </script>
</body>
</html>
`;

fs.writeFileSync('written_questions_test.html', htmlContent);
console.log('\nCreated written_questions_test.html file for easy testing');
console.log('Open this file in a browser for instructions on adding the test data');
