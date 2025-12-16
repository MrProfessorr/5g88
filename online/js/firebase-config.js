const firebaseConfig = {
  apiKey: "AIzaSyDbqBSY2v_HnTkGrB3BJ0TakdpF_FjsriE",
  authDomain: "site-b902d.firebaseapp.com",
  databaseURL: "https://site-b902d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "site-b902d",
  storageBucket: "site-b902d.firebasestorage.app",
  messagingSenderId: "130388557538",
  appId: "1:130388557538:web:23715b27aa571e7fbf28bb"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
window.db = firebase.database();
