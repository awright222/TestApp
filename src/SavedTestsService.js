// Service for managing saved tests - uses Firebase when logged in, localStorage otherwise
import { auth } from './firebase/config';
import { FirebaseTestsService } from './firebase/testsService';

export class SavedTestsService {
  static STORAGE_KEY = 'saved_tests';

  static async getSavedTests() {
    try {
      console.log('=== SavedTestsService.getSavedTests called ===');
      console.log('auth.currentUser:', auth.currentUser?.email || 'not logged in');
      
      // If user is logged in, fetch from Firebase
      if (auth.currentUser) {
        try {
          console.log('User is logged in, fetching from Firebase...');
          const result = await FirebaseTestsService.getUserProgress(auth.currentUser.uid);
          console.log('Firebase fetch result:', result);
          
          // If Firebase has tests, return them
          if (result && result.length > 0) {
            return result;
          }
          
          // If Firebase is empty, check localStorage 
          console.log('Firebase empty, checking localStorage');
          const localTests = localStorage.getItem(this.STORAGE_KEY);
          if (localTests) {
            const parsedLocal = JSON.parse(localTests);
            console.log('Found', parsedLocal.length, 'tests in localStorage');
            console.log('These tests need to be migrated to Firebase. Save a new test to trigger migration.');
            return parsedLocal; // Return local tests for now
          }
          
          return [];
        } catch (firebaseError) {
          console.error('Firebase fetch failed, falling back to localStorage:', firebaseError);
          // Fall through to localStorage
        }
      }
      
      // Otherwise, use localStorage
      console.log('Getting saved tests from localStorage...');
      console.log('Storage key:', this.STORAGE_KEY);
      const saved = localStorage.getItem(this.STORAGE_KEY);
      console.log('Raw localStorage data:', saved);
      const result = saved ? JSON.parse(saved) : [];
      console.log('Parsed result:', result);
      console.log('Returning', result.length, 'tests');
      return result;
    } catch (error) {
      console.error('Error loading saved tests:', error);
      return [];
    }
  }

  static async saveTest(testData) {
    try {
      console.log('=== SavedTestsService.saveTest called ===');
      console.log('Current user:', auth.currentUser?.email || 'not logged in');
      console.log('auth.currentUser object:', auth.currentUser);
      console.log('auth.currentUser.uid:', auth.currentUser?.uid);
      console.log('Test data to save:', {
        id: testData.id,
        title: testData.title,
        type: testData.type,
        questionsCount: testData.questions?.length || 0,
        hasProgress: !!testData.progress
      });
      
      // Validate that questions are included
      if (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
        console.error('❌ CRITICAL: Attempting to save test without questions!');
        console.error('testData keys:', Object.keys(testData));
        console.error('This will cause "Continue Test" to fail');
        throw new Error('Cannot save test without questions array. Make sure the test data includes a questions array with at least one question.');
      }
      
      console.log('Questions validation passed:', testData.questions.length, 'questions found');
      
      // If user is logged in, try to save to Firebase
      if (auth.currentUser) {
        try {
          console.log('User is logged in, attempting Firebase save');
          
          const result = await FirebaseTestsService.saveUserProgress(auth.currentUser.uid, testData);
          
          if (result && result.success) {
            console.log('Saved to Firebase');
            window.dispatchEvent(new CustomEvent('testSaved'));
            return result;
          } else {
            console.error('Firebase save failed, falling back to localStorage');
          }
        } catch (firebaseError) {
          console.error('Firebase save error, falling back to localStorage:', firebaseError);
        }
      } else {
        console.log('User not logged in, using localStorage only');
      }
      
      // Use localStorage (either user not logged in or Firebase failed)
      console.log('Saving to localStorage');
      const savedTests = await this.getSavedTests();
      
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
      
      // Dispatch event to notify SavedTests component
      console.log('Dispatching testSaved event from localStorage save');
      window.dispatchEvent(new CustomEvent('testSaved'));
      
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
      // Clear localStorage for now
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
      localStorage.removeItem(this.STORAGE_KEY);        console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error migrating tests to Firebase:', error);
      // Don't throw here - migration is optional
    }
  }

  // Utility method to clean up corrupted tests (tests without questions)
  static async cleanupCorruptedTests() {
    try {
      console.log('Cleaning up corrupted tests...');
      const savedTests = await this.getSavedTests();
      const validTests = savedTests.filter(test => {
        const hasQuestions = test.questions && Array.isArray(test.questions) && test.questions.length > 0;
        if (!hasQuestions) {
          console.log('Removing corrupted test:', test.id, test.title);
        }
        return hasQuestions;
      });
      
      const removedCount = savedTests.length - validTests.length;
      
      if (removedCount > 0) {
        if (auth.currentUser) {
          // For Firebase users, we'd need to implement individual deletion
          console.log(`Found ${removedCount} corrupted tests, but cleanup for Firebase users needs individual deletion`);
        } else {
          // For localStorage, replace with valid tests only
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validTests));
          console.log(`Removed ${removedCount} corrupted tests from localStorage`);
        }
      } else {
        console.log('No corrupted tests found');
      }
      
      return { removed: removedCount, remaining: validTests.length };
    } catch (error) {
      console.error('Error cleaning up corrupted tests:', error);
      return { removed: 0, remaining: 0 };
    }
  }
}
