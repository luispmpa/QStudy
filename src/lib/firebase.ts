import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbsR7_U4mCXGETXk5XQhTEbJ4scTMVRW0",
  authDomain: "questoes-67f9a.firebaseapp.com",
  projectId: "questoes-67f9a",
  storageBucket: "questoes-67f9a.firebasestorage.app",
  messagingSenderId: "602621734258",
  appId: "1:602621734258:web:31c269fc49739b72f8c1eb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
