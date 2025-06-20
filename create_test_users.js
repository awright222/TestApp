import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function createUserWithRole(email, password, displayName, accountType) {
  try {
    console.log(`Creating ${accountType} user: ${email}...`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile based on role
    const getSubscriptionFeatures = (type) => {
      if (type === 'student') {
        return {
          canCreateTests: false,
          canViewAnalytics: false,
          maxTestsPerMonth: 0,
          maxStudentsPerTest: 0,
          storageGB: 0.1
        };
      } else if (type === 'teacher') {
        return {
          canCreateTests: true,
          canViewAnalytics: true,
          maxTestsPerMonth: 3,
          maxStudentsPerTest: 100,
          storageGB: 0.5
        };
      }
    };
    
    const userProfile = {
      email,
      displayName,
      createdAt: new Date().toISOString(),
      accountType: accountType,
      isNewUser: false, // Already set up with role
      subscription: {
        tier: 'free',
        status: 'active',
        startDate: new Date().toISOString(),
        features: getSubscriptionFeatures(accountType)
      },
      usage: {
        currentPeriod: new Date().toISOString().substring(0, 7),
        testsCreated: 0,
        studentAttempts: 0,
        storageUsedGB: 0
      },
      preferences: {
        theme: 'default',
        timerDefault: 30
      }
    };
    
    // Save user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    console.log(`✅ ${accountType} user created successfully!`);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.uid);
    console.log('Role:', accountType);
    console.log('---');
    
    return { success: true, user, profile: userProfile };
  } catch (error) {
    console.error(`❌ Error creating ${accountType} user:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createTestUsers() {
  console.log('🚀 Creating test users for TestBuilder app...\n');
  
  // Create teacher user
  await createUserWithRole(
    'teacher@testapp.com',
    'password123',
    'Test Teacher',
    'teacher'
  );
  
  // Create student user
  await createUserWithRole(
    'student@testapp.com',
    'password123',
    'Test Student',
    'student'
  );
  
  console.log('\n🎉 Test users created successfully!');
  console.log('\nYou can now log in with:');
  console.log('👨‍🏫 Teacher: teacher@testapp.com / password123');
  console.log('🎓 Student: student@testapp.com / password123');
  console.log('\nBoth users are pre-configured with their roles and ready to use!');
  
  process.exit(0);
}

// Run the script
createTestUsers().catch(console.error);
