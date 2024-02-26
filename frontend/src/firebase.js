// this file was provided by the Firebase Setup Docs at https://firebase.google.com/docs/web/setup

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1tJLgcwZAM-CpQycH9GF-3X50nJ0pSb8",
  authDomain: "officehoursproject-e6c61.firebaseapp.com",
  projectId: "officehoursproject-e6c61",
  storageBucket: "officehoursproject-e6c61.appspot.com",
  messagingSenderId: "499685175743",
  appId: "1:499685175743:web:bc9735e7b4cfffd0c7b10a",
  measurementId: "G-2ET81PM6DK"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app);

export { auth, db, storage }; // Export auth and db for use in other files
export default app;