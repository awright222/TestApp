// Utility to infer original test titles from question content
export class TestTitleInference {
  
  // Known Microsoft exam patterns
  static EXAM_PATTERNS = [
    { pattern: /MB-800|Dynamics 365 Business Central/i, title: 'MB-800: Microsoft Dynamics 365 Business Central Functional Consultant' },
    { pattern: /AZ-900|Azure Fundamentals/i, title: 'AZ-900: Microsoft Azure Fundamentals' },
    { pattern: /AZ-104|Azure Administrator/i, title: 'AZ-104: Microsoft Azure Administrator' },
    { pattern: /MS-100|Microsoft 365 Identity/i, title: 'MS-100: Microsoft 365 Identity and Services' },
    { pattern: /MS-101|Microsoft 365 Mobility/i, title: 'MS-101: Microsoft 365 Mobility and Security' },
    { pattern: /PL-900|Power Platform Fundamentals/i, title: 'PL-900: Microsoft Power Platform Fundamentals' },
    { pattern: /SC-900|Security.*Fundamentals/i, title: 'SC-900: Microsoft Security, Compliance, and Identity Fundamentals' }
  ];

  /**
   * Try to infer the original test title from question content
   * @param {Array} questions - Array of question objects
   * @returns {string|null} - Inferred title or null if can't determine
   */
  static inferFromQuestions(questions) {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return null;
    }

    // Combine all question text and options for analysis
    let allText = '';
    
    for (const question of questions.slice(0, 5)) { // Check first 5 questions
      if (question.question) {
        allText += question.question + ' ';
      }
      if (question.options && Array.isArray(question.options)) {
        allText += question.options.join(' ') + ' ';
      }
      if (question.explanation) {
        allText += question.explanation + ' ';
      }
    }

    // Check against known patterns
    for (const { pattern, title } of this.EXAM_PATTERNS) {
      if (pattern.test(allText)) {
        return title;
      }
    }

    // Look for common Microsoft service mentions
    const microsoftServices = [
      'Azure', 'Office 365', 'Microsoft 365', 'SharePoint', 'Teams', 
      'Exchange', 'OneDrive', 'Power Platform', 'Dynamics'
    ];
    
    const foundServices = microsoftServices.filter(service => 
      allText.toLowerCase().includes(service.toLowerCase())
    );

    if (foundServices.length > 0) {
      return `Microsoft ${foundServices[0]} Practice Test`;
    }

    // Fallback: use a snippet from the first question
    const firstQuestion = questions[0]?.question;
    if (firstQuestion && firstQuestion.length > 10) {
      const snippet = firstQuestion.substring(0, 40).trim();
      const cleanSnippet = snippet.replace(/[^\w\s:.-]/g, '').trim();
      return cleanSnippet + (firstQuestion.length > 40 ? '...' : '');
    }

    return null;
  }

  /**
   * Try to infer from CSV URL or other metadata
   * @param {Object} testData - Test data object
   * @returns {string|null} - Inferred title or null
   */
  static inferFromMetadata(testData) {
    if (testData.csvUrl) {
      // Extract from CSV filename
      const filename = testData.csvUrl.split('/').pop().replace('.csv', '');
      if (filename.includes('MB-800') || filename.toLowerCase().includes('dynamics')) {
        return 'MB-800: Microsoft Dynamics 365 Business Central Functional Consultant';
      }
    }

    if (testData.source || testData.category) {
      return testData.source || testData.category;
    }

    return null;
  }

  /**
   * Main function to infer title from all available data
   * @param {Object} savedTest - Saved test object
   * @returns {string} - Best guess at original title
   */
  static inferTitle(savedTest) {
    // First try from metadata
    const metadataTitle = this.inferFromMetadata(savedTest);
    if (metadataTitle) {
      return metadataTitle;
    }

    // Then try from questions
    const questions = savedTest.questions || savedTest.progress?.questions || [];
    const questionTitle = this.inferFromQuestions(questions);
    if (questionTitle) {
      return questionTitle;
    }

    // Fallback to save title
    return savedTest.title;
  }
}
