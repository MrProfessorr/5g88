import { auth, db } from "./shared403/page1site0oilzip92abqtry0314aq.js";

const ADMIN_ORIGIN = "https://dashboard-prize.vercel.app";

import {
  setPersistence, browserLocalPersistence,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import { ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
  }else if(state === "loading"){
    btn.disabled = true;
    btn.textContent = "Logging in...";
  }else if(state === "success"){
    btn.disabled = true;
    btn.textContent = "Logged in ✓";
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

function toAdminEmail(id){
  const clean = String(id||"").trim().toLowerCase();
  return clean ? `${clean}@5g88.admin` : "";
}

async function isAllowedAdmin(uid){
  const snap = await get(ref(db, `isloading/${uid}`));
  return snap.exists() && snap.val() === true;
}

async function doLogin(){
  const id = ($("uid")?.value || "").trim();
  const pw = ($("pw")?.value || "");

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

    toast("Login success");
    setLoginButton("success");

    // ✅ direct to admin (no redirect param) to avoid phishing flag
    setTimeout(()=>{
      location.replace(`${ADMIN_ORIGIN}/`);
    }, 600);

  }catch(err){
    console.error(err);
    toast("Login failed");
    setLoginButton("idle");
  }
}

$("btnLogin")?.addEventListener("click", doLogin);
$("pw")?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") doLogin(); });
