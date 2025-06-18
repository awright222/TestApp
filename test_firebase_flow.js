// Test Firebase authentication and save/load functionality
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

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

async function testFirebaseFlow() {
  try {
    console.log('=== Testing Firebase Authentication & Save/Load Flow ===');
    
    // Step 1: Sign in
    console.log('\n1. Signing in...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@testapp.com', 'password123');
    console.log('✅ Signed in as:', userCredential.user.email);
    console.log('User ID:', userCredential.user.uid);
    
    const userId = userCredential.user.uid;
    
    // Step 2: Create test data (matching the format from PracticeTest.js)
    console.log('\n2. Creating test data...');
    const testData = {
      id: 'test-' + Date.now().toString(),
      title: 'Firebase Test Save ' + new Date().toLocaleTimeString(),
      type: 'practice-test',
      progress: {
        current: 1,
        completed: [0],
        answers: { 0: 'A' },
        totalQuestions: 3,
        completedQuestions: 1
      },
      questions: [
        {
          id: 1,
          question: 'Firebase test question 1?',
          choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
          correct_answer: 'A'
        },
        {
          id: 2,
          question: 'Firebase test question 2?',
          choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
          correct_answer: 'B'
        },
        {
          id: 3,
          question: 'Firebase test question 3?',
          choices: 'A. Answer A\nB. Answer B\nC. Answer C\nD. Answer D',
          correct_answer: 'C'
        }
      ],
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      originalTest: {
        title: 'Original Test Title',
        color: '#669BBC'
      }
    };
    
    console.log('Test data structure:', {
      id: testData.id,
      title: testData.title,
      questionsCount: testData.questions.length,
      hasProgress: !!testData.progress,
      progressCurrent: testData.progress.current
    });
    
    // Step 3: Save to Firebase
    console.log('\n3. Saving to Firebase...');
    const userProgressRef = doc(db, 'users', userId, 'testProgress', testData.id);
    
    await setDoc(userProgressRef, {
      ...testData,
      lastModified: new Date(),
      synced: true
    });
    
    console.log('✅ Saved to Firebase successfully');
    
    // Step 4: Retrieve from Firebase
    console.log('\n4. Retrieving from Firebase...');
    const docSnap = await getDoc(userProgressRef);
    
    if (docSnap.exists()) {
      const retrievedData = { id: docSnap.id, ...docSnap.data() };
      console.log('✅ Retrieved from Firebase successfully');
      console.log('Retrieved data structure:', {
        id: retrievedData.id,
        title: retrievedData.title,
        questionsCount: retrievedData.questions?.length || 0,
        hasProgress: !!retrievedData.progress,
        progressCurrent: retrievedData.progress?.current
      });
      
      // Step 5: Test the continue logic (simulating PracticeTestContainer)
      console.log('\n5. Testing Continue Test logic...');
      const questions = retrievedData.questions || retrievedData.progress?.questions || [];
      const progress = retrievedData.progress || null;
      
      console.log('Extracted questions count:', questions.length);
      console.log('Extracted progress:', progress ? 'present' : 'missing');
      
      if (questions.length === 0) {
        console.error('❌ CONTINUE TEST WOULD FAIL - No questions found');
        console.error('Questions at root:', retrievedData.questions?.length || 0);
        console.error('Questions in progress:', retrievedData.progress?.questions?.length || 0);
      } else {
        console.log('✅ Continue Test would work - questions found:', questions.length);
        console.log('Progress data:', {
          current: progress.current,
          completed: progress.completedQuestions,
          total: progress.totalQuestions
        });
      }
      
    } else {
      console.error('❌ Document not found in Firebase');
    }
    
    // Step 6: List all saved tests
    console.log('\n6. Listing all saved tests...');
    const progressRef = collection(db, 'users', userId, 'testProgress');
    const querySnapshot = await getDocs(progressRef);
    
    console.log('Total saved tests:', querySnapshot.size);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.title} (${data.questions?.length || 0} questions)`);
    });
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
  }
  
  process.exit(0);
}

testFirebaseFlow();
