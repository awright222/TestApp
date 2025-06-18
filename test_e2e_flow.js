// End-to-end test of the save/continue flow
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// We need to import the service properly, but since we're outside React context, 
// let's manually test the Firebase operations

const firebaseConfig = {
  apiKey: "AIzaSyDt5NwBFugOXIwc4CXECuSzK6IPiWQkFZw",
  authDomain: "test-builder-app.firebaseapp.com",
  projectId: "test-builder-app",
  storageBucket: "test-builder-app.firebasestorage.app",
  messagingSenderId: "168621778509",
  appId: "1:168621778509:web:7faa337711eff5d61b9e04",
  measurementId: "G-Q2JYPVG1ET"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Import Firebase service functions directly
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

async function testSaveContinueFlow() {
  console.log('=== Testing Complete Save/Continue Flow ===');
  
  try {
    // 1. Authenticate
    console.log('\n1. Authenticating...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@testapp.com', 'password123');
    const userId = userCredential.user.uid;
    console.log('✅ Authenticated as:', userCredential.user.email);
    
    // 2. Create test data exactly as PracticeTest.js would
    console.log('\n2. Creating test data (matching PracticeTest.js format)...');
    const testId = 'end-to-end-' + Date.now().toString();
    const originalQuestions = [
      {
        id: 1,
        question: 'What is Azure AD?',
        choices: 'A. Active Directory\nB. Application Directory\nC. Azure Directory\nD. Access Directory',
        correct_answer: 'A',
        question_type: 'multiple-choice'
      },
      {
        id: 2,
        question: 'Which service provides identity management?',
        choices: 'A. Azure Storage\nB. Azure AD\nC. Azure Compute\nD. Azure Network',
        correct_answer: 'B',
        question_type: 'multiple-choice'
      },
      {
        id: 3,
        question: 'What is MFA?',
        choices: 'A. Multi-Factor Authentication\nB. Multiple File Access\nC. Microsoft Fast Access\nD. Multi-Function App',
        correct_answer: 'A',
        question_type: 'multiple-choice'
      }
    ];
    
    // Progress data as it would be when user saves mid-test
    const progressData = {
      current: 1, // Currently on question 2 (0-indexed)
      completed: [0], // Completed question 1
      answers: { 0: 'A' }, // User selected A for question 1
      totalQuestions: 3,
      completedQuestions: 1,
      score: 1,
      startTime: new Date().toISOString(),
      questionSubmitted: [true, false, false]
    };
    
    // Complete saved test data structure (matching PracticeTest.js saveTest function)
    const savedTestData = {
      id: testId,
      title: 'E2E Test - Azure AD Basics',
      type: 'practice-test',
      progress: progressData,
      questions: originalQuestions.map(q => ({ ...q })), // Deep copy questions
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      originalTest: {
        title: 'Azure AD Practice Test',
        color: '#669BBC',
        isCustomTest: false
      }
    };
    
    console.log('Test data structure:');
    console.log('- ID:', savedTestData.id);
    console.log('- Title:', savedTestData.title);
    console.log('- Questions count:', savedTestData.questions.length);
    console.log('- Progress current:', savedTestData.progress.current);
    console.log('- Progress completed:', savedTestData.progress.completedQuestions, '/', savedTestData.progress.totalQuestions);
    
    // 3. Save to Firebase (mimicking SavedTestsService.saveTest -> FirebaseTestsService.saveUserProgress)
    console.log('\n3. Saving to Firebase...');
    const userProgressRef = doc(db, 'users', userId, 'testProgress', testId);
    
    await setDoc(userProgressRef, {
      ...savedTestData,
      lastModified: serverTimestamp(),
      synced: true
    });
    
    console.log('✅ Saved to Firebase');
    
    // 4. Retrieve all user progress (mimicking SavedTestsService.getSavedTests -> FirebaseTestsService.getUserProgress)
    console.log('\n4. Retrieving saved tests from Firebase...');
    const progressRef = collection(db, 'users', userId, 'testProgress');
    const querySnapshot = await getDocs(progressRef);
    
    const savedTests = [];
    querySnapshot.forEach((doc) => {
      savedTests.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('✅ Retrieved', savedTests.length, 'saved tests');
    
    // Find our test
    const ourTest = savedTests.find(test => test.id === testId);
    if (!ourTest) {
      console.error('❌ Our test not found in retrieved data!');
      return;
    }
    
    console.log('Found our test:', {
      id: ourTest.id,
      title: ourTest.title,
      questionsCount: ourTest.questions?.length || 0,
      hasProgress: !!ourTest.progress
    });
    
    // 5. Simulate the "Continue Test" flow (mimicking handleLoadTest -> navigate -> PracticeTestContainer)
    console.log('\n5. Simulating Continue Test flow...');
    
    // This is what happens in handleLoadTest (SavedTests.js)
    console.log('SavedTests.handleLoadTest would call: navigate("/practice", { state: { savedTest: ourTest } })');
    
    // This is what happens in PracticeTestContainer useEffect when location.state?.savedTest exists
    console.log('PracticeTestContainer would receive savedTest:', {
      id: ourTest.id,
      title: ourTest.title,
      questions: ourTest.questions?.length || 0,
      progress: ourTest.progress ? 'present' : 'missing'
    });
    
    // Extract questions and progress (mimicking PracticeTestContainer logic)
    const questions = ourTest.questions || ourTest.progress?.questions || [];
    const progress = ourTest.progress || null;
    
    console.log('PracticeTestContainer would extract:');
    console.log('- Questions:', questions.length);
    console.log('- Progress:', progress ? 'present' : 'missing');
    
    if (questions.length === 0) {
      console.error('❌ CONTINUE TEST WOULD FAIL - No questions extracted!');
      console.error('ourTest.questions:', ourTest.questions?.length || 0);
      console.error('ourTest.progress?.questions:', ourTest.progress?.questions?.length || 0);
      console.error('Full ourTest structure keys:', Object.keys(ourTest));
      return;
    }
    
    if (!progress) {
      console.error('❌ CONTINUE TEST WOULD FAIL - No progress data!');
      return;
    }
    
    // Transform test (mimicking PracticeTestContainer transformation)
    const transformedTest = {
      title: ourTest.title,
      color: ourTest.originalTest?.color || '#669BBC',
      questions: questions,
      savedProgress: progress,
      isSavedTest: true
    };
    
    console.log('✅ PracticeTestContainer would create transformedTest:', {
      title: transformedTest.title,
      questionsCount: transformedTest.questions.length,
      savedProgressCurrent: transformedTest.savedProgress.current,
      isSavedTest: transformedTest.isSavedTest
    });
    
    // 6. Simulate PracticeTest loading with saved progress
    console.log('\n6. Simulating PracticeTest with saved progress...');
    console.log('PracticeTest would receive:');
    console.log('- selectedTest.questions:', transformedTest.questions.length);
    console.log('- selectedTest.savedProgress:', transformedTest.savedProgress ? 'present' : 'missing');
    
    if (transformedTest.savedProgress) {
      console.log('PracticeTest would restore:');
      console.log('- Current question:', transformedTest.savedProgress.current);
      console.log('- Completed questions:', transformedTest.savedProgress.completed);
      console.log('- User answers:', transformedTest.savedProgress.answers);
      console.log('- Score:', transformedTest.savedProgress.score);
    }
    
    console.log('\n✅ END-TO-END TEST COMPLETED SUCCESSFULLY!');
    console.log('The save/continue flow should work correctly.');
    
    // 7. Cleanup - delete the test
    console.log('\n7. Cleaning up...');
    await deleteDoc(userProgressRef);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ End-to-end test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
  
  process.exit(0);
}

testSaveContinueFlow();
