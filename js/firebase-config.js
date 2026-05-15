// js/firebase-config.js - Using Environment Variables for Security
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Firebase Configuration - Reading from Environment Variables
// For local development: Create a .env file with these variables
// For Netlify: Add these as Environment Variables in Site Settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAolce87Av2a3wsFQ_vCusFYMRKjQNkFS4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mittely-45508.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mittely-45508",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mittely-45508.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "609303995255",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:609303995255:web:913f6ccc98d798fbf0b772"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// Collections
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';
const DISCOUNTS_COLLECTION = 'discounts';

// Export
export {
  db, auth, storage, provider,
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit,
  ref, uploadBytes, getDownloadURL,
  signInWithPopup, signOut, onAuthStateChanged,
  PRODUCTS_COLLECTION, ORDERS_COLLECTION, CUSTOMERS_COLLECTION, DISCOUNTS_COLLECTION
};
