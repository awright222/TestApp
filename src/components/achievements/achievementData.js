// Achievement definitions with SVG badges
export const ACHIEVEMENTS = {
  // Test Taking Achievements
  FIRST_TEST: {
    id: 'first_test',
    title: 'First Steps',
    description: 'Completed your first test',
    requirement: 'Complete 1 test',
    type: 'test_taking',
    rarity: 'bronze',
    points: 10,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Bronze Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#bronzeGradient)" stroke="#8B5A2B" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#3C2F2F" stroke="#A67B5B" stroke-width="4"/>
        <!-- Scroll Icon in Center -->
        <path d="M70 80H130V120H70V80ZM60 80H70V70C70 65 65 60 60 60H50V140H60C65 140 70 135 70 130V120H60V80Z" fill="url(#scrollGradient)"/>
        <path d="M130 80H140V70C140 65 135 60 130 60H120V140H130C135 140 140 135 140 130V120H130V80Z" fill="url(#scrollGradient)"/>
        <!-- Checkmark for First Achievement -->
        <path d="M85 100L95 110L115 85" stroke="#FFD700" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Number "1" for Progression -->
        <text x="100" y="150" font-family="Arial" font-size="20" fill="#FFD700" text-anchor="middle" font-weight="bold">1</text>
        <!-- Ribbon at Bottom -->
        <path d="M60 160L80 175H120L140 160H60Z" fill="url(#ribbonGradient)" stroke="#8B5A2B" stroke-width="2"/>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.4"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="bronzeGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D4A017"/>
            <stop offset="1" stop-color="#8B5A2B"/>
          </linearGradient>
          <linearGradient id="scrollGradient" x1="50" y1="60" x2="150" y2="140" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#A67B5B"/>
          </linearGradient>
          <linearGradient id="ribbonGradient" x1="60" y1="150" x2="140" y2="170" gradientUnits="userSpaceOnUse">
            <stop stop-color="#8B0000"/>
            <stop offset="1" stop-color="#B22222"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  PERFECT_SCORE: {
    id: 'perfect_score',
    title: 'Perfectionist',
    description: 'Achieved 100% on a test',
    requirement: 'Score 100% on any test',
    type: 'performance',
    rarity: 'gold',
    points: 50,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Gold Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#goldGradient)" stroke="#B8860B" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="15s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#4A4A4A" stroke="#DAA520" stroke-width="4"/>
        <!-- Crown Icon in Center -->
        <path d="M70 85L80 70L90 80L100 65L110 80L120 70L130 85V95H70V85Z" fill="url(#crownGradient)" stroke="#B8860B" stroke-width="2"/>
        <circle cx="80" cy="70" r="4" fill="#FF6B6B"/>
        <circle cx="100" cy="65" r="5" fill="#4ECDC4"/>
        <circle cx="120" cy="70" r="4" fill="#FF6B6B"/>
        <!-- "100" Text -->
        <text x="100" y="125" font-family="Arial" font-size="24" fill="#FFD700" text-anchor="middle" font-weight="bold">100</text>
        <text x="100" y="145" font-family="Arial" font-size="12" fill="#FFD700" text-anchor="middle">PERFECT</text>
        <!-- Star Decorations -->
        <path d="M60 50L65 60L75 60L67 67L70 77L60 72L50 77L53 67L45 60L55 60Z" fill="#FFD700"/>
        <path d="M140 50L145 60L155 60L147 67L150 77L140 72L130 77L133 67L125 60L135 60Z" fill="#FFD700"/>
        <!-- Ribbon at Bottom -->
        <path d="M60 160L80 175H120L140 160H60Z" fill="url(#goldRibbonGradient)" stroke="#B8860B" stroke-width="2"/>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.6"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="goldGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#B8860B"/>
          </linearGradient>
          <linearGradient id="crownGradient" x1="70" y1="65" x2="130" y2="95" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#DAA520"/>
          </linearGradient>
          <linearGradient id="goldRibbonGradient" x1="60" y1="160" x2="140" y2="175" gradientUnits="userSpaceOnUse">
            <stop stop-color="#DAA520"/>
            <stop offset="1" stop-color="#B8860B"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  SPEEDSTER: {
    id: 'speedster',
    title: 'Lightning Fast',
    description: 'Completed a test in record time',
    requirement: 'Complete a test under 2 minutes',
    type: 'performance',
    rarity: 'silver',
    points: 30,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Silver Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#silverGradient)" stroke="#708090" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="10s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#2F2F2F" stroke="#C0C0C0" stroke-width="4"/>
        <!-- Lightning Bolt Icon -->
        <path d="M85 60L110 60L95 100L115 100L90 140L105 100L85 100L100 60Z" fill="url(#lightningGradient)" stroke="#FFD700" stroke-width="2"/>
        <!-- Wings -->
        <path d="M60 90C50 85 45 80 50 75C55 70 65 75 70 80L85 90" fill="url(#wingGradient)" stroke="#C0C0C0" stroke-width="1"/>
        <path d="M140 90C150 85 155 80 150 75C145 70 135 75 130 80L115 90" fill="url(#wingGradient)" stroke="#C0C0C0" stroke-width="1"/>
        <!-- Speed Lines -->
        <path d="M40 120L60 120M40 130L55 130M40 110L65 110" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
        <path d="M160 120L140 120M160 130L145 130M160 110L135 110" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
        <!-- Ribbon at Bottom -->
        <path d="M60 160L80 175H120L140 160H60Z" fill="url(#silverRibbonGradient)" stroke="#708090" stroke-width="2"/>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.5"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="silverGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F8F8FF"/>
            <stop offset="1" stop-color="#708090"/>
          </linearGradient>
          <linearGradient id="lightningGradient" x1="85" y1="60" x2="115" y2="140" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#FFA500"/>
          </linearGradient>
          <linearGradient id="wingGradient" x1="50" y1="75" x2="85" y2="90" gradientUnits="userSpaceOnUse">
            <stop stop-color="#E6E6FA"/>
            <stop offset="1" stop-color="#C0C0C0"/>
          </linearGradient>
          <linearGradient id="silverRibbonGradient" x1="60" y1="160" x2="140" y2="175" gradientUnits="userSpaceOnUse">
            <stop stop-color="#C0C0C0"/>
            <stop offset="1" stop-color="#708090"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  QUIZ_MASTER: {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Achieved top scores on 5 different tests',
    requirement: 'Score 90%+ on 5 tests',
    type: 'mastery',
    rarity: 'platinum',
    points: 100,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Platinum Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#platinumGradient)" stroke="#4A4A4A" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="25s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#1A1A1A" stroke="#E5E4E2" stroke-width="4"/>
        <!-- Shield Shape -->
        <path d="M100 30L130 50V90C130 110 115 130 100 140C85 130 70 110 70 90V50L100 30Z" fill="url(#shieldGradient)" stroke="#4A4A4A" stroke-width="3"/>
        <!-- Pencil/Quill Icon -->
        <path d="M90 70L110 70L108 90L92 90Z" fill="url(#pencilGradient)"/>
        <circle cx="100" cy="65" r="8" fill="#FFD700"/>
        <path d="M95 65L105 65" stroke="#4A4A4A" stroke-width="2"/>
        <!-- Stars around shield -->
        <path d="M85 45L87 50L92 50L88 53L90 58L85 55L80 58L82 53L78 50L83 50Z" fill="#FFD700"/>
        <path d="M115 45L117 50L122 50L118 53L120 58L115 55L110 58L112 53L108 50L113 50Z" fill="#FFD700"/>
        <path d="M75 75L77 80L82 80L78 83L80 88L75 85L70 88L72 83L68 80L73 80Z" fill="#FFD700"/>
        <path d="M125 75L127 80L132 80L128 83L130 88L125 85L120 88L122 83L118 80L123 80Z" fill="#FFD700"/>
        <!-- Number "5" -->
        <text x="100" y="155" font-family="Arial" font-size="18" fill="#E5E4E2" text-anchor="middle" font-weight="bold">5</text>
        <!-- Ribbon at Bottom -->
        <path d="M60 165L80 180H120L140 165H60Z" fill="url(#platinumRibbonGradient)" stroke="#4A4A4A" stroke-width="2"/>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.7"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="platinumGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#E5E4E2"/>
            <stop offset="1" stop-color="#4A4A4A"/>
          </linearGradient>
          <linearGradient id="shieldGradient" x1="70" y1="30" x2="130" y2="140" gradientUnits="userSpaceOnUse">
            <stop stop-color="#E5E4E2"/>
            <stop offset="1" stop-color="#A9A9A9"/>
          </linearGradient>
          <linearGradient id="pencilGradient" x1="90" y1="70" x2="110" y2="90" gradientUnits="userSpaceOnUse">
            <stop stop-color="#8B4513"/>
            <stop offset="1" stop-color="#D2691E"/>
          </linearGradient>
          <linearGradient id="platinumRibbonGradient" x1="60" y1="165" x2="140" y2="180" gradientUnits="userSpaceOnUse">
            <stop stop-color="#E5E4E2"/>
            <stop offset="1" stop-color="#4A4A4A"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  STREAK_STARTER: {
    id: 'streak_starter',
    title: 'On a Roll',
    description: 'Tested for 3 consecutive days',
    requirement: 'Take tests 3 days in a row',
    type: 'consistency',
    rarity: 'green',
    points: 40,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Green Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#greenGradient)" stroke="#228B22" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="18s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#2F4F2F" stroke="#32CD32" stroke-width="4"/>
        <!-- Chain Links -->
        <ellipse cx="80" cy="85" rx="12" ry="8" fill="none" stroke="#FFD700" stroke-width="4"/>
        <ellipse cx="100" cy="100" rx="12" ry="8" fill="none" stroke="#FFD700" stroke-width="4"/>
        <ellipse cx="120" cy="115" rx="12" ry="8" fill="none" stroke="#FFD700" stroke-width="4"/>
        <!-- Calendar Icon -->
        <rect x="85" y="60" width="30" height="25" fill="url(#calendarGradient)" stroke="#228B22" stroke-width="2" rx="3"/>
        <rect x="85" y="65" width="30" height="5" fill="#32CD32"/>
        <circle cx="90" cy="72" r="2" fill="#FFD700"/>
        <circle cx="100" cy="72" r="2" fill="#FFD700"/>
        <circle cx="110" cy="72" r="2" fill="#FFD700"/>
        <circle cx="90" cy="78" r="2" fill="#228B22"/>
        <circle cx="100" cy="78" r="2" fill="#228B22"/>
        <circle cx="110" cy="78" r="2" fill="#228B22"/>
        <!-- Sparkle Effects -->
        <path d="M65 65L67 70L72 70L68 73L70 78L65 75L60 78L62 73L58 70L63 70Z" fill="#90EE90"/>
        <path d="M135 135L137 140L142 140L138 143L140 148L135 145L130 148L132 143L128 140L133 140Z" fill="#90EE90"/>
        <!-- Number "3" -->
        <text x="100" y="150" font-family="Arial" font-size="20" fill="#FFD700" text-anchor="middle" font-weight="bold">3</text>
        <!-- Ribbon at Bottom -->
        <path d="M60 160L80 175H120L140 160H60Z" fill="url(#greenRibbonGradient)" stroke="#228B22" stroke-width="2"/>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.5"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="greenGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#90EE90"/>
            <stop offset="1" stop-color="#228B22"/>
          </linearGradient>
          <linearGradient id="calendarGradient" x1="85" y1="60" x2="115" y2="85" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F5F5F5"/>
            <stop offset="1" stop-color="#E0E0E0"/>
          </linearGradient>
          <linearGradient id="greenRibbonGradient" x1="60" y1="160" x2="140" y2="175" gradientUnits="userSpaceOnUse">
            <stop stop-color="#32CD32"/>
            <stop offset="1" stop-color="#228B22"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  TEST_CREATOR: {
    id: 'test_creator',
    title: 'Test Architect',
    description: 'Created your first custom test',
    requirement: 'Create 1 test with the test builder',
    type: 'creation',
    rarity: 'bronze',
    points: 25,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Bronze Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#bronzeGradient)" stroke="#8B5A2B" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="22s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#3C2F2F" stroke="#A67B5B" stroke-width="4"/>
        <!-- Hammer and Tools -->
        <path d="M85 75L95 65L105 75L100 80L90 80Z" fill="url(#hammerGradient)" stroke="#8B5A2B" stroke-width="2"/>
        <rect x="98" y="80" width="4" height="25" fill="#8B4513"/>
        <!-- Blueprints/Papers -->
        <rect x="75" y="90" width="50" height="35" fill="url(#paperGradient)" stroke="#4682B4" stroke-width="2" rx="3"/>
        <path d="M80 95L120 95M80 100L115 100M80 105L118 105M80 110L110 110M80 115L120 115" stroke="#4682B4" stroke-width="1"/>
        <!-- Ruler/Measurement Tool -->
        <rect x="70" y="85" width="25" height="3" fill="#FFD700"/>
        <path d="M70 85L70 88M75 85L75 88M80 85L80 88M85 85L85 88M90 85L90 88M95 85L95 88" stroke="#B8860B" stroke-width="1"/>
        <!-- Gear/Cog -->
        <circle cx="115" cy="75" r="8" fill="none" stroke="#A67B5B" stroke-width="3"/>
        <circle cx="115" cy="75" r="4" fill="#A67B5B"/>
        <path d="M107 75L123 75M115 67L115 83M110 69L120 81M120 69L110 81" stroke="#A67B5B" stroke-width="2"/>
        <!-- Number "1" -->
        <text x="100" y="150" font-family="Arial" font-size="18" fill="#FFD700" text-anchor="middle" font-weight="bold">1</text>
        <!-- Ribbon at Bottom -->
        <path d="M60 160L80 175H120L140 160H60Z" fill="url(#ribbonGradient)" stroke="#8B5A2B" stroke-width="2"/>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.4"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="bronzeGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D4A017"/>
            <stop offset="1" stop-color="#8B5A2B"/>
          </linearGradient>
          <linearGradient id="hammerGradient" x1="85" y1="65" x2="105" y2="80" gradientUnits="userSpaceOnUse">
            <stop stop-color="#C0C0C0"/>
            <stop offset="1" stop-color="#808080"/>
          </linearGradient>
          <linearGradient id="paperGradient" x1="75" y1="90" x2="125" y2="125" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F8F8FF"/>
            <stop offset="1" stop-color="#E6E6FA"/>
          </linearGradient>
          <linearGradient id="ribbonGradient" x1="60" y1="160" x2="140" y2="175" gradientUnits="userSpaceOnUse">
            <stop stop-color="#8B0000"/>
            <stop offset="1" stop-color="#B22222"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  // Advanced Performance Achievements
  SCHOLAR: {
    id: 'scholar',
    title: 'Scholar',
    description: 'Completed 50 tests',
    requirement: 'Complete 50 tests',
    type: 'mastery',
    rarity: 'platinum',
    points: 200,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Platinum Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#platinumGradient)" stroke="#A0A0A0" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="25s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#2A2A2A" stroke="#E5E4E2" stroke-width="4"/>
        <!-- Graduation Cap -->
        <path d="M100 60L75 75L100 90L125 75L100 60Z" fill="url(#capGradient)" stroke="#E5E4E2" stroke-width="2"/>
        <path d="M100 60L100 90L125 75L130 85L100 100L70 85L75 75L100 60Z" fill="url(#capGradient)" stroke="#E5E4E2" stroke-width="2"/>
        <!-- Diploma Scroll -->
        <path d="M80 110H120V140H80V110Z" fill="url(#scrollGradient)" stroke="#E5E4E2" stroke-width="1"/>
        <path d="M75 110H80V105C80 102 78 100 75 100H70V150H75C78 150 80 148 80 145V140H75V110Z" fill="url(#scrollGradient)"/>
        <path d="M120 110H125V105C125 102 123 100 120 100H125V150H120C123 150 125 148 125 145V140H120V110Z" fill="url(#scrollGradient)"/>
        <!-- "50" Text -->
        <text x="100" y="160" font-family="Arial" font-size="20" fill="#E5E4E2" text-anchor="middle" font-weight="bold">50</text>
        <!-- Stars -->
        <path d="M60 40L65 50L75 50L67 57L70 67L60 62L50 67L53 57L45 50L55 50Z" fill="#FFD700"/>
        <path d="M140 40L145 50L155 50L147 57L150 67L140 62L130 67L133 57L125 50L135 50Z" fill="#FFD700"/>
        <path d="M100 25L105 35L115 35L107 42L110 52L100 47L90 52L93 42L85 35L95 35Z" fill="#FFD700"/>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.6"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="platinumGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F8F8FF"/>
            <stop offset="1" stop-color="#A0A0A0"/>
          </linearGradient>
          <linearGradient id="capGradient" x1="75" y1="60" x2="125" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="#E5E4E2"/>
            <stop offset="1" stop-color="#A0A0A0"/>
          </linearGradient>
          <linearGradient id="scrollGradient" x1="70" y1="100" x2="130" y2="150" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFF8DC"/>
            <stop offset="1" stop-color="#E5E4E2"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  PERFECTIONIST: {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieved 10 perfect scores',
    requirement: 'Get 100% on 10 different tests',
    type: 'performance',
    rarity: 'gold',
    points: 150,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Gold Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#goldGradient)" stroke="#B8860B" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="18s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#4A4A4A" stroke="#DAA520" stroke-width="4"/>
        <!-- Diamond Shape -->
        <path d="M100 50L130 100L100 150L70 100Z" fill="url(#diamondGradient)" stroke="#B8860B" stroke-width="3"/>
        <!-- Inner Diamond -->
        <path d="M100 70L115 100L100 130L85 100Z" fill="url(#innerDiamondGradient)" stroke="#DAA520" stroke-width="2"/>
        <!-- Perfect "10" Text -->
        <text x="100" y="110" font-family="Arial" font-size="18" fill="#FFF" text-anchor="middle" font-weight="bold">10</text>
        <!-- Crown on Top -->
        <path d="M85 45L95 35L105 45L115 35L125 45V55H85V45Z" fill="url(#crownGradient)" stroke="#B8860B" stroke-width="2"/>
        <circle cx="95" cy="35" r="3" fill="#FF6B6B"/>
        <circle cx="105" cy="35" r="3" fill="#4ECDC4"/>
        <circle cx="115" cy="35" r="3" fill="#FF6B6B"/>
        <!-- Sparkles -->
        <circle cx="130" cy="80" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="70" cy="80" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="130" cy="120" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="70" cy="120" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.6"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="goldGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#B8860B"/>
          </linearGradient>
          <linearGradient id="diamondGradient" x1="70" y1="50" x2="130" y2="150" gradientUnits="userSpaceOnUse">
            <stop stop-color="#E6E6FA"/>
            <stop offset="1" stop-color="#9370DB"/>
          </linearGradient>
          <linearGradient id="innerDiamondGradient" x1="85" y1="70" x2="115" y2="130" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFF8DC"/>
            <stop offset="1" stop-color="#DDA0DD"/>
          </linearGradient>
          <linearGradient id="crownGradient" x1="85" y1="35" x2="125" y2="55" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#DAA520"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  SPEED_DEMON: {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed 5 tests under 1 minute',
    requirement: 'Complete 5 tests in under 60 seconds each',
    type: 'performance',
    rarity: 'silver',
    points: 100,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Silver Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#silverGradient)" stroke="#708090" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#2F2F2F" stroke="#C0C0C0" stroke-width="4"/>
        <!-- Flame Shape -->
        <path d="M100 60C120 60 130 80 125 100C130 120 120 140 100 140C80 140 70 120 75 100C70 80 80 60 100 60Z" fill="url(#flameGradient)" stroke="#FF4500" stroke-width="2"/>
        <!-- Inner Flame -->
        <path d="M100 75C110 75 115 90 112 105C115 120 110 125 100 125C90 125 85 120 88 105C85 90 90 75 100 75Z" fill="url(#innerFlameGradient)" stroke="#FFD700" stroke-width="1"/>
        <!-- Lightning Bolts -->
        <path d="M60 90L70 90L65 110L75 110L60 130L70 115L65 115L70 95" fill="url(#lightningGradient)" stroke="#FFD700" stroke-width="1"/>
        <path d="M140 90L130 90L135 110L125 110L140 130L130 115L135 115L130 95" fill="url(#lightningGradient)" stroke="#FFD700" stroke-width="1"/>
        <!-- Speed Lines -->
        <path d="M30 100L50 100M30 110L45 110M30 90L55 90" stroke="#FFD700" stroke-width="4" stroke-linecap="round">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatCount="indefinite"/>
        </path>
        <path d="M170 100L150 100M170 110L155 110M170 90L145 90" stroke="#FFD700" stroke-width="4" stroke-linecap="round">
          <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite"/>
        </path>
        <!-- "5" Text -->
        <text x="100" y="160" font-family="Arial" font-size="20" fill="#FFD700" text-anchor="middle" font-weight="bold">5</text>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.5"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="silverGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F8F8FF"/>
            <stop offset="1" stop-color="#708090"/>
          </linearGradient>
          <linearGradient id="flameGradient" x1="100" y1="60" x2="100" y2="140" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="0.5" stop-color="#FF4500"/>
            <stop offset="1" stop-color="#8B0000"/>
          </linearGradient>
          <linearGradient id="innerFlameGradient" x1="100" y1="75" x2="100" y2="125" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFF00"/>
            <stop offset="1" stop-color="#FF6347"/>
          </linearGradient>
          <linearGradient id="lightningGradient" x1="60" y1="90" x2="75" y2="130" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#FFA500"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Completed tests after 10 PM',
    requirement: 'Complete 5 tests after 10 PM',
    type: 'consistency',
    rarity: 'bronze',
    points: 50,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Dark Blue Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#nightGradient)" stroke="#2F4F4F" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="30s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#1A1A1A" stroke="#4682B4" stroke-width="4"/>
        <!-- Owl Body -->
        <ellipse cx="100" cy="110" rx="30" ry="35" fill="url(#owlGradient)" stroke="#4682B4" stroke-width="2"/>
        <!-- Owl Head -->
        <circle cx="100" cy="80" r="25" fill="url(#owlGradient)" stroke="#4682B4" stroke-width="2"/>
        <!-- Owl Eyes -->
        <circle cx="90" cy="75" r="8" fill="#FFD700"/>
        <circle cx="110" cy="75" r="8" fill="#FFD700"/>
        <circle cx="90" cy="75" r="4" fill="#000"/>
        <circle cx="110" cy="75" r="4" fill="#000"/>
        <!-- Owl Beak -->
        <path d="M100 85L95 90L105 90Z" fill="#FFA500"/>
        <!-- Owl Ears -->
        <path d="M80 60L85 70L75 70Z" fill="url(#owlGradient)" stroke="#4682B4" stroke-width="1"/>
        <path d="M120 60L125 70L115 70Z" fill="url(#owlGradient)" stroke="#4682B4" stroke-width="1"/>
        <!-- Moon -->
        <circle cx="140" cy="50" r="15" fill="url(#moonGradient)"/>
        <circle cx="145" cy="45" r="12" fill="url(#nightGradient)"/>
        <!-- Stars -->
        <circle cx="60" cy="40" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="160" cy="70" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="120" r="2" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <!-- Clock showing 10 PM -->
        <circle cx="100" cy="160" r="12" fill="url(#clockGradient)" stroke="#4682B4" stroke-width="2"/>
        <line x1="100" y1="160" x2="100" y2="152" stroke="#000" stroke-width="2"/>
        <line x1="100" y1="160" x2="108" y2="160" stroke="#000" stroke-width="2"/>
        <text x="100" y="180" font-family="Arial" font-size="10" fill="#4682B4" text-anchor="middle" font-weight="bold">10PM</text>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.3"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="nightGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#191970"/>
            <stop offset="1" stop-color="#2F4F4F"/>
          </linearGradient>
          <linearGradient id="owlGradient" x1="70" y1="60" x2="130" y2="140" gradientUnits="userSpaceOnUse">
            <stop stop-color="#D2B48C"/>
            <stop offset="1" stop-color="#8B4513"/>
          </linearGradient>
          <linearGradient id="moonGradient" x1="125" y1="35" x2="155" y2="65" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFACD"/>
            <stop offset="1" stop-color="#F0E68C"/>
          </linearGradient>
          <linearGradient id="clockGradient" x1="88" y1="148" x2="112" y2="172" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F5F5DC"/>
            <stop offset="1" stop-color="#D3D3D3"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Completed tests before 7 AM',
    requirement: 'Complete 5 tests before 7 AM',
    type: 'consistency',
    rarity: 'bronze',
    points: 50,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Sunrise Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#sunriseGradient)" stroke="#FF8C00" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="25s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#2F2F2F" stroke="#FFA500" stroke-width="4"/>
        <!-- Bird Body -->
        <ellipse cx="100" cy="110" rx="25" ry="20" fill="url(#birdGradient)" stroke="#FF8C00" stroke-width="2"/>
        <!-- Bird Head -->
        <circle cx="100" cy="85" r="18" fill="url(#birdGradient)" stroke="#FF8C00" stroke-width="2"/>
        <!-- Bird Beak -->
        <path d="M118 85L128 82L125 88Z" fill="#FFA500"/>
        <!-- Bird Eye -->
        <circle cx="108" cy="80" r="4" fill="#000"/>
        <circle cx="108" cy="78" r="1" fill="#FFF"/>
        <!-- Bird Wings -->
        <path d="M85 105C75 100 70 110 80 115C85 118 90 115 85 105Z" fill="url(#wingGradient)" stroke="#FF8C00" stroke-width="1"/>
        <path d="M115 105C125 100 130 110 120 115C115 118 110 115 115 105Z" fill="url(#wingGradient)" stroke="#FF8C00" stroke-width="1"/>
        <!-- Sun -->
        <circle cx="140" cy="50" r="20" fill="url(#sunGradient)"/>
        <!-- Sun rays -->
        <g stroke="#FFD700" stroke-width="3" stroke-linecap="round">
          <line x1="140" y1="20" x2="140" y2="30"/>
          <line x1="140" y1="70" x2="140" y2="80"/>
          <line x1="110" y1="50" x2="120" y2="50"/>
          <line x1="160" y1="50" x2="170" y2="50"/>
          <line x1="125" y1="35" x2="130" y2="40"/>
          <line x1="150" y1="60" x2="155" y2="65"/>
          <line x1="155" y1="35" x2="150" y2="40"/>
          <line x1="125" y1="65" x2="130" y2="60"/>
        </g>
        <!-- Worm -->
        <path d="M60 140C65 138 70 142 75 140C80 138 85 142 90 140" stroke="#8B4513" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Clock showing 7 AM -->
        <circle cx="100" cy="160" r="12" fill="url(#clockGradient)" stroke="#FF8C00" stroke-width="2"/>
        <line x1="100" y1="160" x2="100" y2="152" stroke="#000" stroke-width="2"/>
        <line x1="100" y1="160" x2="106" y2="156" stroke="#000" stroke-width="2"/>
        <text x="100" y="180" font-family="Arial" font-size="10" fill="#FF8C00" text-anchor="middle" font-weight="bold">7AM</text>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.6"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="sunriseGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#FF8C00"/>
          </linearGradient>
          <linearGradient id="birdGradient" x1="75" y1="70" x2="125" y2="125" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FF6347"/>
            <stop offset="1" stop-color="#8B0000"/>
          </linearGradient>
          <linearGradient id="wingGradient" x1="70" y1="100" x2="130" y2="120" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FF7F50"/>
            <stop offset="1" stop-color="#CD5C5C"/>
          </linearGradient>
          <linearGradient id="sunGradient" x1="120" y1="30" x2="160" y2="70" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFF00"/>
            <stop offset="1" stop-color="#FFD700"/>
          </linearGradient>
          <linearGradient id="clockGradient" x1="88" y1="148" x2="112" y2="172" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F5F5DC"/>
            <stop offset="1" stop-color="#D3D3D3"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Tried tests from 5 different subjects',
    requirement: 'Complete tests from 5 different categories',
    type: 'exploration',
    rarity: 'green',
    points: 75,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Green Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#greenGradient)" stroke="#228B22" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#2F2F2F" stroke="#32CD32" stroke-width="4"/>
        <!-- Open Book -->
        <path d="M70 80L70 130L100 125L130 130L130 80L100 85L70 80Z" fill="url(#bookGradient)" stroke="#228B22" stroke-width="2"/>
        <line x1="100" y1="85" x2="100" y2="125" stroke="#228B22" stroke-width="2"/>
        <!-- Book Pages -->
        <path d="M75 85L95 87L95 120L75 125" stroke="#32CD32" stroke-width="1" fill="none"/>
        <path d="M105 87L125 85L125 125L105 120" stroke="#32CD32" stroke-width="1" fill="none"/>
        <!-- Subject Icons around the circle -->
        <!-- Math -->
        <text x="100" y="45" font-family="Arial" font-size="16" fill="#32CD32" text-anchor="middle" font-weight="bold">π</text>
        <!-- Science -->
        <text x="155" y="85" font-family="Arial" font-size="16" fill="#32CD32" text-anchor="middle" font-weight="bold">⚗</text>
        <!-- Literature -->
        <text x="155" y="125" font-family="Arial" font-size="16" fill="#32CD32" text-anchor="middle" font-weight="bold">📚</text>
        <!-- History -->
        <text x="100" y="165" font-family="Arial" font-size="16" fill="#32CD32" text-anchor="middle" font-weight="bold">🏛</text>
        <!-- Art -->
        <text x="45" y="125" font-family="Arial" font-size="16" fill="#32CD32" text-anchor="middle" font-weight="bold">🎨</text>
        <!-- Geography -->
        <text x="45" y="85" font-family="Arial" font-size="16" fill="#32CD32" text-anchor="middle" font-weight="bold">🌍</text>
        <!-- "5" Text -->
        <text x="100" y="110" font-family="Arial" font-size="24" fill="#FFF" text-anchor="middle" font-weight="bold">5</text>
        <!-- Connecting Lines -->
        <g stroke="#32CD32" stroke-width="2" opacity="0.5">
          <line x1="100" y1="55" x2="100" y2="85"/>
          <line x1="145" y1="85" x2="125" y2="90"/>
          <line x1="145" y1="115" x2="125" y2="110"/>
          <line x1="100" y1="155" x2="100" y2="125"/>
          <line x1="55" y1="115" x2="75" y2="110"/>
          <line x1="55" y1="85" x2="75" y2="90"/>
        </g>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.4"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="greenGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#90EE90"/>
            <stop offset="1" stop-color="#228B22"/>
          </linearGradient>
          <linearGradient id="bookGradient" x1="70" y1="80" x2="130" y2="130" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F5F5DC"/>
            <stop offset="1" stop-color="#D2B48C"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  MENTOR: {
    id: 'mentor',
    title: 'Mentor',
    description: 'Created 10 helpful tests',
    requirement: 'Create 10 tests',
    type: 'creation',
    rarity: 'gold',
    points: 150,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Gold Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#goldGradient)" stroke="#B8860B" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="22s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#4A4A4A" stroke="#DAA520" stroke-width="4"/>
        <!-- Mentor Figure -->
        <circle cx="100" cy="75" r="20" fill="url(#mentorGradient)" stroke="#B8860B" stroke-width="2"/>
        <!-- Mentor Body -->
        <path d="M80 95L120 95L115 130L85 130Z" fill="url(#mentorGradient)" stroke="#B8860B" stroke-width="2"/>
        <!-- Mentor Arms -->
        <path d="M80 105L70 120L75 125L85 110" fill="url(#mentorGradient)" stroke="#B8860B" stroke-width="2"/>
        <path d="M120 105L130 120L125 125L115 110" fill="url(#mentorGradient)" stroke="#B8860B" stroke-width="2"/>
        <!-- Torch/Light -->
        <circle cx="130" cy="110" r="8" fill="url(#lightGradient)"/>
        <path d="M125 105L135 105L132 115L128 115Z" fill="url(#torchGradient)" stroke="#B8860B" stroke-width="1"/>
        <!-- Light Rays -->
        <g stroke="#FFD700" stroke-width="2" stroke-linecap="round" opacity="0.8">
          <line x1="130" y1="95" x2="130" y2="85">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
          </line>
          <line x1="145" y1="110" x2="155" y2="110">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
          </line>
          <line x1="140" y1="100" x2="148" y2="92">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
          </line>
          <line x1="140" y1="120" x2="148" y2="128">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite"/>
          </line>
        </g>
        <!-- Student Figures -->
        <circle cx="70" cy="140" r="8" fill="url(#studentGradient)"/>
        <circle cx="130" cy="140" r="8" fill="url(#studentGradient)"/>
        <circle cx="100" cy="145" r="8" fill="url(#studentGradient)"/>
        <!-- "10" Text -->
        <text x="100" y="165" font-family="Arial" font-size="20" fill="#FFD700" text-anchor="middle" font-weight="bold">10</text>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.6"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="goldGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="1" stop-color="#B8860B"/>
          </linearGradient>
          <linearGradient id="mentorGradient" x1="80" y1="55" x2="120" y2="130" gradientUnits="userSpaceOnUse">
            <stop stop-color="#DAA520"/>
            <stop offset="1" stop-color="#B8860B"/>
          </linearGradient>
          <linearGradient id="lightGradient" x1="122" y1="102" x2="138" y2="118" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFF00"/>
            <stop offset="1" stop-color="#FFD700"/>
          </linearGradient>
          <linearGradient id="torchGradient" x1="125" y1="105" x2="135" y2="115" gradientUnits="userSpaceOnUse">
            <stop stop-color="#8B4513"/>
            <stop offset="1" stop-color="#654321"/>
          </linearGradient>
          <linearGradient id="studentGradient" x1="62" y1="132" x2="78" y2="148" gradientUnits="userSpaceOnUse">
            <stop stop-color="#87CEEB"/>
            <stop offset="1" stop-color="#4682B4"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  },

  STREAK_MASTER: {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintained a 30-day learning streak',
    requirement: 'Complete tests for 30 consecutive days',
    type: 'consistency',
    rarity: 'platinum',
    points: 300,
    svg: `
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer Circle with Platinum Gradient -->
        <circle cx="100" cy="100" r="90" fill="url(#platinumGradient)" stroke="#A0A0A0" stroke-width="6">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="35s" repeatCount="indefinite"/>
        </circle>
        <!-- Inner Circle for Embossed Effect -->
        <circle cx="100" cy="100" r="80" fill="#2A2A2A" stroke="#E5E4E2" stroke-width="4"/>
        <!-- Calendar Grid -->
        <rect x="70" y="60" width="60" height="50" fill="url(#calendarGradient)" stroke="#E5E4E2" stroke-width="2" rx="5"/>
        <!-- Calendar Days -->
        <g fill="#A0A0A0" font-family="Arial" font-size="8" text-anchor="middle">
          <text x="80" y="75">1</text>
          <text x="90" y="75">2</text>
          <text x="100" y="75">3</text>
          <text x="110" y="75">4</text>
          <text x="120" y="75">5</text>
          <text x="80" y="85">6</text>
          <text x="90" y="85">7</text>
          <text x="100" y="85">8</text>
          <text x="110" y="85">9</text>
          <text x="120" y="85">10</text>
          <text x="80" y="95">11</text>
          <text x="90" y="95">12</text>
          <text x="100" y="95">13</text>
          <text x="110" y="95">14</text>
          <text x="120" y="95">15</text>
          <text x="80" y="105">16</text>
          <text x="90" y="105">17</text>
          <text x="100" y="105">18</text>
          <text x="110" y="105">19</text>
          <text x="120" y="105">20</text>
        </g>
        <!-- Fire Flame -->
        <path d="M100 120C115 120 125 135 120 150C125 165 115 175 100 175C85 175 75 165 80 150C75 135 85 120 100 120Z" fill="url(#fireGradient)" stroke="#FF4500" stroke-width="2"/>
        <!-- Inner Flame -->
        <path d="M100 130C108 130 113 140 110 150C113 160 108 165 100 165C92 165 87 160 90 150C87 140 92 130 100 130Z" fill="url(#innerFireGradient)" stroke="#FFD700" stroke-width="1"/>
        <!-- "30" Text -->
        <text x="100" y="50" font-family="Arial" font-size="24" fill="#E5E4E2" text-anchor="middle" font-weight="bold">30</text>
        <!-- Sparkles -->
        <circle cx="50" cy="60" r="3" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="150" cy="60" r="3" fill="#FFD700">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="140" r="3" fill="#FFD700">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="150" cy="140" r="3" fill="#FFD700">
          <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <!-- Shine Effect -->
        <path d="M100 20A80 80 0 0 1 140 40L160 20A90 90 0 0 0 100 10Z" fill="url(#shineGradient)" opacity="0.7"/>
        <!-- Definitions for Gradients -->
        <defs>
          <linearGradient id="platinumGradient" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F8F8FF"/>
            <stop offset="1" stop-color="#A0A0A0"/>
          </linearGradient>
          <linearGradient id="calendarGradient" x1="70" y1="60" x2="130" y2="110" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F5F5DC"/>
            <stop offset="1" stop-color="#E5E4E2"/>
          </linearGradient>
          <linearGradient id="fireGradient" x1="100" y1="120" x2="100" y2="175" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFD700"/>
            <stop offset="0.5" stop-color="#FF4500"/>
            <stop offset="1" stop-color="#8B0000"/>
          </linearGradient>
          <linearGradient id="innerFireGradient" x1="100" y1="130" x2="100" y2="165" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFF00"/>
            <stop offset="1" stop-color="#FF6347"/>
          </linearGradient>
          <linearGradient id="shineGradient" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FFFFFF" stop-opacity="0.8"/>
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `
  }
};

export const ACHIEVEMENT_CATEGORIES = {
  basic: {
    name: 'Getting Started',
    icon: '📝',
    color: '#669BBC'
  },
  performance: {
    name: 'Performance',
    icon: '🏆',
    color: '#FFD700'
  },
  mastery: {
    name: 'Mastery',
    icon: '👑',
    color: '#4A4A4A'
  },
  consistency: {
    name: 'Consistency',
    icon: '🔥',
    color: '#32CD32'
  },
  creation: {
    name: 'Creation',
    icon: '🔨',
    color: '#D4A017'
  },
  exploration: {
    name: 'Exploration',
    icon: '🧭',
    color: '#32CD32'
  }
};

export const RARITY_COLORS = {
  bronze: '#D4A017',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  green: '#32CD32'
};
