let currentRotationDeg = 0;
import { db } from "./shared401/pathconfig-3g4q12pwd.js";
import {
  ref, get, set, push, child, runTransaction, onValue, update
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
const $ = (id)=>document.getElementById(id);
const CURRENT_SITE = "spm888"; 
const sfxStart = $("sfxStart");
const sfxTick  = $("sfxTick");
const sfxWin   = $("sfxWin");

let soundArmed = false;
let tickTimer = null;
let tickInstances = [];

async function armSoundsOnce(){
  if(soundArmed) return;
  soundArmed = true;

  const warm = async (a, vol=0.01)=>{
    if(!a) return;
    try{
      a.volume = vol;
      a.currentTime = 0;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.volume = 1;
    }catch(e){}
  };

  await warm(sfxStart);
  await warm(sfxTick);
  await warm(sfxWin);
  if(sfxStart) sfxStart.volume = 0.95;
  if(sfxTick)  sfxTick.volume  = 0.35;
  if(sfxWin)   sfxWin.volume   = 0.95;
}

document.addEventListener("click", armSoundsOnce, { once:true });
[sfxStart, sfxTick, sfxWin].forEach(a=>{
  if(!a) return;
  try { a.load(); } catch(e){}
});

function playStart(){
  if(!sfxStart || !soundArmed) return;
  try{
    sfxStart.pause();
    sfxStart.currentTime = 0;
    sfxStart.volume = 0.95;
    sfxStart.play().catch(()=>{});
  }catch(e){}
}

function playTick(speed01 = 1){
  if(!sfxTick || !soundArmed) return;

  try{
    sfxTick.pause();
    sfxTick.currentTime = 0;
    sfxTick.volume = 0.35;
    sfxTick.playbackRate = 1.0;
    sfxTick.play().catch(()=>{});
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
  try{
    if(sfxTick){
      sfxTick.pause();
      sfxTick.currentTime = 0;
    }
  }catch(e){}
}

function startTickLoopFree(totalMs = 4200){
  stopTickLoop();
  const startAt = performance.now();
  let nextAt = startAt;

  tickTimer = setInterval(()=>{
    const now = performance.now();
    const t = (now - startAt) / totalMs;
    if(t >= 1){
      stopTickLoop();
      return;
    }
    const interval = 55 + (140 - 55) * t;

    if(now >= nextAt){
      playTick(1 - t);
      nextAt = now + interval;
    }
  }, 16);
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

const colors = ["#FFD166","#F4A261","#E9C46A","#2A9D8F","#264653","#C1121F","#FFB703","#003566","#FB8500","#6A040F"
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
  $("home%articlepage=superman888%filter_at&update=today_reach_page%spin_&superman888_site%3A2B11_%CMD=draw_site%_filter=site%")?.classList.add("hidden");
  $("pageEnter").classList.remove("hidden");
  $("promoInput").value = "";
  showEnter("");
}
function gotoArticle(){
  stopTickLoop();
  $("pageEnter").classList.add("hidden");
  $("pageWheel").classList.add("hidden");
  $("home%articlepage=superman888%filter_at&update=today_reach_page%spin_&superman888_site%3A2B11_%CMD=draw_site%_filter=site%").classList.remove("hidden");
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
  const c = String(code || "").trim().toUpperCase();

  const snap = await get(ref(db, `promo_codes/${c}`));
  if(!snap.exists()) return { ok:false, msg:"Code not found." };

  const data = snap.val() || {};
  const now = Date.now();
  const codeSite = String(data.site || "").trim().toLowerCase();
  const pageSite = String(CURRENT_SITE || "").trim().toLowerCase();
  if(codeSite && pageSite && codeSite !== pageSite){
    return { ok:false, msg:"Code not available for this site." };
  }

  if(now >= Number(data.expiresAt||0)) return { ok:false, msg:"Code expired." };
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
    const siteName = String(currentPrize?.site || "").trim() || "-";

const payload = {
  code,
  site: siteName,
  points,
  customer: currentCustomer || (currentPrize?.customer || ""),
  userId,
  redeemedAt: Date.now()
};

    await set(ridRef, payload);
await set(ref(db, `userHistory/${userId}/${ridKey}`), {
  code,
  site: siteName,
  points,
  redeemedAt: payload.redeemedAt
});

await set(ref(db, `redemptionsAll/${ridKey}`), {
  ridKey,
  code,
  site: siteName,
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
  await armSoundsOnce();
  playStart();
  const SPIN_MS = 6300;
  startTickLoopFree(SPIN_MS);
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

const spins = 6 + Math.floor(Math.random()*3);
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
}, SPIN_MS);
};
(function initBottomNav(){
  const items = document.querySelectorAll(".bnItem");
  if(!items.length) return;

  function setActiveByUrl(){
    const url = location.href;
    items.forEach(a=>{
      a.classList.remove("active");

      const href = a.getAttribute("href");
      if(!href) return;
      if(href.startsWith("#") && location.hash === href){
        a.classList.add("active");
      }

      if(href.startsWith("http") && url.startsWith(href)){
        a.classList.add("active");
      }
      if(!href.startsWith("http") && url.includes(href)){
        a.classList.add("active");
      }
    });
  }

  items.forEach(a=>{
    a.addEventListener("click", ()=>{
      items.forEach(x=>x.classList.remove("active"));
      a.classList.add("active");
    });
  });

  window.addEventListener("hashchange", setActiveByUrl);
  setActiveByUrl();
})();
const btnBackHome = $("btnBackHome");
if(btnBackHome){
  btnBackHome.onclick = ()=>{
    location.hash = "#pageEnter";
    gotoEnter();
  };
}
function handleHashPage(){
  const h = (location.hash || "#pageEnter").toLowerCase();

  if(h === "#home%articlepage=superman888%filter_at&update=today_reach_page%spin_&superman888_site%3A2B11_%CMD=draw_site%_filter=site%"){
    gotoArticle();
  } else if(h === "#pagewheel"){
    // optional: kalau kau nak direct buka wheel page
    $("pageEnter")?.classList.add("hidden");
    $("home%articlepage=superman888%filter_at&update=today_reach_page%spin_&superman888_site%3A2B11_%CMD=draw_site%_filter=site%")?.classList.add("hidden");
    $("pageWheel")?.classList.remove("hidden");
  } else {
    gotoEnter();
  }
}

window.addEventListener("hashchange", handleHashPage);
handleHashPage();
  (function initHomeSlider(){
    const track = document.getElementById("slideTrack");
    if (!track) return;

    const prevBtn = document.getElementById("sliderPrev");
    const nextBtn = document.getElementById("sliderNext");

    let slides = Array.from(track.children).filter(el => el.tagName === "IMG" || el.querySelector?.("img") || el.classList?.contains("slide"));
    if (!slides.length) slides = Array.from(track.querySelectorAll("img"));

    const realCount = slides.length;
    if (realCount <= 1) return;

    const firstClone = slides[0].cloneNode(true);
    const lastClone  = slides[realCount - 1].cloneNode(true);

    track.insertBefore(lastClone, track.firstChild);
    track.appendChild(firstClone);

    let index = 1;
    let isAnimating = false;
    const DURATION = 800;
    const INTERVAL = 3500;

    function setTransform(withAnim = true){
      track.style.transition = withAnim ? `transform ${DURATION}ms ease-in-out` : "none";
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    setTransform(false);

    function goNext(){
      if (isAnimating) return;
      isAnimating = true;
      index += 1;
      setTransform(true);
    }

    function goPrev(){
      if (isAnimating) return;
      isAnimating = true;
      index -= 1;
      setTransform(true);
    }

    track.addEventListener("transitionend", () => {
      if (index === 0) {
        index = realCount;
        setTransform(false);
      }
      if (index === realCount + 1) {
        index = 1;
        setTransform(false);
      }
      isAnimating = false;
    });

    let timer = setInterval(goNext, INTERVAL);

    function resetTimer(){
      clearInterval(timer);
      timer = setInterval(goNext, INTERVAL);
    }

    if (nextBtn) nextBtn.addEventListener("click", () => { goNext(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { goPrev(); resetTimer(); });

    const slider = track.closest(".home-hero-slider");
    if (slider) {
      slider.addEventListener("mouseenter", () => clearInterval(timer));
      slider.addEventListener("mouseleave", () => timer = setInterval(goNext, INTERVAL));
    }
  })();
