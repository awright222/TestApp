# Formulate - Where Tests Take Shape

A comprehensive React-based test creation and management platform designed for educators and institutions. Features role-based access, class management, advanced analytics, and scalable architecture for both individual teachers and large educational organizations.

## 🚀 Key Features

### 🎯 **Role-Based Access Control**
- **Teacher Accounts**: Create tests, manage classes, view analytics, assign tests to students
- **Student Accounts**: Join classes, take assigned tests, track progress
- **Subscription Management**: Feature gating based on subscription tiers
- **Usage Tracking**: Monitor test creation limits and storage usage

### 🎓 **Class & Group Management**
- **Class Creation**: Teachers can create and organize classes by subject
- **Student Enrollment**: Multiple enrollment methods (invitation codes, manual addition)
- **Test Assignment**: Assign tests to entire classes with custom settings
- **Bulk Management**: Manage multiple students and assignments efficiently
- **Class Analytics**: Track class-wide performance and engagement

### 📝 **Advanced Test Creation**
- **Flexible Question Types**: Multiple choice, true/false, short answer
- **Timer Settings**: Configurable time limits with warnings and auto-submit
- **Security Features**: Browser lockdown, full screen mode, linear progression
- **Import/Export**: Support for CSV, Excel, PDF, Word, and JSON formats
- **Question Shuffling**: Randomize question order for each student

### 📊 **Comprehensive Analytics**
- **Individual Performance**: Detailed student progress tracking
- **Class Analytics**: Class-wide performance insights and trends
- **Test Analytics**: Question-level analysis and difficulty assessment
- **Export Reports**: Download analytics in multiple formats
- **Real-time Monitoring**: Live test-taking progress tracking

### 🔒 **Security & Proctoring**
- **Browser Lockdown**: Prevents tab switching and external navigation
- **Full Screen Enforcement**: Maintains focus during test taking
- **Linear Mode**: Prevents backtracking to previous questions
- **Time Management**: Automatic submission with grace periods
- **Academic Integrity**: Built-in features to maintain test security

## 🏗️ **Technical Architecture**

### Frontend
- **React 19.1.0**: Modern React with hooks and functional components
- **React Router 7.6.2**: Client-side routing and navigation
- **Firebase 11.9.1**: Authentication, database, and real-time features
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Backend Services
- **Firebase Firestore**: NoSQL database for scalable data storage
- **Firebase Auth**: Secure user authentication and management
- **Real-time Synchronization**: Cross-device data syncing
- **Cloud Functions**: Serverless backend logic (ready for implementation)

### State Management
- **Context API**: Centralized user and app state management
- **Local Storage**: Offline capability and data persistence
- **Firebase Integration**: Seamless cloud synchronization

## 📱 **User Experience**

### For Teachers
1. **Quick Setup**: Create account, select teacher role, start creating classes
2. **Class Management**: Organize students, assign tests, monitor progress
3. **Test Creation**: Build assessments with advanced settings and security
4. **Analytics Dashboard**: Comprehensive insights into student performance
5. **Export & Share**: Multiple formats for test distribution and reporting

### For Students
1. **Easy Enrollment**: Join classes using enrollment codes from teachers
2. **Assignment Dashboard**: View upcoming tests and due dates
3. **Secure Test Taking**: Guided experience with built-in security measures
4. **Progress Tracking**: Monitor personal performance and improvement
5. **Multi-device Access**: Seamless experience across devices

## 🎨 **User Interface**

### Modern Design System
- **Consistent Color Palette**: Professional blue/teal theme with accessibility in mind
- **Responsive Grid Layouts**: Adapts to all screen sizes and devices
- **Interactive Components**: Smooth animations and micro-interactions
- **Accessibility First**: WCAG compliant with keyboard navigation support

### Component Library
- **Reusable UI Components**: Modular design system for consistency
- **Custom Form Controls**: Specialized inputs for test creation
- **Data Visualization**: Charts and graphs for analytics display
- **Modal System**: Layered interface for complex workflows

## 🔧 **Installation & Setup**

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Modern web browser with JavaScript enabled

### Quick Start

### Quick Start

```bash
# Clone and install dependencies
git clone <repository-url>
cd TestApp
npm install

# Configure Firebase
# Create src/firebase/config.js with your Firebase configuration

# Start development server
npm start
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

Firebase Configuration - Your app is connected to your Firebase project (test-builder-app)

User Authentication

Sign in/Sign up with email and password
Google Sign-in integration
User profile management
Auth state management with React Context
Cloud Data Storage

Tests are automatically saved to Firestore when users are logged in
Falls back to localStorage for anonymous users
Data migration: When users log in, their localStorage tests are automatically migrated to Firebase
UI Integration

Sign In button in both desktop and mobile sidebars
User profile display with welcome message
Sign Out functionality
🚀 How It Works:
For Anonymous Users: Tests are saved to localStorage (existing behavior)
For Logged-in Users: Tests are saved to Firebase Firestore in the cloud
Migration: When a user signs in, any existing localStorage tests are automatically moved to Firebase
🔧 Key Files Created/Updated:
config.js - Firebase configuration with your project credentials
testsService.js - Firebase Firestore operations
AuthContext.js - React authentication context
AuthModal.js - Login/registration modal
SavedTestsService.js - Updated to use Firebase when logged in
App.js - Added authentication UI to sidebar
index.js - Wrapped app with AuthProvider


🔮 Future Enhancements Ready to Build:
The foundation is now in place for:

User settings/preferences storage
Test sharing between users
Social features like public test libraries
Advanced analytics and user insights

✅ Settings are test-specific - each test has its own independent settings
✅ Settings persist during creation - won't be lost when switching tabs
✅ Settings don't interfere - creating multiple tests won't share settings
✅ Editing preserves settings - editing a test loads its specific settings
✅ Clean slate for new tests - each new test starts fresh
✅ Visual confirmation - clear indication of which test the settings apply to

✅ True Cross-Device Access: Start test on computer, continue on phone
✅ Data Safety: Tests backed up in cloud, never lost
✅ Clear Communication: Users understand when/why login is needed
✅ No Data Loss: Migration preserves all existing data
✅ Seamless Experience: Automatic login detection and redirection

Timer Settings:
✅ Auto-submit when time expires
✅ Show/hide timer to students
✅ Timer warnings at 10, 5, and 1 minute
✅ Grace period after time expires
Security & Navigation:
✅ Browser lockdown (disables copy/paste, right-click, tab switching)
✅ Full screen requirement
✅ Linear mode (answer in order)
✅ No backtracking
✅ One-time only tests
Test Taking Experience:
✅ Consolidated UI with compact controls
✅ All security restrictions enforced during test taking
✅ Timer countdown with warnings and auto-submit
✅ Navigation restrictions based on test settings

1. Enhanced AuthContext
Role Management: Teacher/Student account types
Subscription Tiers: Free, Paid, School with feature flags
Usage Tracking: Tests created, student attempts, storage
Permission System: canPerformAction() helper function
Backward Compatibility: Existing users default to teacher role
2. Role Selection System
Beautiful Modal: New users choose Teacher or Student role
Clear Value Props: Features and pricing for each role
Smart Defaults: Existing users grandfathered as teachers
Non-Breaking: Seamless integration without disrupting current users
3. Usage Tracking & Display
Usage Display Component: Shows current limits and usage
Upgrade Prompts: Contextual upgrade messaging
Progress Visualization: Visual progress bars for limits
Subscription Badges: Clear tier indicators
