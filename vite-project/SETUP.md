# Setup Guide for EasySplit Expense Application

## Quick Start

### 1. Install Dependencies (Already Done ✅)
```bash
npm install
```

### 2. Configure Firebase

#### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "easysplit-expense")
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

#### Step 2: Enable Firestore
1. In your Firebase project, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose a location (select one close to you)
5. Click "Enable"

#### Step 3: Get Configuration
1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Register app with nickname: "EasySplit"
6. **Copy the configuration**

#### Step 4: Update Config File
Open `src/firebase/config.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "AIza...",           // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

### 3. Update Firestore Security Rules (Important!)

In Firebase Console → Firestore Database → Rules:

Replace with these development rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /participants/{document=**} {
      allow read, write: if true;
    }
    match /expenses/{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Note**: These rules allow anyone to read/write. For production, implement authentication!

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing the Application

### 1. Add Participants
- Enter a name in the Participants section
- Click "Add"
- Repeat for multiple participants

### 2. Add an Expense with Equal Split
- Description: "Dinner at Restaurant"
- Amount: 100
- Payee: Select a participant
- Split Method: "Equal Split"
- Select multiple participants
- Click "Add Expense"

### 3. Add an Expense with Unequal Split
- Description: "Taxi Ride"
- Amount: 50
- Payee: Select a participant
- Split Method: "Unequal Split (Custom)"
- Enter custom amounts for each participant (total must equal 50)
- Click "Add Expense"

### 4. Add an Expense with Proportional Split
- Description: "House Rent"
- Amount: 1200
- Payee: Select a participant
- Split Method: "Proportional Split (Shares)"
- Assign shares (e.g., Person A: 2, Person B: 1, Person C: 1)
- Click "Add Expense"

### 5. View Summary
- Check the "Settlement Summary" section
- See who owes whom and the amounts

## Troubleshooting

### "Missing or insufficient permissions" error
- Check Firestore Rules in Firebase Console
- Make sure rules allow read/write for development

### "Firebase: Error (auth/invalid-api-key)"
- Verify your Firebase config in `src/firebase/config.ts`
- Make sure all values are correctly copied from Firebase Console

### App doesn't load data
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Check network tab for failed API calls

### Participants/Expenses not saving
- Verify Firebase config is correct
- Check browser console for errors
- Ensure you have write permissions in Firestore Rules

## Next Steps

### For Production Deployment:
1. Set up Firebase Authentication
2. Implement secure Firestore rules
3. Deploy to Vercel, Netlify, or Firebase Hosting
4. Add user authentication (email/password, Google, etc.)
5. Add groups/rooms for multiple expense lists

### Build for Production:
```bash
npm run build
```

The built files will be in the `dist` folder.

## Need Help?

Refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Material UI Documentation](https://mui.com/)
- [React Documentation](https://react.dev/)

---

🎉 **You're all set! Enjoy splitting expenses with EasySplit!**

