import { auth, db } from "./shared403/page1site0oilzip92abqtry0314aq.js";
import {
  setPersistence, browserLocalPersistence,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  ref, get, set
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const $ = (id)=>document.getElementById(id);

const ADMIN_ORIGIN = "https://dashboard-prize.vercel.app";
const DEFAULT_ADMIN_AFTER = "https://dashboard-prize.vercel.app/";

// =========================
// UI helpers
// =========================
function initPasswordToggle(){
  const pwInput = $("pw");
  const btn = document.querySelector(".togglePw");
  if(!pwInput || !btn) return;
  const eyeShow = btn.querySelector(".show");
  const eyeHide = btn.querySelector(".hide");

  btn.addEventListener("click", () => {
    const isHidden = pwInput.type === "password";
    pwInput.type = isHidden ? "text" : "password";

    if (eyeShow && eyeHide) {
      eyeShow.style.display = isHidden ? "none" : "block";
      eyeHide.style.display = isHidden ? "block" : "none";
    }

    btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });
}
initPasswordToggle();

function setLoginButton(state){
  const btn = $("btnLogin");
  if(!btn) return;

  if(state === "idle"){
    btn.disabled = false;
    btn.textContent = "Login";
  } else if(state === "loading"){
    btn.disabled = true;
    btn.textContent = "Logging in...";
  } else if(state === "success"){
    btn.disabled = true;
    btn.textContent = "Logged in";
  }
}

function toast(msg){
  const t = $("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__t);
  window.__t = setTimeout(()=> t.classList.remove("show"), 2200);
}

// =========================
// Redirect target (strict)
// =========================
function getRedirectTarget(){
  const u = new URL(location.href);
  const rt = u.searchParams.get("redirect");
  if(!rt) return DEFAULT_ADMIN_AFTER;

  try{
    const target = new URL(rt);
    if(target.origin !== ADMIN_ORIGIN) return DEFAULT_ADMIN_AFTER;
    return target.href;
  }catch(_){
    return DEFAULT_ADMIN_AFTER;
  }
}

// =========================
// Auth helpers
// =========================
function toAdminEmail(id){
  const clean = String(id||"").trim().toLowerCase();
  return clean ? `${clean}@5g88.admin` : "";
}

async function isAllowedAdmin(uid){
  const snap = await get(ref(db, `isloading/${uid}`));
  return snap.exists() && snap.val() === true;
}

// =========================
// Strong ticket (crypto)
// =========================
function genTicket(){
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

async function createAdminTicket(uid, email){
  const ticket = genTicket();
  const expiresAt = Date.now() + (2 * 60 * 1000); // 2 minit

  await set(ref(db, `adminTicketsByUid/${uid}`), {
    ticket,
    expiresAt,
    email: email || ""
  });

  return ticket;
}

// =========================
// Login
// =========================
async function doLogin(){
  const id = $("uid")?.value?.trim();
  const pw = $("pw")?.value;

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
      try{ await signOut(auth); }catch(_){}
      setLoginButton("idle");
      return;
    }

    toast("Login success");
    setLoginButton("success");

    // ✅ Create ticket & redirect to admin (with anti-cache)
    const target = getRedirectTarget();
    const ticket = await createAdminTicket(cred.user.uid, cred.user.email || "");
    const u = new URL(target);
    u.searchParams.set("ticket", ticket);
    u.searchParams.set("t", String(Date.now()));

    setTimeout(()=> location.replace(u.toString()), 200);

  }catch(err){
    console.error("LOGIN ERROR:", err);
    toast(err?.code ? `Login failed: ${err.code}` : `Login failed: ${err?.message || err}`);
    setLoginButton("idle");
  }
}

$("btnLogin")?.addEventListener("click", doLogin);
$("pw")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") doLogin(); });
