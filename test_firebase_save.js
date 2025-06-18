// Test Firebase save functionality directly
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { SavedTestsService } from './src/SavedTestsService.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDt5NwBFugOXIwc4CXECuSzK6IPiWQkFZw",
  authDomain: "test-builder-app.firebaseapp.com",
  projectId: "test-builder-app",
  storageBucket: "test-builder-app.firebasestorage.app",
  messagingSenderId: "168621778509",
  appId: "1:168621778509:web:7faa337711eff5d61b9e04",
  measurementId: "G-Q2JYPVG1ET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirebaseSave() {
  try {
    console.log('=== Testing Firebase Save Functionality ===');
    
    // Create a test user (you'll need to create this user in Firebase Console first)
    const email = 'test@example.com';
    const password = 'testpassword123';
    
    console.log('Attempting to sign in user...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', userCredential.user.email);
    
    // Create test data
    const testData = {
      id: Date.now().toString(),
      title: 'Firebase Test Save ' + new Date().toLocaleTimeString(),
      type: 'practice-test',
      progress: {
        current: 2,
        completed: [0, 1],
        answers: {
          0: 'A',
          1: 'B'
        },
        totalQuestions: 5,
        completedQuestions: 2
      },
      questions: [
        {
          id: 1,
          question: 'Test question 1?',
          choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
          correct_answer: 'A'
        },
        {
          id: 2,
          question: 'Test question 2?',
          choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
          correct_answer: 'B'
        }
      ],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString()
    };
    
    console.log('Attempting to save test to Firebase...');
    const result = await SavedTestsService.saveTest(testData);
    console.log('Save result:', result);
    
    console.log('Attempting to retrieve saved tests...');
    const savedTests = await SavedTestsService.getSavedTests();
    console.log('Retrieved tests:', savedTests);
    
    console.log('=== Test completed successfully ===');
    
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  }
  
  // Exit the process
  process.exit(0);
}

testFirebaseSave();
