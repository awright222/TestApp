// PublishedTestsService.js - Service for managing published tests and results
const PUBLISHED_TESTS_KEY = 'published_tests';
const TEST_RESULTS_KEY = 'test_results';
const TEST_ATTEMPTS_KEY = 'test_attempts';

export class PublishedTestsService {
  
  // Publish a test (make it available for external access)
  static async publishTest(testData, settings) {
    try {
      const publishedTests = await this.getPublishedTests();
      
      const publishedTest = {
        id: testData.id,
        shareId: this.generateShareId(),
        title: testData.title,
        description: testData.description,
        questions: testData.questions,
        settings: settings,
        createdAt: testData.createdAt,
        publishedAt: new Date().toISOString(),
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        isActive: true
      };

      const updatedTests = [...publishedTests.filter(t => t.id !== testData.id), publishedTest];
      localStorage.setItem(PUBLISHED_TESTS_KEY, JSON.stringify(updatedTests));
      
      return publishedTest;
    } catch (error) {
      console.error('Error publishing test:', error);
      throw new Error('Failed to publish test');
    }
  }

  // Unpublish a test
  static async unpublishTest(testId) {
    try {
      const publishedTests = await this.getPublishedTests();
      const updatedTests = publishedTests.filter(t => t.id !== testId);
      localStorage.setItem(PUBLISHED_TESTS_KEY, JSON.stringify(updatedTests));
      return true;
    } catch (error) {
      console.error('Error unpublishing test:', error);
      throw new Error('Failed to unpublish test');
    }
  }

  // Get all published tests for the current user
  static async getPublishedTests() {
    try {
      const stored = localStorage.getItem(PUBLISHED_TESTS_KEY);
      if (!stored) return [];
      
      const tests = JSON.parse(stored);
      
      // Ensure we have a valid array
      if (!Array.isArray(tests)) {
        console.warn('Invalid published tests data, resetting...');
        localStorage.removeItem(PUBLISHED_TESTS_KEY);
        return [];
      }
      
      return tests;
    } catch (error) {
      console.error('Error loading published tests:', error);
      localStorage.removeItem(PUBLISHED_TESTS_KEY);
      return [];
    }
  }

  // Get a published test by share ID (for external access)
  static async getPublishedTestByShareId(shareId) {
    try {
      const publishedTests = await this.getPublishedTests();
      return publishedTests.find(test => test.shareId === shareId && test.isActive) || null;
    } catch (error) {
      console.error('Error loading published test:', error);
      return null;
    }
  }

  // Generate a unique share ID
  static generateShareId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Record a test attempt (when someone starts the test)
  static async recordTestAttempt(shareId, studentInfo) {
    try {
      const attempts = await this.getTestAttempts(shareId);
      const attemptId = Date.now().toString();
      
      const attempt = {
        id: attemptId,
        shareId: shareId,
        studentName: studentInfo.name,
        studentEmail: studentInfo.email || '',
        startedAt: new Date().toISOString(),
        completedAt: null,
        answers: {},
        score: null,
        percentage: null,
        timeSpent: 0,
        isCompleted: false,
        ipAddress: 'N/A' // In a real app, you'd capture this
      };

      const updatedAttempts = [...attempts, attempt];
      localStorage.setItem(`${TEST_ATTEMPTS_KEY}_${shareId}`, JSON.stringify(updatedAttempts));
      
      // Update test statistics
      await this.updateTestStats(shareId);
      
      return attemptId;
    } catch (error) {
      console.error('Error recording test attempt:', error);
      throw new Error('Failed to record test attempt');
    }
  }

  // Submit test results
  static async submitTestResults(shareId, attemptId, results) {
    try {
      const attempts = await this.getTestAttempts(shareId);
      const attemptIndex = attempts.findIndex(a => a.id === attemptId);
      
      if (attemptIndex === -1) {
        throw new Error('Attempt not found');
      }

      attempts[attemptIndex] = {
        ...attempts[attemptIndex],
        completedAt: new Date().toISOString(),
        answers: results.answers,
        score: results.score,
        percentage: results.percentage || results.score,
        timeSpent: results.timeSpent,
        isCompleted: true,
        // Enhanced analytics data
        questionResults: results.questionResults || [],
        testSettings: results.testSettings || {},
        mode: results.mode || 'practice',
        answeredCount: results.answeredCount || 0,
        startedAt: results.startedAt || attempts[attemptIndex].startedAt
      };

      localStorage.setItem(`${TEST_ATTEMPTS_KEY}_${shareId}`, JSON.stringify(attempts));
      
      // Update test statistics
      await this.updateTestStats(shareId);
      
      return attempts[attemptIndex];
    } catch (error) {
      console.error('Error submitting test results:', error);
      throw new Error('Failed to submit test results');
    }
  }

