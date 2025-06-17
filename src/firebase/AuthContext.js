import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from './config';
import { FirebaseTestsService } from './testsService';
import { SavedTestsService } from '../SavedTestsService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Google Sign-In provider
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Load user profile
        const profile = await FirebaseTestsService.getUserProfile(user.uid);
        setUserProfile(profile);
        
        // If no profile exists, create one
        if (!profile) {
          const newProfile = {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            preferences: {
              theme: 'default',
              timerDefault: 30
            }
          };
          await FirebaseTestsService.saveUserProfile(user.uid, newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Migrate localStorage tests to Firebase after successful login
      setTimeout(() => {
        SavedTestsService.migrateToFirebase().catch(error => {
          console.warn('Migration failed but login successful:', error);
        });
      }, 1000); // Small delay to ensure auth state is fully updated
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, displayName = '') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile
      const newProfile = {
        email,
        displayName,
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'default',
          timerDefault: 30
        }
      };
      
      await FirebaseTestsService.saveUserProfile(result.user.uid, newProfile);
      
      // Migrate localStorage tests to Firebase after successful registration
      setTimeout(() => {
        SavedTestsService.migrateToFirebase().catch(error => {
          console.warn('Migration failed but registration successful:', error);
        });
      }, 1000); // Small delay to ensure auth state is fully updated
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Migrate localStorage tests to Firebase after successful Google login
      setTimeout(() => {
        SavedTestsService.migrateToFirebase().catch(error => {
          console.warn('Migration failed but Google login successful:', error);
        });
      }, 1000); // Small delay to ensure auth state is fully updated
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!user) return { success: false, error: 'No user logged in' };
    
    try {
      await FirebaseTestsService.saveUserProfile(user.uid, profileData);
      setUserProfile(prev => ({ ...prev, ...profileData }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
