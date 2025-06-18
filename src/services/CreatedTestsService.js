// CreatedTestsService.js - Service for managing user-created tests
import { auth } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const STORAGE_KEY = 'created_tests';

export class CreatedTestsService {
  
  // Get all created tests for the current user
  static async getCreatedTests() {
    try {
      console.log('CreatedTestsService.getCreatedTests called');
      
      // If user is logged in, fetch from Firebase
      if (auth.currentUser) {
        console.log('User logged in, fetching from Firebase');
        const testsRef = collection(db, 'users', auth.currentUser.uid, 'createdTests');
        const q = query(testsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const tests = [];
        querySnapshot.forEach((doc) => {
          tests.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('Fetched tests from Firebase:', tests);
        return tests;
      }
      
      // Otherwise, use localStorage
      console.log('No user logged in, using localStorage');
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
      // If Firebase fails, try localStorage as fallback
      if (auth.currentUser) {
        console.log('Firebase failed, falling back to localStorage');
        try {
          const storedTests = localStorage.getItem(STORAGE_KEY);
          return storedTests ? JSON.parse(storedTests) : [];
        } catch (localError) {
          console.error('LocalStorage fallback also failed:', localError);
        }
      }
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  // Create a new test
  static async createTest(testData) {
    try {
      console.log('CreatedTestsService.createTest called with:', testData);
      
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
        isActive: true,
        settings: testData.settings || {}
      };

      console.log('Creating new test:', newTest);
      
      // If user is logged in, save to Firebase
      if (auth.currentUser) {
        console.log('User logged in, saving to Firebase');
        const testRef = doc(db, 'users', auth.currentUser.uid, 'createdTests', newTest.id);
        await setDoc(testRef, newTest);
        console.log('Test saved to Firebase successfully');
        return newTest;
      }
      
      // Otherwise, use localStorage
      console.log('No user logged in, saving to localStorage');
      const existingTests = await this.getCreatedTests();
      const updatedTests = [...existingTests, newTest];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTests));
      console.log('Test saved to localStorage successfully');
      
      return newTest;
    } catch (error) {
      console.error('Error creating test:', error);
      throw new Error('Failed to create test');
    }
  }

  // Update an existing test
  static async updateTest(testId, updates) {
    try {
      // If user is logged in, update in Firebase
      if (auth.currentUser) {
        console.log('User logged in, updating in Firebase');
        const testRef = doc(db, 'users', auth.currentUser.uid, 'createdTests', testId);
        const updatedData = {
          ...updates,
          questionCount: (updates.questions || []).length,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(testRef, updatedData);
        
        // Return the updated test
        const updatedDoc = await getDoc(testRef);
        if (updatedDoc.exists()) {
          return { id: updatedDoc.id, ...updatedDoc.data() };
        }
        throw new Error('Test not found after update');
      }
      
      // Otherwise, use localStorage
      console.log('No user logged in, updating in localStorage');
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
      // If user is logged in, delete from Firebase
      if (auth.currentUser) {
        console.log('User logged in, deleting from Firebase');
        const testRef = doc(db, 'users', auth.currentUser.uid, 'createdTests', testId);
        await deleteDoc(testRef);
        console.log('Test deleted from Firebase successfully');
        return true;
      }
      
      // Otherwise, use localStorage
      console.log('No user logged in, deleting from localStorage');
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

  // Migrate localStorage tests to Firebase when user logs in
  static async migrateToFirebase() {
    try {
      if (!auth.currentUser) {
        console.log('No user logged in, skipping migration');
        return;
      }

      console.log('Starting migration of created tests to Firebase');
      const localTests = localStorage.getItem(STORAGE_KEY);
      
      if (!localTests) {
        console.log('No local tests to migrate');
        return;
      }

      const tests = JSON.parse(localTests);
      if (!Array.isArray(tests) || tests.length === 0) {
        console.log('No valid local tests to migrate');
        return;
      }

      console.log(`Migrating ${tests.length} tests to Firebase`);
      
      // Check which tests already exist in Firebase
      const existingTests = await this.getCreatedTests();
      const existingIds = new Set(existingTests.map(test => test.id));

      let migratedCount = 0;
      for (const test of tests) {
        if (!existingIds.has(test.id)) {
          try {
            const testRef = doc(db, 'users', auth.currentUser.uid, 'createdTests', test.id);
            await setDoc(testRef, test);
            migratedCount++;
            console.log(`Migrated test: ${test.title}`);
          } catch (error) {
            console.error(`Failed to migrate test ${test.title}:`, error);
          }
        }
      }

      console.log(`Migration completed: ${migratedCount} tests migrated`);
      
      // Optionally clear localStorage after successful migration
      if (migratedCount > 0) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Cleared localStorage after migration');
      }

    } catch (error) {
      console.error('Error during migration:', error);
    }
  }
}
