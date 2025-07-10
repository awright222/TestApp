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
          question_text: "💡 What are two key benefits of active learning?",
          question_type: "short answer",
          choices: "retention, memory, engagement, understanding, recall, comprehension, participation, interaction",
          correct_answer: "retention, engagement",
          explanation: "Active learning improves retention by engaging students directly with the material, leading to better understanding and long-term memory formation."
        },
        {
          id: "seed-q3",
          question_text: "🖱️ Click on the elements that make learning effective:",
          question_type: "hotspot",
          choices: "Active Elements: practice, testing, feedback, interaction\nPassive Elements: reading, listening, watching, memorizing",
          correct_answer: "Active Elements: practice, Active Elements: testing, Active Elements: feedback",
          explanation: "Active learning elements like practice, testing, and feedback are more effective than passive methods for long-term retention."
        },
        {
          id: "seed-q4",
          question_text: "🔄 Match these learning tools to their purposes:",
          question_type: "drag and drop",
          choices: "Items: Flashcards, Quizzes, Essays, Projects, Discussions\nZones: Memory Practice, Knowledge Testing, Deep Thinking, Application, Collaboration",
          correct_answer: "Flashcards -> Memory Practice, Quizzes -> Knowledge Testing, Essays -> Deep Thinking, Projects -> Application, Discussions -> Collaboration",
          explanation: "Different learning tools serve different purposes: flashcards for memory, quizzes for testing, essays for analysis, projects for application, and discussions for collaboration."
        },
        {
          id: "seed-q5",
          question_text: "📝 Reflect on your learning goals. What do you hope to achieve with this platform? How do you learn best?",
          question_type: "essay",
          choices: "Consider your learning style, goals, preferred methods, and what you want to accomplish.",
          correct_answer: "Personal reflection on learning goals and preferences",
          explanation: "Self-reflection on learning goals helps you understand your preferences and create more effective study strategies tailored to your needs."
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
          question_text: "⚡ What learning technique involves explaining concepts simply?",
          question_type: "short answer",
          choices: "feynman technique, feynman method, teaching method, explain simply, rubber duck debugging, simplification",
          correct_answer: "feynman technique",
          explanation: "The Feynman Technique involves explaining concepts in simple terms as if teaching a child, helping identify knowledge gaps and deepen understanding."
        },
        {
          id: "seed-q8",
          question_text: "🎨 Select the study methods that match different learning preferences:",
          question_type: "hotspot",
          choices: "Visual Learners: diagrams, charts, mind maps, videos\nAuditory Learners: lectures, discussions, podcasts, music\nKinesthetic Learners: hands-on, experiments, movement, building",
          correct_answer: "Visual Learners: diagrams, Auditory Learners: discussions, Kinesthetic Learners: hands-on",
          explanation: "Different learners have different preferences: visual learners benefit from diagrams and charts, auditory learners from discussions and lectures, and kinesthetic learners from hands-on activities."
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
        estimatedTime: "5-8 minutes",
        questionCount: 8,
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
      questionCount: 8,
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
