// Service for managing saved tests in localStorage
export class SavedTestsService {
  static STORAGE_KEY = 'saved_tests';

  static getSavedTests() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved tests:', error);
      return [];
    }
  }

  static saveTest(testData) {
    try {
      const savedTests = this.getSavedTests();
      
      // Check if a test with the same title already exists
      const existingIndex = savedTests.findIndex(test => test.title === testData.title);
      
      if (existingIndex !== -1) {
        // Update existing test
        savedTests[existingIndex] = {
          ...testData,
          dateModified: new Date().toISOString()
        };
      } else {
        // Add new test
        savedTests.push(testData);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedTests));
      return true;
    } catch (error) {
      console.error('Error saving test:', error);
      throw new Error('Failed to save test');
    }
  }

  static deleteTest(testId) {
    try {
      const savedTests = this.getSavedTests();
      const filtered = savedTests.filter(test => test.id !== testId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting test:', error);
      throw new Error('Failed to delete test');
    }
  }

  static getTest(testId) {
    try {
      const savedTests = this.getSavedTests();
      return savedTests.find(test => test.id === testId) || null;
    } catch (error) {
      console.error('Error loading test:', error);
      return null;
    }
  }

  static clearAllTests() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing tests:', error);
      throw new Error('Failed to clear tests');
    }
  }
}
