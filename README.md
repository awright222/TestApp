# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

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