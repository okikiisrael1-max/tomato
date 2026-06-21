// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyA636nMtAG5p6HPVbTWEi6BprBbSm7Cnww",
  authDomain: "tomato-2124d.firebaseapp.com",
  projectId: "tomato-2124d",
  storageBucket: "tomato-2124d.firebasestorage.app",
  messagingSenderId: "568282863811",
  appId: "1:568282863811:web:588821d584ec8598abea76",
  measurementId: "G-CWETV1ERGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
