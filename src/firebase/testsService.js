import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export class FirebaseTestsService {
  // Save test to user's collection
  static async saveUserTest(userId, testData) {
    try {
      const testId = testData.id || Date.now().toString();
      const userTestRef = doc(db, 'users', userId, 'savedTests', testId);
      
      await setDoc(userTestRef, {
        ...testData,
        id: testId,
        lastModified: serverTimestamp(),
        synced: true
      });
      
      return { success: true, id: testId };
    } catch (error) {
      console.error('Error saving test:', error);
      throw new Error('Failed to save test to cloud');
    }
  }

  // Get all user's saved tests
  static async getUserTests(userId) {
    try {
      const testsRef = collection(db, 'users', userId, 'savedTests');
      const querySnapshot = await getDocs(testsRef);
      
      const tests = [];
      querySnapshot.forEach((doc) => {
        tests.push({ id: doc.id, ...doc.data() });
      });
      
      return tests;
    } catch (error) {
      console.error('Error loading tests:', error);
      return [];
    }
  }

  // Delete user's test
  static async deleteUserTest(userId, testId) {
    try {
      const testRef = doc(db, 'users', userId, 'savedTests', testId);
      await deleteDoc(testRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting test:', error);
      throw new Error('Failed to delete test');
    }
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
        await this.saveUserTest(userId, {
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
