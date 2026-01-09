# Firebase Authentication Troubleshooting

## Error: `auth/configuration-not-found`

This error occurs when Firebase Authentication is not properly configured. Follow these steps to fix it:

### Step 1: Check Firebase Configuration (.env file)

1. **Create a `.env` file** in the `frontend` directory (if it doesn't exist)
2. **Get your Firebase config** from Firebase Console:
   - Go to https://console.firebase.google.com/
   - Select your project
   - Go to Project Settings (gear icon) → General tab
   - Scroll down to "Your apps" section
   - If you don't have a web app, click the Web icon (`</>`) to add one
   - Copy the configuration values

3. **Add to `.env` file**:
```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important:** Replace the placeholder values with your actual Firebase config values.

### Step 2: Enable Firebase Authentication

1. Go to Firebase Console → **Authentication** (in the left sidebar)
2. Click **"Get Started"** if you see it (first time setup)
3. Go to the **"Sign-in method"** tab
4. Find **"Email/Password"** in the list
5. Click on it and **Enable** it
6. Click **"Save"**

### Step 3: Set Up Firestore (if not done)

1. Go to Firebase Console → **Firestore Database**
2. Click **"Create database"** if you haven't created one
3. Choose **"Start in test mode"** (for development) or **Production mode**
4. Select a location for your database
5. Click **"Enable"**

### Step 4: Verify Your Configuration

After setting up `.env` file:

1. **Restart your development server** (stop and run `npm run dev` again)
2. Check the browser console for any configuration errors
3. Try registering a new user

### Step 5: Check Firestore Security Rules

Go to Firestore → Rules and make sure you have rules that allow users to create their own user document:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Common Issues and Solutions

#### Issue: "Firebase is not configured" error
- **Solution**: Check that your `.env` file exists and has all required variables
- Make sure variable names start with `VITE_`
- Restart your dev server after creating/editing `.env`

#### Issue: "auth/configuration-not-found" error
- **Solution**: Enable Email/Password authentication in Firebase Console
- Verify your `authDomain` in `.env` matches your Firebase project
- Make sure you're using the correct Firebase project

#### Issue: Environment variables not loading
- **Solution**: 
  - Make sure `.env` is in the `frontend` directory (same level as `package.json`)
  - Restart your dev server completely
  - Check that variables start with `VITE_` prefix

#### Issue: "User data not found" error
- **Solution**: This means the user document wasn't created in Firestore
- Check Firestore security rules allow user creation
- Check browser console for Firestore errors

### Quick Checklist

- [ ] `.env` file exists in `frontend` directory
- [ ] All `VITE_FIREBASE_*` variables are set with real values (not placeholders)
- [ ] Firebase Authentication is enabled
- [ ] Email/Password sign-in method is enabled
- [ ] Firestore Database is created
- [ ] Firestore security rules allow user document creation
- [ ] Development server was restarted after creating `.env`
- [ ] No errors in browser console about Firebase config

### Still Having Issues?

1. Check the browser console for specific error messages
2. Check the terminal/console where your dev server is running
3. Verify your Firebase project is active (not paused)
4. Make sure you have internet connection
5. Try clearing browser cache and localStorage

If the problem persists, check:
- Firebase project billing status (some features require Blaze plan)
- Network firewall blocking Firebase services
- Correct Firebase project is selected in console
