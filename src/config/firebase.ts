// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase services with settings
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to device language

// Initialize Firestore with settings
export const db = getFirestore(app);

// Initialize Storage with settings
export const storage = getStorage(app);

// Configure Google Auth Provider
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});
