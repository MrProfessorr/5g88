// admin/js/firebase-config.js  dan  online/js/firebase-config.js

// ⚠️ Semua value di bawah ambil dari Firebase console (Project Settings → Config)
const firebaseConfig = {
  apiKey: "AIzaSyAxlfERUjAkUPcYWMkMfHaVvICWW95btSw",      // GANTI DENGAN punyamu
  authDomain: "site-b902d.firebaseapp.com",
  databaseURL: "https://site-b902d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "site-b902d",
  storageBucket: "site-b902d.firebasestorage.app",
  messagingSenderId: "130388557538",
  appId: "1:130388557538:web:23715b27aa571e7fbf28bb"
};

// Inisialisasi Firebase (versi compat)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Realtime Database reference global
window.db = firebase.database();
// Debug supaya kita tahu file ini benar-benar jalan
console.log("firebase-config LOADED, db =", !!db);
