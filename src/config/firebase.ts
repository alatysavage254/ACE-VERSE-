import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDqPQAQcAegfGzampBL5TImpXTiaHzbDw",
  authDomain: "react-course-640d8.firebaseapp.com",
  projectId: "react-course-640d8",
  storageBucket: "react-course-640d8.appspot.com",
  messagingSenderId: "185428370333",
  appId: "1:185428370333:web:89b74c1ab11f1b2ba14574"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Configure and export Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});