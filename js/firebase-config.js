// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAolce87Av2a3wsFQ_vCusFYMRKjQNkFS4",
  authDomain: "mittely-45508.firebaseapp.com",
  projectId: "mittely-45508",
  storageBucket: "mittely-45508.firebasestorage.app",
  messagingSenderId: "609303995255",
  appId: "1:609303995255:web:913f6ccc98d798fbf0b772"
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