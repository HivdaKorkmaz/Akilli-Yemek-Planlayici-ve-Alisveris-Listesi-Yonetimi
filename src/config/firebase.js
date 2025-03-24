import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCu_BAPFvzwRcN3ZQXnWTl3VtAvMg-a3Bk",
  authDomain: "yemekplanlayici.firebaseapp.com",
  projectId: "yemekplanlayici",
  storageBucket: "yemekplanlayici.firebasestorage.app",
  messagingSenderId: "921908073919",
  appId: "1:921908073919:web:dc137acb9c8a6db3cd7d0a",
  measurementId: "G-KF0XQEKLM3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 