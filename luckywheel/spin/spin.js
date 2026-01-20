  let currentRotationDeg = 0;
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import {
  getDatabase, ref, get, set, push, child, runTransaction, onValue, update
 } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
  const $ = (id)=>document.getElementById(id);
  const sfxStart = $("sfxStart");
const sfxTick  = $("sfxTick");
const sfxWin   = $("sfxWin");

let soundArmed = false;
let tickTimer = null;
let tickInstances = [];

function armSoundsOnce(){
  if(soundArmed) return;
  soundArmed = true;

  [sfxStart, sfxTick, sfxWin].forEach(a=>{
    if(!a) return;
    try{
      a.volume = 0.8;
      a.currentTime = 0;
      const p = a.play();
      if(p && p.then){
        p.then(()=>{ a.pause(); a.currentTime = 0; }).catch(()=>{});
      } else {
        a.pause(); a.currentTime = 0;
      }
    }catch(e){}
  });
}

document.addEventListener("click", armSoundsOnce, { once:true });
[sfxStart, sfxTick, sfxWin].forEach(a=>{
  if(!a) return;
  try { a.load(); } catch(e){}
});

function playStart(){
  if(!sfxStart) return;
  try{
    armSoundsOnce();
    const a = sfxStart.cloneNode(true);
    a.volume = 0.95;
    a.currentTime = 0;
    a.play().catch(()=>{});
  }catch(e){}
}

function playTick(speed01 = 1){
  if(!sfxTick || !soundArmed) return;
  try{
    const a = sfxTick.cloneNode(true);
    a.volume = 0.25 + 0.35 * speed01;
    a.playbackRate = 0.95 + 0.2 * speed01;
    tickInstances.push(a);
    if(tickInstances.length > 30){
  const old = tickInstances.shift();
  try{ old.pause(); old.currentTime = 0; }catch(e){}
}
    a.addEventListener("ended", () => {
      tickInstances = tickInstances.filter(x => x !== a);
    });

    a.play().catch(()=>{});
  }catch(e){}
}

function playWin(){
  if(!sfxWin || !soundArmed) return;
  try{
    sfxWin.currentTime = 0;
    sfxWin.volume = 0.95;
    sfxWin.play().catch(()=>{});
  }catch(e){}
}

function startTickLoop(durationMs = 4200){
  stopTickLoop();

  const startAt = performance.now();
  tickTimer = setInterval(()=>{
    const t = (performance.now() - startAt) / durationMs;
    const speed = Math.max(0, Math.min(1, 1 - t));
    playTick(speed);
    if(t >= 1) stopTickLoop();
  }, 40);
}

function stopTickLoop(){
  if(tickTimer){
    clearInterval(tickTimer);
    tickTimer = null;
  }
  if(tickInstances.length){
    tickInstances.forEach(a=>{
      try{ a.pause(); a.currentTime = 0; }catch(e){}
    });
    tickInstances = [];
  }
}

