import { auth, db } from "./shared403/page1site0oilzip92abqtry0314aq.js";

// domain admin yang kau nak pergi lepas login
const ADMIN_ORIGIN = new URL("https://dashboard-prize.vercel.app").origin;
const ADMIN_URL = `${ADMIN_ORIGIN}/`; // landing page admin

import {
  setPersistence, browserLocalPersistence,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  ref, get, set, remove
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const $ = (id)=>document.getElementById(id);

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
  if(!t) return alert(msg);
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__t);
  window.__t = setTimeout(()=> t.classList.remove("show"), 2200);
}

function toAdminEmail(id){
  const clean = String(id||"").trim().toLowerCase();
  return clean ? `${clean}@5g88.admin` : "";
}

// ==== allow redirect dari param redirect= (optional) ====
// tapi mesti dalam ADMIN_ORIGIN
function getRedirectTarget(){
  const u = new URL(location.href);
  const rt = u.searchParams.get("redirect");
  if(rt){
    try{
      const x = new URL(rt);
      if(x.origin === ADMIN_ORIGIN) return x.href;
    }catch(e){}
  }
  return ADMIN_URL;
}

async function isAllowedAdmin(uid){
  const snap = await get(ref(db, `isloading/${uid}`));
  return snap.exists() && snap.val() === true;
}

// ==== TICKET SYSTEM (untuk cross-domain) ====
function makeTicket(len=48){
  const chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out="";
  for(let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

// ticket hidup 2 minit, sekali guna
async function issueAdminTicket(user){
  const ticket = makeTicket();
  const now = Date.now();

  const payload = {
    uid: user.uid,
    email: user.email || "",
    issuedAt: now,
    expiresAt: now + 2 * 60 * 1000
  };

  await set(ref(db, `adminTickets/${ticket}`), payload);

  // safety cleanup: auto delete selepas 3 min (kalau user tak sempat buka admin)
  setTimeout(async ()=>{
    try{
      const s = await get(ref(db, `adminTickets/${ticket}`));
      if(s.exists()){
        const v = s.val() || {};
        if(Date.now() > Number(v.expiresAt||0)) await remove(ref(db, `adminTickets/${ticket}`));
      }
    }catch(_){}
  }, 3 * 60 * 1000);

  return ticket;
}

async function doLogin(){
  const id = $("uid")?.value?.trim() || "";
  const pw = $("pw")?.value || "";

  if(!id || !pw){
    toast("Please fill Username & Password");
    return;
  }

  setLoginButton("loading");

  try{
    await setPersistence(auth, browserLocalPersistence);

    const cred = await signInWithEmailAndPassword(auth, toAdminEmail(id), pw);

    const ok = await isAllowedAdmin(cred.user.uid);
    if(!ok){
      toast("This account is not allowed.");
      await signOut(auth);
      setLoginButton("idle");
      return;
    }

    // ✅ create ticket, then redirect to admin domain with ticket
    const ticket = await issueAdminTicket(cred.user);

    toast("Login success");
    setLoginButton("success");

    const target = getRedirectTarget();
    // pastikan pergi admin domain juga (double safety)
    const url = new URL(target);
    if(url.origin !== ADMIN_ORIGIN) url.href = ADMIN_URL;

    url.searchParams.set("ticket", ticket);

    setTimeout(()=>{
      location.replace(url.toString());
    }, 400);

  }catch(err){
    console.error(err);
    toast("Login failed");
    setLoginButton("idle");
  }
}

$("btnLogin")?.addEventListener("click", doLogin);
$("pw")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") doLogin(); });
