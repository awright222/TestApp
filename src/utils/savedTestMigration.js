// Utility to migrate/fix saved tests with missing originalTest metadata
import { SavedTestsService } from '../SavedTestsService';
import { TestTitleInference } from './testTitleInference';

export class SavedTestMigration {
  
  /**
   * Fix a single saved test by inferring and updating its originalTest metadata
   * @param {Object} savedTest - The saved test to fix
   * @returns {Object} - Updated saved test with originalTest metadata
   */
  static fixSavedTest(savedTest) {
    // If originalTest already exists and has a title, no need to fix
    if (savedTest.originalTest && savedTest.originalTest.title) {
      return savedTest;
    }

    // Infer the original title
    const inferredTitle = TestTitleInference.inferTitle(savedTest);
    
    // Create or update the originalTest metadata
    const updatedTest = {
      ...savedTest,
      originalTest: {
        title: inferredTitle,
        color: savedTest.originalTest?.color || '#669BBC',
        csvUrl: savedTest.originalTest?.csvUrl || savedTest.csvUrl,
        isCustomTest: savedTest.originalTest?.isCustomTest || savedTest.isCustomTest,
        customTestId: savedTest.originalTest?.customTestId || savedTest.customTestId,
        // Mark as migrated so we know this was inferred
        _migrated: true,
        _migratedAt: new Date().toISOString()
      }
    };

    console.log(`🔧 Fixed saved test "${savedTest.title}":`, {
      originalTitle: savedTest.title,
      inferredTitle: inferredTitle,
      hasOriginalTest: !!savedTest.originalTest
    });

    return updatedTest;
  }

  /**
   * Fix all saved tests that need originalTest metadata
   * @returns {Promise<number>} - Number of tests fixed
   */
  static async fixAllSavedTests() {
    try {
      const savedTests = await SavedTestsService.getSavedTests();
      let fixedCount = 0;
      const updatedTests = [];

      for (const test of savedTests) {
        const needsFix = !test.originalTest || !test.originalTest.title;
        
        if (needsFix) {
          const fixedTest = this.fixSavedTest(test);
          updatedTests.push(fixedTest);
          fixedCount++;
        } else {
          updatedTests.push(test);
        }
      }

      if (fixedCount > 0) {
        // Save all tests back (this will use the appropriate storage method)
        for (const updatedTest of updatedTests) {
          if (updatedTest.originalTest && updatedTest.originalTest._migrated) {
            await SavedTestsService.saveTest(updatedTest);
          }
        }

        console.log(`✅ Fixed ${fixedCount} saved tests with missing originalTest metadata`);
      }

      return fixedCount;
    } catch (error) {
      console.error('❌ Error fixing saved tests:', error);
      return 0;
    }
  }

  /**
   * Fix a specific saved test by ID
   * @param {string} testId - The ID of the test to fix
   * @returns {Promise<boolean>} - True if fixed, false if not found or no fix needed
   */
  static async fixSavedTestById(testId) {
    try {
      const savedTests = await SavedTestsService.getSavedTests();
      const testToFix = savedTests.find(test => test.id === testId);
      
      if (!testToFix) {
        console.log(`❌ Test with ID ${testId} not found`);
        return false;
      }

      const needsFix = !testToFix.originalTest || !testToFix.originalTest.title;
      
      if (!needsFix) {
        console.log(`✅ Test "${testToFix.title}" already has proper originalTest metadata`);
        return false;
      }

      const fixedTest = this.fixSavedTest(testToFix);
      await SavedTestsService.saveTest(fixedTest);
      
      console.log(`✅ Fixed test "${testToFix.title}" (ID: ${testId})`);
      return true;
    } catch (error) {
      console.error(`❌ Error fixing test ${testId}:`, error);
      return false;
    }
  }
}