function startTickLoopFree(){
  stopTickLoop();
  let speed = 1;
  tickTimer = setInterval(()=>{
    playTick(speed);
    speed = Math.max(0.12, speed - 0.02);
  }, 40);
}
const wheelEl = $("wheel");
if (wheelEl) {
  wheelEl.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    stopTickLoop();
  });
}
  function showToast(type, message, opts = {}){
  const root = document.getElementById("toastRoot");
  if(!root) return;

  const t = (type==="success"||type==="info"||type==="error") ? type : "info";
  const title = (opts.title != null) ? String(opts.title)
    : (t==="success" ? "Success" : t==="error" ? "Error" : "Info");
  const duration = Number.isFinite(opts.duration) ? opts.duration : 2600;

  const ICONS = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9.2 16.6 4.9 12.3a1 1 0 1 1 1.4-1.4l2.9 2.9 8.5-8.5a1 1 0 1 1 1.4 1.4l-9.9 9.9a1 1 0 0 1-1.4 0Z" fill="#27d17f"/>
    </svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" fill="rgba(54,162,255,.18)"/>
      <path d="M12 10.2c.55 0 1 .45 1 1V17a1 1 0 1 1-2 0v-5.8c0-.55.45-1 1-1Zm0-3.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" fill="#36a2ff"/>
    </svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" fill="rgba(255,77,77,.18)"/>
      <path d="M8.7 8.7a1 1 0 0 1 1.4 0L12 10.6l1.9-1.9a1 1 0 1 1 1.4 1.4L13.4 12l1.9 1.9a1 1 0 0 1-1.4 1.4L12 13.4l-1.9 1.9a1 1 0 0 1-1.4-1.4L10.6 12 8.7 10.1a1 1 0 0 1 0-1.4Z" fill="#ff4d4d"/>
    </svg>`
  };

  const el = document.createElement("div");
  el.className = `toast ${t}`;
  el.setAttribute("role","status");

  el.innerHTML = `
    <div class="t-icon">${ICONS[t]}</div>
    <div class="t-body">
      <p class="t-title">${escapeHtml(title)}</p>
      <p class="t-msg">${escapeHtml(String(message ?? ""))}</p>
    </div>
    <button class="t-close" type="button" aria-label="Close toast">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7.5 7.5 16.5 16.5M16.5 7.5 7.5 16.5"
          stroke="rgba(233,236,255,.9)" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  let closed = false;
  const close = () => {
    if(closed) return;
    closed = true;
    el.classList.add("hide");
    setTimeout(()=> el.remove(), 220);
  };

  el.querySelector(".t-close").addEventListener("click", close);

  root.appendChild(el);
  setTimeout(close, Math.max(800, duration));

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
}
  let currentCode = "";
  let currentPrize = null;
  let currentCustomer = "";
  let spinning = false;
  let wheelRot = 0;
let prizeCfgCache = { NORMAL:[], SUPER:[] };

function watchPrizeConfig(){
  onValue(ref(db,"settings/prizes"), (snap)=>{
    if(!snap.exists()) return;

    const v = snap.val() || {};
    const clean = (arr)=>{
      const raw = Array.isArray(arr) ? arr : Object.values(arr || {});
      return raw
        .map(x=>Number(x))
        .filter(x=>Number.isFinite(x) && x>0)
        .filter((x,i,a)=>a.indexOf(x)===i)
        .sort((a,b)=>a-b);
    };

    prizeCfgCache = {
      NORMAL: clean(v.NORMAL ?? prizeCfgCache.NORMAL),
      SUPER:  clean(v.SUPER  ?? prizeCfgCache.SUPER)
    };

    const merged = [...prizeCfgCache.NORMAL, ...prizeCfgCache.SUPER];
    if(currentCode){
      buildSegmentsFromList(merged);
    }
  });
}
watchPrizeConfig();
  
  async function loadPrizeConfig(){
  const snap = await get(ref(db, "settings/prizes"));
  if(snap.exists()) return snap.val();
  return { NORMAL:[0,0,0,0], SUPER:[0,0,0,0] };
}

  const LS_UID = "lucky.userId.v1";
  function uid(){
    let id = localStorage.getItem(LS_UID);
    if(!id){
      id = "U" + Math.random().toString(16).slice(2) + Date.now().toString(16);
      localStorage.setItem(LS_UID, id);
    }
    return id;
  }
const userId = uid();
let segments = [];
let segCount = 0;
let segAngle = 0;

