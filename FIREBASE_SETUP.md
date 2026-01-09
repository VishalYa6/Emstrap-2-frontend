# Firebase Setup Guide for EmSTraP

## Prerequisites

1. A Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Node.js and npm installed

## Step 1: Install Firebase Dependencies

```bash
cd frontend
npm install
```

This will install Firebase (already added to package.json).

## Step 2: Configure Firebase

1. Go to Firebase Console → Project Settings → General
2. Scroll down to "Your apps" and click the Web icon (`</>`)
3. Register your app and copy the Firebase configuration object
4. Create a `.env` file in the `frontend` directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 3: Set Up Firestore Database

1. Go to Firebase Console → Firestore Database
2. Create a database in **Production mode** or **Test mode**
3. The following collections will be created automatically:
   - `emergencies` - Stores SOS and ambulance booking requests
   - `ambulances` - Stores active ambulance locations and details

## Step 4: Set Up Firebase Storage

1. Go to Firebase Console → Storage
2. Click "Get Started"
3. Start in **Production mode** (or Test mode for development)
4. The storage bucket will automatically create folders:
   - `sos-photos/` - For SOS emergency photos

## Step 5: Set Up Firestore Security Rules

Go to Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Emergencies collection
    match /emergencies/{emergencyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['AMBULANCE', 'ADMIN', 'HOSPITAL', 'POLICE']);
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Ambulances collection
    match /ambulances/{ambulanceId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        (resource == null || resource.data.driverId == request.auth.uid);
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Users collection (optional, for role management)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 6: Set Up Storage Security Rules

Go to Storage → Rules and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /sos-photos/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

## Step 7: Enable Authentication (Optional but Recommended)

1. Go to Firebase Console → Authentication
2. Enable the authentication methods you need (Email/Password, Google, etc.)
3. Update the auth store to use Firebase Auth instead of mock auth

## Step 8: Create Firestore Indexes

For better query performance, create these composite indexes in Firestore:

1. Collection: `emergencies`
   - Fields: `status` (Ascending), `timestamp` (Descending)
   
2. Collection: `emergencies`
   - Fields: `type` (Ascending), `timestamp` (Descending)

To create indexes:
- Firestore will prompt you to create indexes when you run queries
- Or go to Firestore → Indexes → Create Index

## Step 9: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the SOS feature:
   - Login as a USER
   - Click "SOS Emergency" button
   - Grant camera and location permissions
   - Verify that the emergency appears in Firestore

3. Test real-time updates:
   - Open Ambulance Dashboard in another browser/device
   - Verify that pending emergencies appear in real-time

## Troubleshooting

### Camera Permission Denied
- Ensure you're using HTTPS (required for camera access)
- In development, use `localhost` (camera works on localhost)
- Check browser permissions

### Location Permission Denied
- Grant location permissions in browser settings
- Ensure you're using HTTPS

### Firestore Permission Denied
- Check your Firestore security rules
- Ensure the user is authenticated
- Verify the user's role in the database

### Storage Upload Fails
- Check Storage security rules
- Verify file size is under 10MB
- Ensure user is authenticated

## Next Steps

1. Implement Firebase Authentication (replace mock auth)
2. Set up Firebase Cloud Messaging for push notifications
3. Add more sophisticated error handling
4. Implement ambulance registration flow
5. Add user profile management

