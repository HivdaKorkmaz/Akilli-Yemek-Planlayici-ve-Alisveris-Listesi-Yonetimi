import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCu_BAPFvzwRcN3ZQXnWTl3VtAvMg-a3Bk",
  authDomain: "yemekplanlayici.firebaseapp.com",
  databaseURL: "https://yemekplanlayici-default-rtdb.firebaseio.com",
  projectId: "yemekplanlayici",
  storageBucket: "yemekplanlayici.firebasestorage.app",
  messagingSenderId: "921908073919",
  appId: "1:921908073919:web:dc137acb9c8a6db3cd7d0a",
  measurementId: "G-KF0XQEKLM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 