import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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

async function createTestUser() {
  try {
    console.log('Creating test user...');
    const email = 'test@testapp.com';
    const password = 'password123';
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Test user created successfully:', userCredential.user.email);
    console.log('User ID:', userCredential.user.uid);
    
    console.log('\nYou can now log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Test user already exists. You can log in with:');
      console.log('Email: test@testapp.com');
      console.log('Password: password123');
    } else {
      console.error('Error creating user:', error);
    }
  }
  
  process.exit(0);
}

createTestUser();
