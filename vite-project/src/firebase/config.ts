import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAVhea0QDopAOXA1thb94fGKOcpX0gLmeo",
    authDomain: "lux-ventus-blog.firebaseapp.com",
    projectId: "lux-ventus-blog",
    storageBucket: "lux-ventus-blog.firebasestorage.app",
    messagingSenderId: "821035886166",
    appId: "1:821035886166:web:665187d915929f72b73df7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;

