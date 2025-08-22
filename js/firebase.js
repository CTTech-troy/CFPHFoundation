// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Realtime Database instance
export const rtdb = getDatabase(app);