function buildSegmentsFromList(list){
  const arr = (list || [])
    .map(v => Number(v))
    .filter(v => Number.isFinite(v) && v > 0)
    .filter((v,i,a)=> a.indexOf(v) === i)
    .sort((a,b)=>a-b);

  segments = arr.map(v => ({ label:`Angpao ${v}`, points:v }));
  segCount = segments.length || 1;
  segAngle = 360 / segCount;
  applyWheelTheme();
const radius = 95;

const st = $("sliceText");
st.innerHTML = segments.map((s,i)=>{
  const ang = (i*segAngle) + segAngle/2;
  return `<span class="sliceLabel" style="--ang:${ang}deg;--rad:${radius}px">
    ${s.label}
  </span>`;
}).join("");

st.querySelectorAll(".sliceLabel").forEach(el=>{
  const ang = parseFloat(el.style.getPropertyValue("--ang")) || 0;
  const norm = ((ang % 360) + 360) % 360;
  el.dataset.flip = (norm > 90 && norm < 270) ? "1" : "0";
});
}
function applyWheelTheme(){
  const wheel = $("wheel");
  if(!wheel) return;

  const colors = [
    "#ff77e1","#ff6b6b","#4dd4c6","#3aa9ff",
    "#6ee7a6","#ffd166","#7c5cff","#50fa7b",
    "#ff9f1c","#00d2ff"
  ];

  const n = segments.length || 1;
  const step = 100 / n;
  const stops = [];

  for(let i=0;i<n;i++){
    stops.push(`${colors[i % colors.length]} ${(i*step)}% ${((i+1)*step)}%`);
  }

  wheel.style.background = `conic-gradient(from -90deg, ${stops.join(",")})`;
}


  function showEnter(msg="", isBad=false){
    $("enterMsg").textContent = msg;
    $("enterMsg").style.color = isBad ? "rgba(255,180,180,.95)" : "rgba(233,236,255,.85)";
  }

  function gotoWheel(code){
    $("pageEnter").classList.add("hidden");
    $("pageWheel").classList.remove("hidden");
    $("codeLabel").textContent = code;
  }

 function gotoEnter(){
  stopTickLoop(); 
  $("pageWheel").classList.add("hidden");
  $("pageEnter").classList.remove("hidden");
  $("promoInput").value = "";
  showEnter("");
}

  $("navSpin").onclick = (e)=>{ e.preventDefault(); gotoEnter(); };
  function fmtTime(ts){
    const d=new Date(ts);
    return d.toLocaleString();
  }

function renderHistory(arr){
  if(!arr.length){
    $("histList").textContent = "No history yet.";
    return;
  }

  $("histList").innerHTML = arr.map(x=>`
    <div class="histItem">
      <div>
        <b>${String(x.code||"").toUpperCase()}</b>
        <div style="opacity:.75;font-size:12px">${fmtTime(x.redeemedAt)}</div>
      </div>
      <div class="badge">Angpao ${Number(x.points||0)}</div>
    </div>
  `).join("");
}


function watchGlobalHistory(){
  onValue(ref(db, "redemptionsAll"), (snap)=>{
    const v = snap.val() || {};
    const arr = Object.keys(v).map(k => v[k])
      .filter(x => x && x.code && x.redeemedAt)
      .sort((a,b)=> (b.redeemedAt||0) - (a.redeemedAt||0))
      .slice(0, 30);

    renderHistory(arr);
  });
}
watchGlobalHistory();

  async function validateCode(code){
    const snap = await get(ref(db, `promo_codes/${code}`));
    if(!snap.exists()) return { ok:false, msg:"Code not found." };
    const data = snap.val();
    const now = Date.now();

    if(now >= data.expiresAt) return { ok:false, msg:"Code expired." };
    if((data.usedCount||0) >= (data.usageLimit||1)) return { ok:false, msg:"This code has already been used." };

    return { ok:true, data };
  }

$("btnStart").onclick = async ()=>{
  armSoundsOnce();
  const cust = ($("customerInput").value || "").trim();
  const code = ($("promoInput").value || "").trim().toUpperCase();

  if(!cust) return showEnter("Please enter Username.", true);
  if(!code) return showEnter("Please enter code.", true);

  showEnter("Checking code...", false);

  const res = await validateCode(code);
  if(!res.ok) return showEnter(res.msg, true);

  const promoCustomer = String(res.data.customer || "").trim();
  if(!promoCustomer){
    return showEnter("This code has no customer assigned. Please contact us.", true);
  }

 
  if(cust.toUpperCase() !== promoCustomer.toUpperCase()){
    return showEnter("Invalid username.", true);
  }

  currentCustomer = promoCustomer;
  currentCode = code;
  currentPrize = res.data;

  const merged = [...(prizeCfgCache.NORMAL||[]), ...(prizeCfgCache.SUPER||[])];
  const mergedClean = merged
    .map(Number)
    .filter(v => Number.isFinite(v) && v > 0)
    .filter((v,i,a)=>a.indexOf(v)===i)
    .sort((a,b)=>a-b);

  buildSegmentsFromList(mergedClean);
  gotoWheel(code);
};

