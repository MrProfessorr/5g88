// admin/js/firebase-config.js  dan  online/js/firebase-config.js

// ⚠️ PENTING: semua value di bawah ambil terus dari Firebase console
const firebaseConfig = {
  apiKey: "PASTE_APIKEY_DI_SINI",
  authDomain: "site-b902d.firebaseapp.com",
  databaseURL: "https://site-b902d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "site-b902d",
  storageBucket: "site-b902d.firebasestorage.app",
  messagingSenderId: "130388557538",
  appId: "1:130388557538:web:23715b27aa571e7fbf28bb"
};

// Inisialisasi Firebase versi compat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Realtime Database reference global
const db = firebase.database();
