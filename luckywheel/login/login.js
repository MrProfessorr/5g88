import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
  import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
  const auth = getAuth(app);
  const db = getDatabase(app);

  const $ = (id)=>document.getElementById(id);
  function setLoginButton(state){
  const btn = $("btnLogin");

  if(state === "idle"){
    btn.disabled = false;
    btn.textContent = "Login";
  }

  if(state === "loading"){
    btn.disabled = true;
    btn.textContent = "Logging in...";
  }

  if(state === "success"){
    btn.disabled = true;
    btn.textContent = "Logged in ✓";
  }
}
function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__t);
  window.__t = setTimeout(()=> t.classList.remove("show"), 2200);
}

  function toAdminEmail(id){
    const clean = String(id||"").trim().toLowerCase();
    return clean ? `${clean}@5g88.admin` : "";
  }

function getBasePath(){
  // contoh: /5g88/luckywheel/login/ -> /5g88/luckywheel
  // contoh: /login/ -> ""
  const parts = location.pathname.split("/").filter(Boolean);

  // buang "login" jika memang sedang dalam /login
  const last = parts[parts.length - 1];
  if (last === "login") parts.pop();

  return "/" + parts.join("/");
}

function getRedirectTarget(){
  const u = new URL(location.href);
  const rt = u.searchParams.get("redirect");
  if(rt) return rt;
  const base = getBasePath();
  return `${location.origin}${base}/drawheel/`;
}

  async function isAllowedAdmin(uid){
    const snap = await get(ref(db, `isloading/${uid}`));
    return snap.exists() && snap.val() === true;
  }

async function doLogin(){
  const id = $("uid").value.trim();
  const pw = $("pw").value;

  if(!id || !pw){
    toast("Please fill Username & Password");
    return;
  }
  setLoginButton("loading");

  try{
    await setPersistence(auth, browserLocalPersistence);

    const cred = await signInWithEmailAndPassword(
      auth,
      toAdminEmail(id),
      pw
    );

    const ok = await isAllowedAdmin(cred.user.uid);

    if(!ok){
      toast("This account is not allowed.");
      await signOut(auth);
      setLoginButton("idle");
      return;
    }
    toast("Login success");
    setLoginButton("success");
    setTimeout(()=>{
      location.replace(getRedirectTarget());
    }, 600);
  }catch(err){
    toast("Login failed");
    setLoginButton("idle");
  }
}

  $("btnLogin").addEventListener("click", doLogin);
  $("pw").addEventListener("keydown", (e)=>{ if(e.key==="Enter") doLogin(); });