function segmentIndexByPoints(points){
  return segments.findIndex(s => s.points === Number(points));
}

function calcStopRotationForIndex(idx){
  const targetCenter = idx*segAngle + segAngle/2;
  const POINTER_OFFSET = 0; 
  return 360 - targetCenter + POINTER_OFFSET;
}
function norm360(deg){
  return ((deg % 360) + 360) % 360;
}
  async function redeemAndSave(code, points){
    const usedRef = ref(db, `promo_codes/${code}/usedCount`);
    const result = await runTransaction(usedRef, (cur)=>{
      if(cur === null) return 1;
      return cur + 1;
    }, { applyLocally:false });

    if(!result.committed){
      throw new Error("Failed to redeem. Please try again.");
    }
    const ridRef = push(ref(db, `redemptionsByCode/${code}`));
    const ridKey = ridRef.key;

const payload = {
  code,
  points,
  customer: currentCustomer || (currentPrize?.customer || ""),
  userId,
  redeemedAt: Date.now()
};

    await set(ridRef, payload);
    await set(ref(db, `userHistory/${userId}/${ridKey}`), {
      code, points, redeemedAt: payload.redeemedAt
    });

await set(ref(db, `redemptionsAll/${ridKey}`), {
  ridKey,
  code,
  points,
  customer: payload.customer || "",
  userId,
  redeemedAt: payload.redeemedAt
});

await update(ref(db, `promo_codes/${code}`), {
  claimedAt: payload.redeemedAt,
  claimStatus: "APPROVED",
  claimedByUserId: userId,
  claimedCustomer: payload.customer || ""
});
    return payload;
  }

  function openModal(winPoints, code){
    playWin();
    stopTickLoop();
    $("winText").textContent = `Angpao ${winPoints}`;
    $("winCode").textContent = code;
    $("overlay").style.display = "grid";

    let sec = 25;
    $("redirectText").textContent = `Auto-redirect in ${sec} seconds`;
    clearInterval(window.__iv);
    window.__iv = setInterval(()=>{
      sec--;
      $("redirectText").textContent = `Auto-redirect in ${sec} seconds`;
      if(sec<=0){
        clearInterval(window.__iv);
        $("overlay").style.display="none";
        gotoEnter();
      }
    },1000);
  }

$("btnClose").onclick = ()=>{
  stopTickLoop();
  $("overlay").style.display="none";
  gotoEnter();
};

$("btnOk").onclick = ()=>{
  stopTickLoop();
  $("overlay").style.display="none";
  gotoEnter();
};

  $("btnSpin").onclick = async ()=>{
    if(spinning) return;
    if(!currentPrize || !currentCode) return;
    armSoundsOnce();
    playStart();
    startTickLoopFree();
    spinning = true;
    $("btnSpin").disabled = true;

  
    const res = await validateCode(currentCode);
    if(!res.ok){
      stopTickLoop();
      showToast("error", res.msg);
      spinning = false;
      $("btnSpin").disabled = false;
      gotoEnter();
      return;
    }

    const winPoints = Number(res.data.points||0);
    const idx = segmentIndexByPoints(winPoints);
if(idx < 0){
  stopTickLoop();
  showToast("error", `Invalid code lucky wheel.`, { duration: 4500 });
  spinning = false;
  $("btnSpin").disabled = false;
  return;
}

const spins = 4 + Math.floor(Math.random()*3);
const base  = 360 * spins;
const stopAngle = norm360(calcStopRotationForIndex(idx));


const currentAngle = norm360(wheelRot);

let delta = stopAngle - currentAngle;
if(delta < 0) delta += 360;

wheelRot = wheelRot + base + delta;

$("wheel").style.transform = `rotate(${wheelRot}deg)`;
    setTimeout(async ()=>{
      try{
        await redeemAndSave(currentCode, winPoints);
        openModal(winPoints, currentCode);
      }catch(e){
        stopTickLoop();
        showToast("error", e.message || "Redeem failed.");
      }finally{
        stopTickLoop();
        spinning = false;
        $("btnSpin").disabled = false;
      }
    }, 4200);
  };
