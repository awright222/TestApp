// Firebase domain verification and troubleshooting script
console.log('=== FIREBASE DOMAIN TROUBLESHOOTING ===');

// Firebase config check
const firebaseConfig = {
  apiKey: "AIzaSyDt5NwBFugOXIwc4CXECuSzK6IPiWQkFZw",
  authDomain: "test-builder-app.firebaseapp.com",
  projectId: "test-builder-app",
  storageBucket: "test-builder-app.firebasestorage.app",
  messagingSenderId: "168621778509",
  appId: "1:168621778509:web:7faa337711eff5d61b9e04",
  measurementId: "G-Q2JYPVG1ET"
};

console.log('\n=== FIREBASE CONFIG ===');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);

console.log('\n=== REQUIRED AUTHORIZED DOMAINS ===');
console.log('You need to add these domains to Firebase Console:');
console.log('1. localhost (for development)');
console.log('2. fromulatetests.vercel.app (for production)');

console.log('\n=== STEPS TO FIX THE UNAUTHORIZED DOMAIN ERROR ===');
console.log('1. Go to: https://console.firebase.google.com/project/test-builder-app/authentication/settings');
console.log('2. Click on the "Authorized domains" tab');
console.log('3. Click "Add domain" button');
console.log('4. Enter: fromulatetests.vercel.app');
console.log('5. Click "Add"');
console.log('6. Verify localhost is also in the list');
console.log('7. Wait 5-10 minutes for changes to propagate');

console.log('\n=== BROWSER CONSOLE VERIFICATION ===');
console.log('Run this in your browser console at https://fromulatetests.vercel.app/:');
console.log('');
console.log('console.log("Current domain:", window.location.hostname);');
console.log('console.log("Should be: fromulatetests.vercel.app");');

console.log('\n=== COMMON ISSUES & SOLUTIONS ===');
console.log('❌ Issue: "Firebase: Error (auth/unauthorized-domain)"');
console.log('✅ Solution: Add your domain to Firebase Console authorized domains');
console.log('');
console.log('❌ Issue: Changes not taking effect immediately');
console.log('✅ Solution: Clear browser cache and hard refresh (Cmd+Shift+R)');
console.log('');
console.log('❌ Issue: Still getting errors after adding domain');
console.log('✅ Solution: Wait 5-10 minutes for Firebase changes to propagate');
console.log('');
console.log('❌ Issue: Domain added but still unauthorized');
console.log('✅ Solution: Make sure you added the exact domain without https:// prefix');

console.log('\n=== FIREBASE PROJECT INFO ===');
console.log('Direct link to your Firebase auth settings:');
console.log('https://console.firebase.google.com/project/test-builder-app/authentication/settings');

module.exports = { firebaseConfig };
