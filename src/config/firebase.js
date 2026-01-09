// Firebase Configuration
// Replace these with your actual Firebase project credentials
// Get these from Firebase Console: Project Settings > General > Your apps

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
const isValidConfig = (config) => {
  return (
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId &&
    !config.apiKey.includes('your-') &&
    !config.authDomain.includes('your-') &&
    !config.projectId.includes('your-')
  );
};

if (!isValidConfig(firebaseConfig)) {
  const errorMessage = `
    ⚠️ Firebase Configuration Error!
    
    Please set up your Firebase configuration:
    
    1. Create a .env file in the frontend directory with:
       VITE_FIREBASE_API_KEY=your-api-key
       VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
       VITE_FIREBASE_PROJECT_ID=your-project-id
       VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
       VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
       VITE_FIREBASE_APP_ID=your-app-id
    
    2. Get these values from Firebase Console:
       - Go to Firebase Console → Project Settings → General
       - Scroll to "Your apps" → Click Web icon (</>)
       - Copy the config values
    
    3. Enable Authentication:
       - Go to Firebase Console → Authentication
       - Click "Get Started"
       - Enable "Email/Password" sign-in method
    
    4. Restart your development server after creating .env file
    
    See FIREBASE_SETUP.md for detailed instructions.
  `;
  
  console.error(errorMessage);
  
  // Create a mock config to prevent app crash, but it won't work
  throw new Error(
    'Firebase configuration is missing. Please check the console for setup instructions.'
  );
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error(
    `Failed to initialize Firebase: ${error.message}. Please check your Firebase configuration.`
  );
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Note: Authentication initialization will be validated when auth methods are called
// The auth/configuration-not-found error will be caught and handled in authStore

export default app;