  // Get all attempts for a test
  static async getTestAttempts(shareId) {
    try {
      const stored = localStorage.getItem(`${TEST_ATTEMPTS_KEY}_${shareId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading test attempts:', error);
      return [];
    }
  }

  // Get results for a specific test (for teacher dashboard)
  static async getTestResults(shareId) {
    try {
      const attempts = await this.getTestAttempts(shareId);
      const completedAttempts = attempts.filter(a => a.isCompleted);
      
      return {
        totalAttempts: attempts.length,
        completedAttempts: completedAttempts.length,
        results: completedAttempts,
        averageScore: completedAttempts.length > 0 
          ? completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length 
          : 0,
        highestScore: completedAttempts.length > 0 
          ? Math.max(...completedAttempts.map(a => a.percentage)) 
          : 0,
        lowestScore: completedAttempts.length > 0 
          ? Math.min(...completedAttempts.map(a => a.percentage)) 
          : 0
      };
    } catch (error) {
      console.error('Error loading test results:', error);
      return {
        totalAttempts: 0,
        completedAttempts: 0,
        results: [],
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }
  }

  // Update test statistics
  static async updateTestStats(shareId) {
    try {
      const publishedTests = await this.getPublishedTests();
      const testIndex = publishedTests.findIndex(t => t.shareId === shareId);
      
      if (testIndex !== -1) {
        const results = await this.getTestResults(shareId);
        publishedTests[testIndex] = {
          ...publishedTests[testIndex],
          totalAttempts: results.totalAttempts,
          completedAttempts: results.completedAttempts,
          averageScore: results.averageScore
        };
        
        localStorage.setItem(PUBLISHED_TESTS_KEY, JSON.stringify(publishedTests));
      }
    } catch (error) {
      console.error('Error updating test stats:', error);
    }
  }

  // Generate shareable link
  static generateShareLink(shareId) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/take-test/${shareId}`;
  }

  // Export results to CSV
  static exportResultsToCSV(results, testTitle) {
    const headers = ['Student Name', 'Email', 'Score', 'Percentage', 'Time Spent', 'Completed At', 'Started At'];
    const csvRows = [headers.join(',')];

    results.forEach(result => {
      const timeSpent = this.formatTime(result.timeSpent);
      const row = [
        `"${result.studentName}"`,
        `"${result.studentEmail}"`,
        `${result.score}`,
        `${result.percentage.toFixed(1)}%`,
        `"${timeSpent}"`,
        `"${new Date(result.completedAt).toLocaleString()}"`,
        `"${new Date(result.startedAt).toLocaleString()}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${testTitle}_results.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Helper function to format time
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // Check if student can take the test (based on attempts, access code, etc.)
  static async canStudentTakeTest(shareId, studentInfo, accessCode = '') {
    try {
      const publishedTest = await this.getPublishedTestByShareId(shareId);
      if (!publishedTest) {
        return { canTake: false, reason: 'Test not found or no longer active' };
      }

      // Check access code
      if (publishedTest.settings.accessCode && publishedTest.settings.accessCode !== accessCode) {
        return { canTake: false, reason: 'Invalid access code' };
      }

      // Check attempts
      if (publishedTest.settings.maxAttempts > 0) {
        const attempts = await this.getTestAttempts(shareId);
        const studentAttempts = attempts.filter(a => 
          a.studentEmail === studentInfo.email || a.studentName === studentInfo.name
        );
        
        if (studentAttempts.length >= publishedTest.settings.maxAttempts) {
          return { canTake: false, reason: `Maximum attempts (${publishedTest.settings.maxAttempts}) reached` };
        }
      }

      return { canTake: true, reason: null };
    } catch (error) {
      console.error('Error checking student eligibility:', error);
      return { canTake: false, reason: 'Error checking eligibility' };
    }
  }
}
