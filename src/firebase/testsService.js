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
  // Helper function to prepare data for Firestore (flattens problematic nested arrays)
  static prepareForFirestore(data) {
    // Create a deep copy to avoid modifying the original
    const prepared = JSON.parse(JSON.stringify(data));
    
    // Handle userAnswers array (can contain nested arrays)
    if (prepared.progress?.userAnswers) {
      prepared.progress.userAnswers = prepared.progress.userAnswers.map(answer => {
        if (Array.isArray(answer)) {
          return JSON.stringify(answer); // Convert nested arrays to strings
        }
        return answer;
      });
    }
    
    // Handle questions array (each question object might have nested arrays)
    if (prepared.questions) {
      prepared.questions = prepared.questions.map(question => {
        const flatQuestion = { ...question };
        // Convert any array properties in question objects to strings
        Object.keys(flatQuestion).forEach(key => {
          if (Array.isArray(flatQuestion[key])) {
            flatQuestion[key] = JSON.stringify(flatQuestion[key]);
          }
        });
        return flatQuestion;
      });
    }
    
    // Handle progress.questions if it exists
    if (prepared.progress?.questions) {
      prepared.progress.questions = prepared.progress.questions.map(question => {
        const flatQuestion = { ...question };
        Object.keys(flatQuestion).forEach(key => {
          if (Array.isArray(flatQuestion[key])) {
            flatQuestion[key] = JSON.stringify(flatQuestion[key]);
          }
        });
        return flatQuestion;
      });
    }
    
    return prepared;
  }

  // Helper function to restore data from Firestore
  static restoreFromFirestore(data) {
    // Create a deep copy
    const restored = JSON.parse(JSON.stringify(data));
    
    // Restore userAnswers array
    if (restored.progress?.userAnswers) {
      restored.progress.userAnswers = restored.progress.userAnswers.map(answer => {
        if (typeof answer === 'string') {
          try {
            const parsed = JSON.parse(answer);
            return Array.isArray(parsed) ? parsed : answer;
          } catch {
            return answer;
          }
        }
        return answer;
      });
    }
    
    // Restore questions array
    if (restored.questions) {
      restored.questions = restored.questions.map(question => {
        const restoredQuestion = { ...question };
        Object.keys(restoredQuestion).forEach(key => {
          if (typeof restoredQuestion[key] === 'string') {
            try {
              const parsed = JSON.parse(restoredQuestion[key]);
              if (Array.isArray(parsed)) {
                restoredQuestion[key] = parsed;
              }
            } catch {
              // If parsing fails, keep as string
            }
          }
        });
        return restoredQuestion;
      });
    }
    
    // Restore progress.questions
    if (restored.progress?.questions) {
      restored.progress.questions = restored.progress.questions.map(question => {
        const restoredQuestion = { ...question };
        Object.keys(restoredQuestion).forEach(key => {
          if (typeof restoredQuestion[key] === 'string') {
            try {
              const parsed = JSON.parse(restoredQuestion[key]);
              if (Array.isArray(parsed)) {
                restoredQuestion[key] = parsed;
              }
            } catch {
              // If parsing fails, keep as string
            }
          }
        });
        return restoredQuestion;
      });
    }
    
    return restored;
  }

  // Save test progress to user's collection (for SavedTestsService)
  static async saveUserProgress(userId, progressData) {
    try {
      console.log('🔥🔥 FirebaseTestsService.saveUserProgress called with:', {
        userId,
        progressDataKeys: Object.keys(progressData),
        progressData: { 
          ...progressData, 
          progress: progressData.progress ? 'present' : 'missing',
          questions: progressData.questions ? progressData.questions.length + ' questions' : 'NO QUESTIONS'
        }
      });
      
      // Validate that questions are included
      if (!progressData.questions || !Array.isArray(progressData.questions) || progressData.questions.length === 0) {
        console.error('🔥🔥 ❌ CRITICAL: Attempting to save test without questions!');
        console.error('🔥🔥 progressData keys:', Object.keys(progressData));
        console.error('🔥🔥 This will cause "Continue Test" to fail');
        
        // Return error instead of saving incomplete data
        throw new Error('Cannot save test without questions array');
      }
      
      console.log('🔥🔥 ✅ Questions validation passed:', progressData.questions.length, 'questions found');
      
      const progressId = progressData.id || Date.now().toString();
      const userProgressRef = doc(db, 'users', userId, 'testProgress', progressId);
      
      console.log('🔥🔥 Attempting to save to Firebase with:', {
        collection: 'users',
        userId: userId,
        subcollection: 'testProgress',
        progressId: progressId,
        fullPath: `users/${userId}/testProgress/${progressId}`
      });
      
      const dataToSave = {
        ...progressData,
        id: progressId,
        lastModified: serverTimestamp(),
        synced: true
      };
      
      console.log('🔥🔥 Data structure being saved:', {
        ...dataToSave,
        questions: dataToSave.questions ? `${dataToSave.questions.length} questions` : 'NO QUESTIONS',
        progress: dataToSave.progress ? 'present' : 'missing'
      });
      
      // Prepare the data for Firestore (handle nested arrays)
      console.log('🔥🔥 Preparing data for Firestore...');
      const preparedData = this.prepareForFirestore(dataToSave);
      console.log('🔥🔥 Data prepared for Firestore');
      
      await setDoc(userProgressRef, preparedData);
      
      console.log('🔥🔥 ✅ Successfully saved to Firebase');
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
      console.log('🔥🔥 FirebaseTestsService.getUserProgress called for userId:', userId);
      const progressRef = collection(db, 'users', userId, 'testProgress');
      console.log('🔥🔥 Collection reference:', progressRef.path);
      
      const querySnapshot = await getDocs(progressRef);
      console.log('🔥🔥 Query snapshot size:', querySnapshot.size);
      
      const progress = [];
      querySnapshot.forEach((doc) => {
        console.log('🔥🔥 Document found:', {
          id: doc.id,
          data: {
            title: doc.data().title,
            type: doc.data().type,
            questionsCount: doc.data().questions?.length || 0,
            synced: doc.data().synced,
            lastModified: doc.data().lastModified
          }
        });
        
        // Restore the data when retrieving from Firestore
        const restoredData = this.restoreFromFirestore(doc.data());
        progress.push({ id: doc.id, ...restoredData });
      });
      
      console.log('🔥🔥 Returning', progress.length, 'progress records');
      return progress;
    } catch (error) {
      console.error('🔥🔥 Error loading test progress:', error);
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
