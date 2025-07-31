// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "zhiqilin-48c12.firebaseapp.com",
    projectId: "zhiqilin-48c12",
    storageBucket: "zhiqilin-48c12.firebasestorage.app",
    messagingSenderId: "190121798347",
    appId: "1:190121798347:web:6254ff6c2e76f4f519094e",
    measurementId: "G-5VQ65QJ7FL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);