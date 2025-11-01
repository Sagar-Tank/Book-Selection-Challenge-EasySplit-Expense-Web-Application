# Firebase Setup Instructions

## Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Create Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose your preferred location
5. Click "Enable"

## Step 3: Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "EasySplit")
5. Copy the Firebase configuration object

## Step 4: Update config.ts
Replace the placeholder values in `src/firebase/config.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Firestore Rules (for development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // WARNING: This allows anyone to read/write!
    }
  }
}
```

**Important:** These rules are only for development. For production, set up proper authentication and security rules.

## Collections Structure

### participants
```
{
  name: string
}
```

### expenses
```
{
  description: string,
  totalAmount: number,
  payeeId: string,
  splitType: 'equal' | 'unequal' | 'proportional',
  splits: [
    {
      participantId: string,
      amount: number
    }
  ],
  shares?: {
    [participantId: string]: number
  }
}
```

