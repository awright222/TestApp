import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export class ShareService {
  static COLLECTION_NAME = 'shared_tests';
  static ANALYTICS_COLLECTION = 'test_analytics';

  /**
   * Generate a unique 6-character share code
   */
  static generateShareCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Check if a share code is already in use
   */
  static async isShareCodeUnique(code) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('shareCode', '==', code),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking share code uniqueness:', error);
      return false;
    }
  }

  /**
   * Generate a unique share code
   */
  static async generateUniqueShareCode() {
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = this.generateShareCode();
      isUnique = await this.isShareCodeUnique(code);
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique share code');
    }

    return code;
  }

  /**
   * Create or update a shared test
   */
  static async shareTest(testId, shareSettings, userId) {
    try {
      const shareCode = await this.generateUniqueShareCode();
      
      const shareData = {
        testId,
        shareCode,
        ownerId: userId,
        isPublic: shareSettings.isPublic || false,
        deadline: shareSettings.deadline || null,
        maxAttempts: shareSettings.maxAttempts || null,
        customMessage: shareSettings.customMessage || '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accessCount: 0,
        completionCount: 0
      };

      // Use testId as document ID to allow updates
      const docRef = doc(db, this.COLLECTION_NAME, testId);
      await setDoc(docRef, shareData);

      return {
        ...shareData,
        shareUrl: `${window.location.origin}/shared-test/${testId}?code=${shareCode}`
      };
    } catch (error) {
      console.error('Error sharing test:', error);
      throw error;
    }
  }

  /**
   * Get shared test by ID
   */
  static async getSharedTest(testId) {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, testId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting shared test:', error);
      throw error;
    }
  }

  /**
   * Get shared test by share code
   */
  static async getSharedTestByCode(shareCode) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('shareCode', '==', shareCode.toUpperCase()),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting shared test by code:', error);
      throw error;
    }
  }

  /**
   * Validate access to shared test
   */
  static async validateTestAccess(sharedTest, userId = null) {
    const now = new Date();
    
    // Check if test is active
    if (!sharedTest.isActive) {
      return { valid: false, reason: 'This shared test is no longer active.' };
    }

    // Check deadline
    if (sharedTest.deadline && new Date(sharedTest.deadline) < now) {
      return { valid: false, reason: 'The deadline for this test has passed.' };
    }

    // Check attempt limits (if user is logged in)
    if (userId && sharedTest.maxAttempts > 0) {
      const userAttempts = await this.getUserAttempts(sharedTest.testId, userId);
      if (userAttempts >= sharedTest.maxAttempts) {
        return { 
          valid: false, 
          reason: `You have reached the maximum number of attempts (${sharedTest.maxAttempts}) for this test.` 
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get user's attempt count for a test
   */
  static async getUserAttempts(testId, userId) {
    try {
      const q = query(
        collection(db, this.ANALYTICS_COLLECTION),
        where('testId', '==', testId),
        where('userId', '==', userId),
        where('type', '==', 'completion')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting user attempts:', error);
      return 0;
    }
  }

  /**
   * Track test access
   */
  static async trackTestAccess(testId, userId = null, metadata = {}) {
    try {
      // Update access count
      const sharedTestRef = doc(db, this.COLLECTION_NAME, testId);
      await updateDoc(sharedTestRef, {
        accessCount: (await this.getSharedTest(testId))?.accessCount + 1 || 1,
        lastAccessedAt: new Date().toISOString()
      });

      // Log analytics event
      await addDoc(collection(db, this.ANALYTICS_COLLECTION), {
        testId,
        userId: userId || 'anonymous',
        type: 'access',
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          ...metadata
        }
      });
    } catch (error) {
      console.error('Error tracking test access:', error);
    }
  }

  /**
   * Track test completion
   */
  static async trackTestCompletion(testId, userId = null, results = {}) {
    try {
      // Update completion count
      const sharedTestRef = doc(db, this.COLLECTION_NAME, testId);
      await updateDoc(sharedTestRef, {
        completionCount: (await this.getSharedTest(testId))?.completionCount + 1 || 1,
        lastCompletedAt: new Date().toISOString()
      });

      // Log analytics event
      await addDoc(collection(db, this.ANALYTICS_COLLECTION), {
        testId,
        userId: userId || 'anonymous',
        type: 'completion',
        timestamp: new Date().toISOString(),
        results: {
          score: results.score || 0,
          totalQuestions: results.totalQuestions || 0,
          correctAnswers: results.correctAnswers || 0,
          timeSpent: results.timeSpent || 0,
          ...results
        }
      });
    } catch (error) {
      console.error('Error tracking test completion:', error);
    }
  }

  /**
   * Get analytics for a test
   */
  static async getTestAnalytics(testId, ownerId) {
    try {
      // Verify ownership
      const sharedTest = await this.getSharedTest(testId);
      if (!sharedTest || sharedTest.ownerId !== ownerId) {
        throw new Error('Unauthorized access to test analytics');
      }

      // Get analytics data
      const q = query(
        collection(db, this.ANALYTICS_COLLECTION),
        where('testId', '==', testId)
      );
      const querySnapshot = await getDocs(q);
      
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });

      // Calculate summary statistics
      const accesses = events.filter(e => e.type === 'access').length;
      const completions = events.filter(e => e.type === 'completion');
      const completionCount = completions.length;
      
      const scores = completions.map(c => c.results?.score || 0);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      const timeSpents = completions.map(c => c.results?.timeSpent || 0).filter(t => t > 0);
      const avgTimeSpent = timeSpents.length > 0 ? timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length : 0;

      return {
        summary: {
          accessCount: accesses,
          completionCount,
          completionRate: accesses > 0 ? (completionCount / accesses * 100).toFixed(1) : 0,
          averageScore: avgScore.toFixed(1),
          averageTimeSpent: Math.round(avgTimeSpent)
        },
        events: events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };
    } catch (error) {
      console.error('Error getting test analytics:', error);
      throw error;
    }
  }

  /**
   * Deactivate a shared test
   */
  static async deactivateSharedTest(testId, ownerId) {
    try {
      const sharedTest = await this.getSharedTest(testId);
      if (!sharedTest || sharedTest.ownerId !== ownerId) {
        throw new Error('Unauthorized access to shared test');
      }

      const sharedTestRef = doc(db, this.COLLECTION_NAME, testId);
      await updateDoc(sharedTestRef, {
        isActive: false,
        deactivatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deactivating shared test:', error);
      throw error;
    }
  }

  /**
   * Send email invitations (placeholder - would require backend email service)
   */
  static async sendEmailInvitations(emails, shareUrl, customMessage, testTitle) {
    try {
      // This would typically call a backend API endpoint for sending emails
      // For now, we'll just log the data and simulate success
      
      console.log('Email invitations would be sent with:', {
        recipients: emails,
        shareUrl,
        customMessage,
        testTitle,
        timestamp: new Date().toISOString()
      });

      // In a real implementation, you would:
      // 1. Call your backend API
      // 2. Use a service like SendGrid, AWS SES, or Firebase Functions
      // 3. Track email delivery status
      
      return {
        success: true,
        sentCount: emails.length,
        message: `Invitations would be sent to ${emails.length} recipients`
      };
    } catch (error) {
      console.error('Error sending email invitations:', error);
      throw error;
    }
  }
}
