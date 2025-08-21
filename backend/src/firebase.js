// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  remove
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCQc8HJ9SDTDR0rGiIzzamr44VdQvtuAvo",
  authDomain: "cfphfoundation.firebaseapp.com",
  projectId: "cfphfoundation",
  storageBucket: "cfphfoundation.appspot.com",
  messagingSenderId: "164594658812",
  appId: "1:164594658812:web:a13657916de5a5f8109679",
  measurementId: "G-0TCTKDZSP9",
  databaseURL: "https://cfphfoundation-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

// ✅ Firestore
export const db = getFirestore(app);

// ✅ Storage
export const storage = getStorage(app);

// ✅ Realtime Database
export const rtdb = getDatabase(app);

// ✅ Analytics (only runs in browser)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

// ✅ Export Realtime DB helpers so you can import directly
export { ref, push, set, onValue, update, remove };

export default app;
