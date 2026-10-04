// ==========================================
// mNEET - Firebase Configuration
// ==========================================

// Firebase App
const firebaseConfig = {
  apiKey: "AIzaSyApQOM_mtFZ16RiNJEaIUhb4iYFBIBRK58",
  authDomain: "mneet-spark.firebaseapp.com",
  databaseURL: "https://mneet-spark-default-rtdb.firebaseio.com",
  projectId: "mneet-spark",
  storageBucket: "mneet-spark.firebasestorage.app",
  messagingSenderId: "252201633700",
  appId: "1:252201633700:web:1a1e7a2cff1f0b168ea331"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

firebase.initializeApp(firebaseConfig);


// ==========================================
// FIREBASE SERVICES
// ==========================================

// Authentication
const auth = firebase.auth();

// Firestore Database
const db = firebase.firestore();

// Realtime Database
const realtimeDB = firebase.database();

// Storage
const storage = firebase.storage();


// ==========================================
// CONNECTION CHECK
// ==========================================

console.log("================================");
console.log("mNEET Firebase Connected");
console.log("Project: mneet-spark");
console.log("================================");
