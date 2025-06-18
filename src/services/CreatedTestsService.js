// CreatedTestsService.js - Service for managing user-created tests

const STORAGE_KEY = 'created_tests';

export class CreatedTestsService {
  
  // Get all created tests for the current user
  static async getCreatedTests() {
    try {
      console.log('CreatedTestsService.getCreatedTests called');
      const storedTests = localStorage.getItem(STORAGE_KEY);
      console.log('Raw stored data:', storedTests);
      
      if (!storedTests) {
        console.log('No stored tests found, returning empty array');
        return [];
      }
      
      const allTests = JSON.parse(storedTests);
      console.log('Parsed tests:', allTests);
      
      // Ensure we have a valid array
      if (!Array.isArray(allTests)) {
        console.warn('Invalid stored tests data, resetting...');
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      
      console.log('Returning tests:', allTests);
      return allTests;
    } catch (error) {
      console.error('Error loading created tests:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  // Create a new test
  static async createTest(testData) {
    try {
      console.log('CreatedTestsService.createTest called with:', testData);
      const existingTests = await this.getCreatedTests();
      console.log('Existing tests:', existingTests);
      
      const newTest = {
        id: Date.now().toString(),
        title: testData.title,
        description: testData.description || '',
        questions: testData.questions || [],
        questionCount: (testData.questions || []).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: testData.source || 'builder', // 'builder', 'import', 'google-sheets'
        difficulty: testData.difficulty || 'Intermediate',
        icon: testData.icon || '📝',
        color: testData.color || '#669BBC',
        csvUrl: testData.csvUrl || null, // For imported tests
        isActive: true
      };

      console.log('Creating new test:', newTest);
      const updatedTests = [...existingTests, newTest];
      console.log('All tests after creation:', updatedTests);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTests));
      
      // Verify the data was saved
      const savedData = localStorage.getItem(STORAGE_KEY);
      console.log('Saved data verification:', savedData);
      
      return newTest;
    } catch (error) {
      console.error('Error creating test:', error);
      throw new Error('Failed to create test');
    }
  }

  // Update an existing test
  static async updateTest(testId, updates) {
    try {
      const existingTests = await this.getCreatedTests();
      const testIndex = existingTests.findIndex(test => test.id === testId);
      
      if (testIndex === -1) {
        throw new Error('Test not found');
      }

      existingTests[testIndex] = {
        ...existingTests[testIndex],
        ...updates,
        questionCount: (updates.questions || existingTests[testIndex].questions || []).length,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTests));
      return existingTests[testIndex];
    } catch (error) {
      console.error('Error updating test:', error);
      throw new Error('Failed to update test');
    }
  }

  // Delete a test
  static async deleteTest(testId) {
    try {
      const existingTests = await this.getCreatedTests();
      const filteredTests = existingTests.filter(test => test.id !== testId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTests));
      return true;
    } catch (error) {
      console.error('Error deleting test:', error);
      throw new Error('Failed to delete test');
    }
  }

  // Get a specific test by ID
  static async getTestById(testId) {
    try {
      const tests = await this.getCreatedTests();
      return tests.find(test => test.id === testId) || null;
    } catch (error) {
      console.error('Error loading test:', error);
      return null;
    }
  }

  // Convert questions array to CSV format
  static generateTestCSV(questions) {
    const headers = ['question_text', 'question_type', 'choices', 'correct_answer', 'explanation'];
    const csvRows = [headers.join(',')];
    
    questions.forEach(q => {
      const row = [
        `"${q.question_text.replace(/"/g, '""')}"`,
        `"${q.question_type}"`,
        `"${q.choices.replace(/"/g, '""')}"`,
        `"${q.correct_answer.replace(/"/g, '""')}"`,
        `"${q.explanation.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Parse CSV data into questions array
  static parseCSVToQuestions(csvText) {
    try {
      if (!csvText || typeof csvText !== 'string') {
        throw new Error('Invalid CSV data');
      }
      
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header and one data row');
      }
      
      // const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const questions = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (for production, use a proper CSV parser)
        const values = line.split('","').map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        if (values.length >= 5) {
          questions.push({
            question_text: values[0] || '',
            question_type: values[1] || 'multiple choice',
            choices: values[2] || '',
            correct_answer: values[3] || '',
            explanation: values[4] || ''
          });
        }
      }

      return questions;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Invalid CSV format: ' + error.message);
    }
  }
}
