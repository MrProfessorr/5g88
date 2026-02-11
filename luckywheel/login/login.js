import { auth, db } from "./shared403/page1site0oilzip92abqtry0314aq.js";
import {
  setPersistence, browserLocalPersistence,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  ref, get, set
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
  const $ = (id)=>document.getElementById(id);
  const SESSION_HOURS = 6;

function setAdminSession(uid, email){
  const until = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  localStorage.setItem("admin_uid", uid);
  localStorage.setItem("admin_email", email || "");
  localStorage.setItem("admin_until", String(until));
}
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
    btn.textContent = "Logged in";
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
const ADMIN_ORIGIN = "https://dashboard-prize.vercel.app";
const DEFAULT_ADMIN_AFTER = "https://dashboard-prize.vercel.app/";
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

  async function isAllowedAdmin(uid){
    const snap = await get(ref(db, `isloading/${uid}`));
    return snap.exists() && snap.val() === true;
  }

function genTicket(len = 28){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for(let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

async function createAdminTicket(uid, email){
  const ticket = genTicket(32);
  const expiresAt = Date.now() + (2 * 60 * 1000); // 2 minit

  // simpan ikut uid (senang rules)
  await set(ref(db, `adminTicketsByUid/${uid}`), {
    ticket,
    uid,
    email: email || "",
    expiresAt
  });

  return ticket;
}
  // fallback
  const ticket = genTicket(36);
  const expiresAt = Date.now() + (2 * 60 * 1000);
  await set(ref(db, `adminTickets/${ticket}`), { uid, email: email || "", expiresAt });
  return ticket;
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
    console.log("LOGIN UID =", cred.user.uid);
    console.log("LOGIN EMAIL =", cred.user.email);
    const ok = await isAllowedAdmin(cred.user.uid);

    if(!ok){
      toast("This account is not allowed.");
      await signOut(auth);
      setLoginButton("idle");
      return;
    }
toast("Login success");
setLoginButton("success");

setAdminSession(cred.user.uid, cred.user.email || "");

const target = getRedirectTarget();
const ticket = await createAdminTicket(cred.user.uid, cred.user.email || "");
const u = new URL(target);
u.searchParams.set("ticket", ticket);

setTimeout(()=>{
  location.replace(u.toString());
}, 300);
} catch (err) {
  console.error("LOGIN ERROR:", err);
  toast(err?.code ? `Login failed: ${err.code}` : `Login failed: ${err?.message || err}`);
  setLoginButton("idle");
}
}

  $("btnLogin").addEventListener("click", doLogin);
  $("pw").addEventListener("keydown", (e)=>{ if(e.key==="Enter") doLogin(); });
