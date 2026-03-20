// filename: src/config/firebase.ts
import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDDqPQAQcAegfGzampBL5TImpXTiaHzbDw",
  authDomain: "react-course-640d8.firebaseapp.com",
  projectId: "react-course-640d8",
  storageBucket: "react-course-640d8.appspot.com",
  messagingSenderId: "185428370333",
  appId: "1:185428370333:web:89b74c1ab11f1b2ba14574"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.useDeviceLanguage();

initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
export const db = getFirestore(app);

export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
