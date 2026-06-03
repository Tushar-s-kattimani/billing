import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-7358096966-b0c4c",
  appId: "1:466891682067:web:039f9ea3b09af3a9206ae6",
  apiKey: "AIzaSyAmCV-13jfhrKqVXHenIuBu0Hi7dr8919U",
  authDomain: "studio-7358096966-b0c4c.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "466891682067"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
