import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWNpA2-ro5xLUa3LZq6S5lXHz5UQzIYss",
  authDomain: "dentoscan-db.firebaseapp.com",
  projectId: "dentoscan-db",
  storageBucket: "dentoscan-db.firebasestorage.app",
  messagingSenderId: "113396055814",
  appId: "1:113396055814:web:0af80c5759a9199a4fa887"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
