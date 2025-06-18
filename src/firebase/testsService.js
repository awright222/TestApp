import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export class FirebaseTestsService {
  // Save test progress to user's collection (for SavedTestsService)
  static async saveUserProgress(userId, progressData) {
    try {
      console.log('FirebaseTestsService.saveUserProgress called with:', {
        userId,
        progressData: { ...progressData, progress: progressData.progress ? 'present' : 'missing' }
      });
      
      const progressId = progressData.id || Date.now().toString();
      const userProgressRef = doc(db, 'users', userId, 'testProgress', progressId);
      
      console.log('Attempting to save to Firebase with ID:', progressId);
      
      await setDoc(userProgressRef, {
        ...progressData,
        id: progressId,
        lastModified: serverTimestamp(),
        synced: true
      });
      
      console.log('Successfully saved to Firebase');
      return { success: true, id: progressId };
    } catch (error) {
      console.error('Error saving test progress to Firebase:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw new Error('Failed to save test progress to cloud');
    }
  }

  // Get all user's test progress
  static async getUserProgress(userId) {
    try {
      const progressRef = collection(db, 'users', userId, 'testProgress');
      const querySnapshot = await getDocs(progressRef);
      
      const progress = [];
      querySnapshot.forEach((doc) => {
        progress.push({ id: doc.id, ...doc.data() });
      });
      
      return progress;
    } catch (error) {
      console.error('Error loading test progress:', error);
      return [];
    }
  }

  // Delete user's test progress
  static async deleteUserProgress(userId, progressId) {
    try {
      const progressRef = doc(db, 'users', userId, 'testProgress', progressId);
      await deleteDoc(progressRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting test progress:', error);
      throw new Error('Failed to delete test progress');
    }
  }

  // Save test to user's collection (deprecated - keeping for backward compatibility)
  static async saveUserTest(userId, testData) {
    return this.saveUserProgress(userId, testData);
  }

  // Get all user's saved tests (deprecated - keeping for backward compatibility) 
  static async getUserTests(userId) {
    return this.getUserProgress(userId);
  }

  // Delete user's test (deprecated - keeping for backward compatibility)
  static async deleteUserTest(userId, testId) {
    return this.deleteUserProgress(userId, testId);
  }

  // Save user profile/preferences
  static async saveUserProfile(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profileData,
        lastLogin: serverTimestamp()
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error saving profile:', error);
      throw new Error('Failed to save profile');
    }
  }

  // Get user profile
  static async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }

  // Migrate localStorage data to Firebase (one-time migration)
  static async migrateLocalStorageData(userId) {
    try {
      const localData = localStorage.getItem('saved_tests');
      if (!localData) return { success: true, migrated: 0 };
      
      const tests = JSON.parse(localData);
      let migratedCount = 0;
      
      for (const test of tests) {
        await this.saveUserProgress(userId, {
          ...test,
          migratedFromLocal: true
        });
        migratedCount++;
      }
      
      // Backup local data before clearing
      localStorage.setItem('saved_tests_backup', localData);
      localStorage.removeItem('saved_tests');
      
      return { success: true, migrated: migratedCount };
    } catch (error) {
      console.error('Error migrating data:', error);
      throw new Error('Failed to migrate local data');
    }
  }
}
