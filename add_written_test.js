// Helper script to add written questions test to existing localStorage
console.log(`
To test essay and short answer questions:

1. Go to http://localhost:3000 in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage → Local Storage → localhost:3000
4. Look for 'publishedTests' key or create it if it doesn't exist
5. Add this test data to the array:

`);

const testData = {
  "id": "test-written-questions",
  "title": "Written Questions Test",
  "description": "Test containing essay and short answer questions",
  "questions": [
    {
      "id": "essay-1",
      "question_type": "essay",
      "question": "Explain the importance of renewable energy sources and their impact on environmental sustainability. Discuss at least three types of renewable energy and their advantages.",
      "grading_rubric": "Look for discussion of environmental benefits, specific renewable energy types (solar, wind, hydro, etc.), and understanding of sustainability concepts."
    },
    {
      "id": "short-answer-1",
      "question_type": "short answer",
      "question": "What is photosynthesis and why is it important for life on Earth?",
      "expected_keywords": "process, plants, sunlight, carbon dioxide, oxygen, glucose, energy, atmosphere"
    },
    {
      "id": "essay-2",
      "question_type": "essay question",
      "question": "Analyze the role of technology in modern education. Consider both positive and negative impacts on student learning.",
      "grading_rubric": "Should address both benefits and drawbacks, provide specific examples, and demonstrate critical thinking about educational technology."
    },
    {
      "id": "short-answer-2",
      "question_type": "short answer question",
      "question": "Define artificial intelligence and give two examples of its application in everyday life.",
      "expected_keywords": "computer systems, human intelligence, learning, problem-solving, examples like smartphones, recommendations, virtual assistants"
    }
  ],
  "instructions": "Please answer all questions thoughtfully. Essay questions should be detailed and well-structured, while short answer questions should be concise but complete.",
  "time_limit": null,
  "created_by": "test-user",
  "created_at": new Date().toISOString()
};

console.log(JSON.stringify(testData, null, 2));

console.log(`

Or run this in the browser console to add it automatically:

let publishedTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
publishedTests.push(${JSON.stringify(testData)});
localStorage.setItem('publishedTests', JSON.stringify(publishedTests));
location.reload();

`);
