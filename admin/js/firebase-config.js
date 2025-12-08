// js/firebase-config.js

// Firebase Config (COMPAT VERSION - untuk script tag)
const firebaseConfig = {
  apiKey: "AIzaSyAxlfERUjAkUPcYWMkMfHaVvICWW95btSw",
  authDomain: "site-b902d.firebaseapp.com",
  databaseURL: "https://site-b902d-default-rtdb.firebaseio.com", 
  projectId: "site-b902d",
  storageBucket: "site-b902d.firebasestorage.app",
  messagingSenderId: "130388557538",
  appId: "1:130388557538:web:23715b27aa571e7fbf28bb"
};

// Init Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global database reference
const db = firebase.database();
