import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSqpbnkb3GLNFlHLYSz5XyRYPvKLAOCOA",
  authDomain: "lucky-spined.firebaseapp.com",
  databaseURL: "https://lucky-spined-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lucky-spined",
  storageBucket: "lucky-spined.firebasestorage.app",
  messagingSenderId: "708886212396",
  appId: "1:708886212396:web:2cb7a900fe1a7891510689"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
