// Service for managing saved tests - uses Firebase when logged in, localStorage otherwise
import { auth } from './firebase/config';
import { FirebaseTestsService } from './firebase/testsService';

export class SavedTestsService {
  static STORAGE_KEY = 'saved_tests';

  static async getSavedTests() {
    try {
      // If user is logged in, fetch from Firebase
      if (auth.currentUser) {
        try {
          console.log('User is logged in, fetching from Firebase...');
          const result = await FirebaseTestsService.getUserProgress(auth.currentUser.uid);
          console.log('Firebase fetch result:', result);
          return result;
        } catch (firebaseError) {
          console.error('Firebase fetch failed, falling back to localStorage:', firebaseError);
          // Fall through to localStorage
        }
      }
      
      // Otherwise, use localStorage
      console.log('Getting saved tests from localStorage...');
      const saved = localStorage.getItem(this.STORAGE_KEY);
      console.log('Raw localStorage data:', saved);
      const result = saved ? JSON.parse(saved) : [];
      console.log('Parsed result:', result);
      return result;
    } catch (error) {
      console.error('Error loading saved tests:', error);
      return [];
    }
  }

  static async saveTest(testData) {
    try {
      console.log('SavedTestsService.saveTest called with:', testData);
      console.log('Current user:', auth.currentUser?.email);
      
      // If user is logged in, try to save to Firebase
      if (auth.currentUser) {
        try {
          console.log('User is logged in, saving to Firebase...');
          const result = await FirebaseTestsService.saveUserProgress(auth.currentUser.uid, testData);
          console.log('Firebase save result:', result);
          return result;
        } catch (firebaseError) {
          console.error('Firebase save failed, falling back to localStorage:', firebaseError);
          // Fall through to localStorage save
        }
      }
      
      // Use localStorage (either user not logged in or Firebase failed)
      console.log('Saving to localStorage...');
      const savedTests = await this.getSavedTests();
      console.log('Current saved tests:', savedTests);
      
      // Check if a test with the same title already exists
      const existingIndex = savedTests.findIndex(test => test.title === testData.title);
      console.log('Existing test index:', existingIndex);
      
      if (existingIndex !== -1) {
        // Update existing test
        console.log('Updating existing test at index:', existingIndex);
        savedTests[existingIndex] = {
          ...testData,
          dateModified: new Date().toISOString()
        };
      } else {
        // Add new test
        console.log('Adding new test');
        savedTests.push(testData);
      }
      
      console.log('About to save to localStorage:', savedTests);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedTests));
      console.log('Successfully saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving test:', error);
      throw new Error('Failed to save test');
    }
  }

  static async deleteTest(testId) {
    try {
      // If user is logged in, delete from Firebase
      if (auth.currentUser) {
        return await FirebaseTestsService.deleteUserProgress(auth.currentUser.uid, testId);
      }
      
      // Otherwise, use localStorage
      const savedTests = await this.getSavedTests();
      const filtered = savedTests.filter(test => test.id !== testId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting test:', error);
      throw new Error('Failed to delete test');
    }
  }

  static async getTest(testId) {
    try {
      const savedTests = await this.getSavedTests();
      return savedTests.find(test => test.id === testId) || null;
    } catch (error) {
      console.error('Error loading test:', error);
      return null;
    }
  }

  static async clearAllTests() {
    try {
      // If user is logged in, this would need a Firebase implementation
      // For now, just clear localStorage
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing tests:', error);
      throw new Error('Failed to clear tests');
    }
  }

  // Utility method to migrate localStorage tests to Firebase when user logs in
  static async migrateToFirebase() {
    try {
      if (!auth.currentUser) {
        console.log('No user logged in, skipping migration');
        return;
      }

      const localTests = localStorage.getItem(this.STORAGE_KEY);
      if (!localTests) {
        console.log('No local tests to migrate');
        return;
      }

      const tests = JSON.parse(localTests);
      console.log(`Migrating ${tests.length} tests to Firebase...`);

      // Save each test to Firebase
      for (const test of tests) {
        await FirebaseTestsService.saveUserProgress(auth.currentUser.uid, test);
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error migrating tests to Firebase:', error);
      // Don't throw here - migration is optional
    }
  }
}
