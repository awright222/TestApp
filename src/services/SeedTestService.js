// SeedTestService.js - Manages automatic seed test creation for new users
export class SeedTestService {
  
  // Create the comprehensive showcase seed test
  static createShowcaseSeedTest(userId, isDemo = false) {
    const seedTest = {
      id: `seed-showcase-${userId}`,
      title: "🎓 Welcome to Formulate!",
      description: "Your starter test showcasing all question types. Try it out to see how everything works! You can delete this anytime.",
      questions: [
        {
          id: "seed-q1",
          question_text: "🎯 Welcome! What makes Formulate special?",
          question_type: "multiple choice",
          choices: "A. All question types in one platform\nB. Gamification with XP and achievements\nC. Powerful analytics and insights\nD. All of the above!",
          correct_answer: "D",
          explanation: "Formulate combines multiple question types, engaging gamification, and detailed analytics to create the ultimate learning experience!"
        },
        {
          id: "seed-q2",
          question_text: "💡 What's your favorite learning technique?",
          question_type: "short answer",
          choices: "practice, testing, reading, discussion, visual, hands-on, repetition",
          correct_answer: "practice",
          explanation: "Any learning technique you prefer is valid! Different methods work for different people."
        },
        {
          id: "seed-q3",
          question_text: "🖱️ Match these learning strategies to their benefits:",
          question_type: "hotspot",
          choices: "Active Learning: practice, testing, discussion, hands-on\nPassive Learning: reading, listening, watching, reviewing\nRetention Boost: quizzing, spaced practice, teaching others",
          correct_answer: "Active Learning: practice\nPassive Learning: reading\nRetention Boost: quizzing",
          explanation: "Active learning methods like practice are more effective than passive methods like reading, and techniques like quizzing boost retention!"
        },
        {
          id: "seed-q4",
          question_text: "🎯 Drag learning tools to their primary purposes:",
          question_type: "drag and drop",
          choices: "Items: Flashcards, Quizzes, Essays, Projects, Discussions\nZones: Memory Practice, Knowledge Testing, Deep Thinking, Application, Collaboration",
          correct_answer: "Flashcards -> Memory Practice, Quizzes -> Knowledge Testing, Essays -> Deep Thinking, Projects -> Application, Discussions -> Collaboration",
          explanation: "Each tool serves a different purpose: Flashcards for memory, Quizzes for testing knowledge, Essays for deep thinking, Projects for application, and Discussions for collaboration!"
        },
        {
          id: "seed-q5",
          question_text: "📝 What are your learning goals with this platform?",
          question_type: "essay",
          choices: "Consider your objectives, preferred learning style, and what you hope to achieve",
          correct_answer: "Personal learning goals",
          explanation: "Thank you for sharing your learning goals! Reflecting on your objectives helps create a more personalized learning experience."
        },
        {
          id: "seed-q6",
          question_text: "🧠 What is the 'Testing Effect' in learning science?",
          question_type: "multiple choice",
          choices: "A. Tests make students anxious\nB. Retrieval practice strengthens memory\nC. Multiple choice is the best format\nD. Testing should be avoided",
          correct_answer: "B",
          explanation: "The Testing Effect shows that actively retrieving information from memory (like taking this quiz!) strengthens neural pathways and improves long-term retention."
        },
        {
          id: "seed-q5",
          question_text: "🎨 Select the best study techniques for different learning goals:",
          question_type: "hotspot",
          choices: "Memory Building: flashcards, repetition, mnemonics\nUnderstanding: explanation, examples, connections\nApplication: practice problems, projects, real-world use",
          correct_answer: "Memory Building: flashcards\nUnderstanding: explanation\nApplication: practice problems",
          explanation: "Different goals require different techniques: flashcards for memory, explanations for understanding, and practice problems for application!"
        },
        {
          id: "seed-q6",
          question_text: "🧠 Which learning principle explains why testing helps memory?",
          question_type: "multiple choice",
          choices: "A. Spacing Effect - spreading learning over time\nB. Testing Effect - retrieval strengthens memory\nC. Elaboration Effect - connecting to prior knowledge\nD. Generation Effect - creating rather than reading",
          correct_answer: "B",
          explanation: "The Testing Effect shows that actively retrieving information from memory (like taking this quiz!) strengthens neural pathways and improves long-term retention."
        },
        {
          id: "seed-q7",
          question_text: "🎨 Select the best study techniques for different learning goals:",
          question_type: "hotspot",
          choices: "Memory Building: flashcards, repetition, mnemonics\nUnderstanding: explanation, examples, connections\nApplication: practice problems, projects, real-world use",
          correct_answer: "Memory Building: flashcards\nUnderstanding: explanation\nApplication: practice problems",
          explanation: "Different goals require different techniques: flashcards for memory, explanations for understanding, and practice problems for application!"
        }
      ],
      settings: {
        timeLimit: 0,
        showExplanations: true,
        showCorrectAnswers: true,
        passingScore: 60,
        allowReview: true,
        showResults: true,
        randomizeQuestions: false,
        randomizeChoices: false,
        accessCode: null, // No access code required
        isPublic: true // Make it publicly accessible
      },
      metadata: {
        tags: ["welcome", "tutorial", "showcase", "seed", "demo"],
        difficulty: "Beginner",
        estimatedTime: "5-7 minutes",
        questionCount: 7,
        category: "Getting Started",
        isSeedTest: true,
        isWelcomeTest: true,
        canDelete: true,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      visual: {
        icon: "🎓",
        color: "#4A90E2",
        coverImage: null
      },
      source: isDemo ? "demo-seed" : "seed",
      type: "practice", // Set as practice type to bypass access code requirement
      isActive: true,
      // Additional properties for PublishedTestsService compatibility
      shareId: this.generateShareId(),
      publishedAt: new Date().toISOString(),
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      questionCount: 7,
      createdAt: new Date().toISOString()
    };

    return seedTest;
  }

  // Create additional sample tests for demo users
  static createDemoSampleTests(userId, accountType) {
    const tests = [];

    if (accountType === 'teacher' || accountType === 'admin') {
      // Advanced Math Quiz for teachers/admins
      tests.push({
        id: `demo-math-${userId}`,
        title: "📐 Sample: Advanced Math Quiz",
        description: "A demonstration of math-focused questions with various difficulty levels.",
        questions: [
          {
            id: "math-q1",
            question_text: "Solve: 2x + 5 = 13",
            question_type: "short answer",
            choices: "4, x=4, x = 4, four",
            correct_answer: "4",
            explanation: "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4"
          },
          {
            id: "math-q2",
            question_text: "What is the area of a triangle with base 8 and height 6?",
            question_type: "multiple choice",
            choices: "A. 24\nB. 48\nC. 14\nD. 28",
            correct_answer: "A",
            explanation: "Area = (1/2) × base × height = (1/2) × 8 × 6 = 24"
          }
        ],
        metadata: {
          isSeedTest: true,
          isDemoSample: true,
          category: "Mathematics",
          questionCount: 2,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        visual: {
          icon: "📐",
          color: "#FF6B6B"
        },
        settings: {
          timeLimit: 10,
          showExplanations: true,
          passingScore: 70,
          accessCode: null,
          isPublic: true
        },
        // Additional properties for PublishedTestsService compatibility
        shareId: this.generateShareId(),
        publishedAt: new Date().toISOString(),
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        questionCount: 2,
        type: "practice", // Set as practice type to bypass access code requirement
        isActive: true
      });

      // Science Quiz
      tests.push({
        id: `demo-science-${userId}`,
        title: "🔬 Sample: Quick Science Check",
        description: "Basic science concepts with interactive elements.",
        questions: [
          {
            id: "sci-q1",
            question_text: "🖱️ Click on the renewable energy sources:",
            question_type: "hotspot",
            choices: "Renewable: solar, wind, hydro, geothermal\nNon-renewable: coal, oil, natural gas, nuclear",
            correct_answer: "Renewable: solar, Renewable: wind, Renewable: hydro",
            explanation: "Solar, wind, and hydro are renewable because they naturally replenish themselves."
          }
        ],
        metadata: {
          isSeedTest: true,
          isDemoSample: true,
          category: "Science",
          questionCount: 1,
          createdBy: userId,
          createdAt: new Date().toISOString()
        },
        visual: {
          icon: "🔬",
          color: "#4ECDC4"
        },
        settings: {
          timeLimit: 5,
          showExplanations: true,
          passingScore: 60,
          accessCode: null,
          isPublic: true
        },
        // Additional properties for PublishedTestsService compatibility
        shareId: this.generateShareId(),
        publishedAt: new Date().toISOString(),
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        questionCount: 1,
        type: "practice", // Set as practice type to bypass access code requirement
        isActive: true
      });
    }

    return tests;
  }

  // Initialize user with seed tests
  static async initializeUserWithSeedTests(userId, accountType, isDemo = false) {
    try {
      const tests = [];
      
      // Always add ONLY the main showcase test (no additional demo tests)
      const showcaseTest = this.createShowcaseSeedTest(userId, isDemo);
      tests.push(showcaseTest);
      
      // Remove the additional sample tests to keep it simple
      // if (accountType === 'teacher' || accountType === 'admin') {
      //   const sampleTests = this.createDemoSampleTests(userId, accountType);
      //   tests.push(...sampleTests);
      // }

      // Add to appropriate storage
      if (isDemo) {
        // For demo users, store in localStorage with demo prefix
        const demoKey = `demo_tests_${userId}`;
        localStorage.setItem(demoKey, JSON.stringify(tests));
        
        // Also add to regular published_tests for immediate visibility
        const publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
        tests.forEach(test => {
          if (!publishedTests.find(t => t.id === test.id)) {
            publishedTests.unshift(test);
          }
        });
        localStorage.setItem('published_tests', JSON.stringify(publishedTests));
      } else {
        // For real users, use the regular saved tests service
        const { SavedTestsService } = await import('../SavedTestsService');
        
        for (const test of tests) {
          try {
            await SavedTestsService.saveTest({
              ...test,
              type: 'practice-test',
              progress: {
                current: 0,
                completed: [],
                answers: {},
                totalQuestions: test.questions.length,
                completedQuestions: 0
              }
            });
          } catch (error) {
            console.warn('Failed to save seed test:', test.title, error);
          }
        }
      }

      console.log(`✅ Initialized ${tests.length} seed tests for ${isDemo ? 'demo' : 'real'} user:`, userId);
      return tests;
      
    } catch (error) {
      console.error('Error initializing seed tests:', error);
      return [];
    }
  }

  // Clean up demo data when demo session ends
  static cleanupDemoData(userId) {
    try {
      // Remove demo-specific data
      const demoKey = `demo_tests_${userId}`;
      localStorage.removeItem(demoKey);
      
      // Remove demo XP data
      localStorage.removeItem(`user_xp_data_${userId}`);
      
      // Remove demo achievements
      localStorage.removeItem(`user_achievements_${userId}`);
      
      // Clean up published tests (remove demo tests)
      const publishedTests = JSON.parse(localStorage.getItem('published_tests') || '[]');
      const cleanedTests = publishedTests.filter(test => 
        !test.id.includes(userId) && !test.metadata?.isDemoSample
      );
      localStorage.setItem('published_tests', JSON.stringify(cleanedTests));
      
      console.log('✅ Demo data cleaned up for user:', userId);
    } catch (error) {
      console.warn('Error cleaning demo data:', error);
    }
  }

  // Check if user has seed tests (to avoid duplicates)
  static async userHasSeedTests(userId) {
    try {
      const { SavedTestsService } = await import('../SavedTestsService');
      const savedTests = await SavedTestsService.getSavedTests();
      
      return savedTests.some(test => 
        test.metadata?.isSeedTest && test.metadata?.createdBy === userId
      );
    } catch (error) {
      console.warn('Error checking for seed tests:', error);
      return false;
    }
  }

  // Generate a unique share ID (for PublishedTestsService compatibility)
  static generateShareId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default SeedTestService;
