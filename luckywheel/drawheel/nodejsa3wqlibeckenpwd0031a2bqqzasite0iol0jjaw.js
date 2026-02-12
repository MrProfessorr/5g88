import { db, auth } from "./shared505/indexps0134aq2bfc1c2ba40ao.js";
const SESSION_HOURS = 6;
import {
  ref, set, get, child, onValue, query, limitToLast, remove, update
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

import {
  onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
function getNiceUsername(user){
  const dn = (user?.displayName || "").trim();
  if(dn) return dn;

  const em = (user?.email || "").trim();
  if(em && em.includes("@")) return em.split("@")[0];

  return (user?.uid || "User").slice(0,8);
}

function initUserMenuUI(){
  const menu = document.getElementById("userMenu");
  const btn  = document.getElementById("userBtn");
  const out  = document.getElementById("navUsername");

  if(!menu || !btn || !out) return;

  btn.addEventListener("click", (e)=>{
    e.preventDefault();
    e.stopPropagation();
    menu.classList.toggle("open");
  });

  document.addEventListener("click", (e)=>{
    if(!menu.contains(e.target)) menu.classList.remove("open");
  });

  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") menu.classList.remove("open");
  });
}

window.addEventListener("DOMContentLoaded", initUserMenuUI);

const LOGIN_PORTAL = "https://portal-luckydraw.vercel.app/";
function goLogin(){
  const rt = encodeURIComponent(location.href);
  location.replace(`${LOGIN_PORTAL}?redirect=${rt}&t=${Date.now()}`);
}
function getTicketFromUrl(){
  try{
    return new URL(location.href).searchParams.get("ticket");
  }catch(_){
    return null;
  }
}

function hasAdminSession(){
  const uid = localStorage.getItem("admin_uid");
  const until = Number(localStorage.getItem("admin_until") || 0);
  return !!uid && Date.now() < until;
}

function setAdminSession(uid, email){
  const until = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  localStorage.setItem("admin_uid", uid);
  localStorage.setItem("admin_email", email || "");
  localStorage.setItem("admin_until", String(until));
}

function clearAdminSession(){
  localStorage.removeItem("admin_uid");
  localStorage.removeItem("admin_email");
  localStorage.removeItem("admin_until");
}

async function claimTicketIfAny(){
  const ticket = getTicketFromUrl();
  if(!ticket) return false;

  const snap = await get(ref(db, `adminTickets/${ticket}`));
  if(!snap.exists()) return false;

  const data = snap.val() || {};
  const now = Date.now();

  if(now > Number(data.expiresAt || 0) || !data.uid){
    await remove(ref(db, `adminTickets/${ticket}`));
    return false;
  }

  // sekali guna
  await remove(ref(db, `adminTickets/${ticket}`));

  // set session dekat domain admin
  setAdminSession(data.uid, data.email || "");

  // buang ticket dari URL
  const clean = new URL(location.href);
  clean.searchParams.delete("ticket");
  history.replaceState({}, "", clean.toString());

  return true;
}

window.addEventListener("DOMContentLoaded", async ()=>{
  await setPersistence(auth, browserLocalPersistence);

 onAuthStateChanged(auth, async (user)=>{
  try{
    // ✅ 1) claim ticket dulu (tak perlu auth)
    await claimTicketIfAny();

    // ✅ 2) kalau tak ada session lepas claim → pergi login
    if(!hasAdminSession()){
      goLogin();
      return;
    }

    // ✅ 3) validate admin guna uid dari session (bukan user.uid)
    const uid = localStorage.getItem("admin_uid");
    const email = localStorage.getItem("admin_email") || "";

    const ok = await isAllowedAdmin(uid);
    if(!ok){
      clearAdminSession();
      try{ await signOut(auth); }catch(_){}
      goLogin();
      return;
    }

    // ✅ 4) optional: kalau user auth wujud, sync email (tak wajib)
    if(user?.uid && user.uid === uid){
      setAdminSession(uid, user.email || email || "");
    }

    const nameEl = document.getElementById("navUsername");
    if(nameEl){
      const em = localStorage.getItem("admin_email") || email || "Admin";
      nameEl.textContent = em.includes("@") ? em.split("@")[0] : em;
    }

    document.documentElement.style.visibility = "visible";
  }catch(e){
    console.error("boot auth/ticket error", e);
    showToast("error", "Auth/Ticket failed");
    clearAdminSession();
    try{ await signOut(auth); }catch(_){}
    goLogin();
  }
});
});
let selectedSite = "";

function initSitePicker(){
  const wrap = document.getElementById("sitePick");
  const customerInput = document.getElementById("customer");
  if(!wrap || !customerInput) return;

  const btns = wrap.querySelectorAll(".siteBtn");
  customerInput.disabled = true;

  btns.forEach(btn=>{
    btn.classList.remove("active");

    btn.addEventListener("click", ()=>{
      // set site
      selectedSite = btn.dataset.site || "";

      // toggle active
      btns.forEach(b=>b.classList.toggle("active", b === btn));

      // enable input bila site dipilih
      customerInput.disabled = false;
      customerInput.focus();
    });
  });
}

window.addEventListener("DOMContentLoaded", initSitePicker);

const $ = (id)=>document.getElementById(id);
async function isAllowedAdmin(uid){
  const snap = await get(ref(db, `isloading/${uid}`));
  return snap.exists() && snap.val() === true;
}
function showToast(type, msg, opt = {}) {
  const el = document.getElementById("toast");
  if (!el) return;

  const duration = opt.duration ?? 2400;

  el.style.display = "block";
  requestAnimationFrame(()=> el.classList.add("show"));

  if (type === "error") el.style.borderColor = "rgba(255,77,77,.55)";
  else if (type === "success") el.style.borderColor = "rgba(39,209,127,.55)";
  else el.style.borderColor = "rgba(255,255,255,.14)";

  el.textContent = msg;

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => {
      el.style.display = "none";
    }, 220);
  }, duration);
}

// alias lama kalau masih ada panggilan toast("...")
const toast = (msg)=> showToast("info", msg);
let pointsCSApi = null;
let prizeFilterCSApi = null;
let statusFilterCSApi = null;
  
function buildCustomSelect(selectEl, mountEl){
  if(!selectEl || !mountEl) return;

  mountEl.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "cs";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "csBtn";
  btn.innerHTML = `
    <span class="csLabel">-- Select --</span>
    <span class="csArrow">▾</span>
  `;

  const menu = document.createElement("div");
  menu.className = "csMenu";

  wrap.appendChild(btn);
  wrap.appendChild(menu);
  mountEl.appendChild(wrap);

  const labelEl = btn.querySelector(".csLabel");

  function close(){ wrap.classList.remove("open"); }
  function open(){
    wrap.classList.add("open");
    const act = menu.querySelector(".csItem.active") || menu.querySelector(".csItem.selected");
    if(act) act.scrollIntoView({block:"nearest"});
  }
  function toggle(){ wrap.classList.contains("open") ? close() : open(); }

  function setLabelFromSelect(){
    const opt = selectEl.options[selectEl.selectedIndex];
    labelEl.textContent = opt ? opt.textContent : "-- Select --";
  }

  function syncActiveSelected(){
    const v = selectEl.value;
    menu.querySelectorAll(".csItem").forEach(it=>{
      it.classList.remove("active","selected");
      if(it.dataset.value === v) it.classList.add("active","selected");
    });
    setLabelFromSelect();
  }

  function rebuild(){
    menu.innerHTML = "";
    [...selectEl.options].forEach(opt=>{
      const item = document.createElement("div");
      item.className = "csItem";
      item.textContent = opt.textContent;
      item.dataset.value = opt.value;

      item.addEventListener("click", ()=>{
        selectEl.value = opt.value;
        selectEl.dispatchEvent(new Event("change", {bubbles:true}));
        close();
      });

      menu.appendChild(item);
    });

    setLabelFromSelect();
    syncActiveSelected();
  }

  btn.addEventListener("click", toggle);

  document.addEventListener("click", (e)=>{
    if(!wrap.contains(e.target)) close();
  });

  btn.addEventListener("keydown", (e)=>{
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); toggle(); }
    if(e.key === "Escape"){ close(); }
  });

  selectEl.addEventListener("change", syncActiveSelected);

  rebuild();

  return { rebuild, close, open };
}

function initPointsCustomSelect(){
  const sel = $("points");
  const mount = document.getElementById("pointsCS");
  if(!sel || !mount) return;
  pointsCSApi = buildCustomSelect(sel, mount);
}

function refreshPointsCustomSelect(){
  if(pointsCSApi && pointsCSApi.rebuild) pointsCSApi.rebuild();
}
function initPrizeFilterCustomSelect(){
  const sel = $("prizeFilter");
  const mount = document.getElementById("prizeFilterCS");
  if(!sel || !mount) return;
  prizeFilterCSApi = buildCustomSelect(sel, mount);
}
function refreshPrizeFilterCustomSelect(){
  if(prizeFilterCSApi && prizeFilterCSApi.rebuild) prizeFilterCSApi.rebuild();
}
function initStatusFilterCustomSelect(){
  const sel = $("statusFilter");
  const mount = document.getElementById("statusFilterCS");
  if(!sel || !mount) return;
  statusFilterCSApi = buildCustomSelect(sel, mount);
}
function refreshStatusFilterCustomSelect(){
  if(statusFilterCSApi && statusFilterCSApi.rebuild) statusFilterCSApi.rebuild();
}
function cleanPrizeList(arr){
  return (arr || [])
    .map(v => Number(v))
    .filter(v => Number.isFinite(v) && v > 0)
    .filter((v,i,a) => a.indexOf(v) === i)
    .sort((a,b)=>a-b);
}
// ===== Prize settings in Firebase =====
const PRIZES_REF = ref(db, "settings/prizes");

// default kalau Firebase kosong
let prizeConfig = {
  NORMAL: [],
  SUPER:  []
};

async function loadPrizeConfig(){
  const snap = await get(PRIZES_REF);

  if(snap.exists()){
    const v = snap.val() || {};
    prizeConfig = {
      NORMAL: cleanPrizeList(v.NORMAL ?? prizeConfig.NORMAL),
      SUPER:  cleanPrizeList(v.SUPER  ?? prizeConfig.SUPER)
    };
  }else{
    // pastikan default pun bersih sebelum simpan
    prizeConfig = {
      NORMAL: cleanPrizeList(prizeConfig.NORMAL),
      SUPER:  cleanPrizeList(prizeConfig.SUPER)
    };
    await set(PRIZES_REF, prizeConfig);
  }
}

// Render dropdown points ikut prizeConfig
function renderPointsOptions(type){
  const list = (prizeConfig[type] || []).slice().sort((a,b)=>a-b);
  const sel = $("points");
  sel.innerHTML = list.map(p => `<option value="${p}">FREE ${p}</option>`).join("");
  if(list.length) sel.value = String(list[0]);
  refreshPointsCustomSelect();
}

// Prize type toggle
let prizeType = "NORMAL";

await loadPrizeConfig();
renderPointsOptions(prizeType);
initPointsCustomSelect();
refreshPointsCustomSelect();

$("typeNormal").onclick = ()=>{
  prizeType="NORMAL";
  $("typeNormal").classList.add("active");
  $("typeSuper").classList.remove("active");
  renderPointsOptions(prizeType);
};

$("typeSuper").onclick = ()=>{
  prizeType="SUPER";
  $("typeSuper").classList.add("active");
  $("typeNormal").classList.remove("active");
  renderPointsOptions(prizeType);
};

  // Random code generator
  function genCode(len=6){
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out="";
    for(let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
    return out;
  }
  async function generateUniqueCode(){
    for(let i=0;i<20;i++){
      const c = genCode(6);
      const snap = await get(ref(db, `promo_codes/${c}`));
      if(!snap.exists()) return c;
    }
    // fallback
    return genCode(8);
  }

  // Generate button
  $("btnGenerate").onclick = async ()=>{
    if(!selectedSite){
    toast("Please select site first!");
    return;
  }
    const customer = $("customer").value.trim();
    if(!customer){
    toast("Please enter Customer Name/ID first!");
    $("customer").focus();
    return;
  }
    const points = Number($("points").value);
    const expHours = Math.max(1, Number($("expHours").value || 24));
    const usageLimit = Math.max(1, Number($("usageLimit").value || 1));

    const code = await generateUniqueCode();
    const now = Date.now();
    const expiresAt = now + expHours*3600*1000;

const payload = {
  code,
  site: selectedSite,
  customer: customer || "",
  points,
  prizeType,
  usageLimit,
  usedCount: 0,
  createdAt: now,
  expiresAt,
  claimedAt: null,        
  claimStatus: "Pending",
  status: "ACTIVE"
};

    await set(ref(db, `promo_codes/${code}`), payload);

    $("genCode").textContent = code;
    $("genMeta").textContent = `${prizeType} • FREE ${points} • limit ${usageLimit} • expires in ${expHours}h`;
    $("btnCopy").disabled = false;
    $("btnCopy").dataset.code = code;
    toast("Code generated!");
  };

$("btnCopy").onclick = async () => {
  const code = $("btnCopy").dataset.code;
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    showToast("success", "Code copied!");
  } catch (err) {
    showToast("error", "Copy failed!");
    console.error(err);
  }
};
  // ===== Load Active Codes =====
  let allCodes = [];
  let codeCustomerMap = {};
  let activeSiteFilterCodes = "";
  let activeSiteFilterHist  = "";
  function statusTag(obj){
    const now = Date.now();
    const expired = now >= obj.expiresAt;
    const full = obj.usedCount >= obj.usageLimit;
    if(expired) return `<span class="tag bad">EXPIRED</span>`;
    if(full) return `<span class="tag warn">FULL</span>`;
    return `<span class="tag ok">ACTIVE</span>`;
  }

  function fmtTime(ts){
    const d = new Date(ts);
    return d.toLocaleString();
  }
function renderSiteBadge(site){
  const s = String(site || "-").trim().toUpperCase();
  let cls = "";
  if(s === "5G88") cls = "site-5g88";
  else if(s === "SPM888") cls = "site-spm888";
  return `<span class="siteBadge ${cls}">${s || "-"}</span>`;
}
function toDateKeyLocal(d){
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth()+1).padStart(2,"0");
  const da = String(x.getDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}
function startOfMonthKeyLocal(d){
  const x = new Date(d);
  x.setHours(0,0,0,0);
  x.setDate(1);
  return toDateKeyLocal(x);
}
function endOfMonthKeyLocal(d){
  const x = new Date(d);
  x.setHours(0,0,0,0);
  x.setMonth(x.getMonth()+1, 0); // last day current month
  return toDateKeyLocal(x);
}
function centerFlatpickr(inst){
  const cal = inst?.calendarContainer;
  const input = inst?.input;
  if(!cal || !input) return;

  // class untuk css optional
  cal.classList.add("centered");

  requestAnimationFrame(()=>{
    const r = input.getBoundingClientRect();

    const calW = cal.offsetWidth || 320;
    const calH = cal.offsetHeight || 300;

    // ✅ bawah input
    let top = r.bottom + 8;

    // ✅ tengah input
    let left = (r.left + r.width / 2) - (calW / 2);

    // clamp supaya tak keluar screen
    const pad = 12;
    left = Math.max(pad, Math.min(left, window.innerWidth - calW - pad));
    top  = Math.max(pad, Math.min(top,  window.innerHeight - calH - pad));

    // ✅ pakai fixed supaya tak lari bila parent ada transform
    cal.style.position = "fixed";
    cal.style.left = `${left}px`;
    cal.style.top  = `${top}px`;
    cal.style.transform = "none";
    cal.style.zIndex = "99999999";
  });
}
function applyResponsiveFlatpickr(inst){
  if(!inst) return;

  const isMobile = window.matchMedia("(max-width: 560px)").matches;
  inst.set("showMonths", isMobile ? 1 : 2);
  setTimeout(()=> centerFlatpickr(inst), 0);
}

window.addEventListener("resize", ()=>{
  if(fpRange) applyResponsiveFlatpickr(fpRange);
  if(fpCodesRange) applyResponsiveFlatpickr(fpCodesRange);
});
function getCodesRangeFromInputs(){
  const fromV = $("codesRangeFrom")?.value;
  const toV   = $("codesRangeTo")?.value;
  if(!fromV || !toV) return null;

  const s = new Date(fromV + "T00:00:00");
  const e = new Date(toV   + "T23:59:59");
  if(s > e) return null;

  return [s.getTime(), e.getTime()];
}

async function deletePromoCode(code){
  const ok = confirm(`Delete promo code: ${code}?`);
  if(!ok) return;

  try{
    await remove(ref(db, `promo_codes/${code}`));
    toast("Promo code deleted!");
  }catch(e){
    showToast("error", "Delete failed: " + (e?.message || e));
  }
}

function renderCodes(list){
const q = $("searchCode").value.trim().toUpperCase();
const st = ($("statusFilter")?.value || "ALL").toUpperCase();

const range = getCodesRangeFromInputs();
const filtered = (list || []).filter(x=>{
  if(activeSiteFilterCodes && x.site !== activeSiteFilterCodes) return false;

  const hitSearch = !q
    ? true
    : (String(x.code||"").toUpperCase().includes(q) ||
       String(x.customer||"").toUpperCase().includes(q));

  const isApproved = !!x.claimedAt || (Number(x.usedCount||0) > 0);
  const rowStatus = isApproved ? "APPROVED" : "PENDING";
  const hitStatus = (st === "ALL") ? true : (rowStatus === st);

  let hitDate = true;
  if(range){
    const [sMs, eMs] = range;
    const t = Number(x.createdAt || 0);
    hitDate = (t >= sMs && t <= eMs);
  }

  return hitSearch && hitStatus && hitDate;
});

  const tb = $("codesTbody");
  if(!filtered.length){
    tb.innerHTML = `<tr><td colspan="12" style="color:rgba(233,236,255,.65)">No promo codes found.</td></tr>`;
    return;
  }

  const rows = filtered
    .sort((a,b)=> (b.createdAt||0)-(a.createdAt||0))
    .slice(0,200);

  const statusBadge = (x)=>{
    if (x.claimedAt || (Number(x.usedCount||0) > 0)) {
      return `<span class="tag ok small-status">Approved</span>`;
    }
    return `<span class="tag warn small-status">Pending</span>`;
  };

  tb.innerHTML = rows.map(x=>`
    <tr>
      <td>${renderSiteBadge(x.site)}</td>
      <td style="font-weight:900;letter-spacing:1px">${x.code}</td>
      <td>${x.customer||"-"}</td>
      <td>FREE ${x.points}</td>
      <td>${x.prizeType||"-"}</td>
      <td>${x.usedCount||0}</td>
      <td>${x.usageLimit||1}</td>
      <td>${fmtTime(x.expiresAt)}</td>
      <td>${x.createdAt ? fmtTime(x.createdAt) : "-"}</td>
      <td>${x.claimedAt ? fmtTime(x.claimedAt) : "-"}</td>
      <td>${statusBadge(x)}</td>
      <td style="text-align:center;">
        <button class="btnDel" data-delcode="${x.code}">Delete</button>
      </td>
    </tr>
  `).join("");

  // attach delete events
  tb.querySelectorAll("[data-delcode]").forEach(btn=>{
    btn.onclick = ()=>{
      const code = btn.getAttribute("data-delcode");
      deletePromoCode(code);
    };
  });
}
function loadCodesLive(){
  onValue(
    ref(db, "promo_codes"),
    (snap)=>{
      console.log("promo_codes exists?", snap.exists());
      const v = snap.val() || {};
      allCodes = Object.keys(v).map(k=>v[k]);

      codeCustomerMap = {};
      for(const c of allCodes){
        if(c?.code) codeCustomerMap[String(c.code).toUpperCase()] = (c.customer || "");
      }

renderCodes(allCodes);
updateSummaryUI();
scheduleSaveTodaySnapshot();
ensureYesterdaySaved();
refreshTotalsHistoryLive();

if (allHist?.length) renderHist(allHist);;
    },
    (err)=>{
      console.error("promo_codes onValue ERROR:", err);
      toast("Load codes failed: " + (err?.code || err?.message || err));
    }
  );
}
loadCodesLive();
initStatusFilterCustomSelect();
refreshStatusFilterCustomSelect();
$("statusFilter")?.addEventListener("change", ()=>renderCodes(allCodes));
  $("searchCode").addEventListener("input", ()=>renderCodes(allCodes));


  // ===== Load History (latest) =====
  let allHist = [];
async function deleteHistRow(x){
  const ok = confirm(`Delete history for code ${x._code}?`);
  if(!ok) return;

  try{
    const updates = {};

    // 1) delete group utama
    updates[`redemptionsByCode/${x._code}/${x._rid}`] = null;

    // 2) cuba delete redemptionsAll by same key (untuk data baru)
    updates[`redemptionsAll/${x._rid}`] = null;

    // 3) optional userHistory
    if(x.userId){
      updates[`userHistory/${x.userId}/${x._rid}`] = null;
    }

    // ====== fallback untuk DATA LAMA (redemptionsAll key random) ======
    const allSnap = await get(ref(db, "redemptionsAll"));
    if(allSnap.exists()){
      const all = allSnap.val() || {};
      const targetCode = String(x._code || x.code || "").toUpperCase();
      const targetAt   = Number(x.redeemedAt || 0);

      for(const k of Object.keys(all)){
        const it = all[k] || {};
        const itCode = String(it.code || "").toUpperCase();
        const itAt   = Number(it.redeemedAt || 0);

        // match paling selamat: code + redeemedAt
        if(itCode === targetCode && itAt === targetAt){
          updates[`redemptionsAll/${k}`] = null;
          break;
        }
      }
    }

    await update(ref(db), updates);
    toast("Deleted (admin + user)!");
  }catch(e){
    alert("Delete failed: " + (e.message || e));
  }
}
function renderHist(list){
  const q = $("searchHist").value.trim().toUpperCase();
const filtered = (list || []).filter(x=>{
  if(activeSiteFilterHist && x.site !== activeSiteFilterHist) return false;

  if(!q) return true;

  const code = String(x.code || x._code || "").toUpperCase();
  const user = String(x.userId || "").toUpperCase();
  const cust = String(codeCustomerMap[code] || x.customer || "").toUpperCase();
  return code.includes(q) || user.includes(q) || cust.includes(q);
});

  const tb = $("histTbody");
  if(!filtered.length){
    tb.innerHTML = `<tr><td colspan="6" style="color:rgba(233,236,255,.65)">No history found.</td></tr>`;
    return;
  }

  const rows = filtered
    .sort((a,b)=> (b.redeemedAt||0)-(a.redeemedAt||0))
    .slice(0, 500);

tb.innerHTML = rows.map(x=>`
  <tr>
    <td>${renderSiteBadge(x.site)}</td>
    <td style="font-weight:900;letter-spacing:1px">${x.code || x._code}</td>
    <td>FREE ${x.points}</td>
    <td>${(codeCustomerMap[String(x.code || x._code || "").toUpperCase()] || x.customer || x.userId || "-")}</td>
    <td>${fmtTime(x.redeemedAt)}</td>
    <td style="text-align:center;">
      <button class="btnDel" data-del="${x._code}__${x._rid}">Delete</button>
    </td>
  </tr>
`).join("");

  // attach delete events
  tb.querySelectorAll("[data-del]").forEach(btn=>{
    btn.onclick = ()=>{
      const key = btn.getAttribute("data-del");
      const [c, r] = key.split("__");
      const found = rows.find(x => x._code === c && x._rid === r);
      if(found) deleteHistRow(found);
    };
  });
}

function loadHistoryLive(){
  onValue(ref(db, "redemptionsByCode"), (snap)=>{
    const v = snap.val() || {};
    const arr = [];

    for(const code of Object.keys(v)){
      const group = v[code] || {};
      for(const rid of Object.keys(group)){
        const item = group[rid] || {};
        arr.push({
          ...item,
          _code: code,   // untuk delete path
          _rid: rid      // untuk delete path
        });
      }
    }

    allHist = arr;
    renderHist(allHist);
  });
}
  loadHistoryLive();
  $("searchHist").addEventListener("input", ()=>renderHist(allHist));
  $("btnClearView").onclick = ()=>{
    $("searchHist").value="";
    renderHist(allHist);
  };
  // ===== Sidebar UI =====
function openSidebar(){
  $("sideOverlay").style.display = "block";
  $("sidebar").classList.add("show");
}
function closeSidebar(){
  $("sideOverlay").style.display = "none";
  $("sidebar").classList.remove("show");
}
$("btnMenu").onclick = openSidebar;
$("btnSideClose").onclick = closeSidebar;
$("sideOverlay").onclick = closeSidebar;

$("sideLogout").onclick = async ()=>{
  try{
    closeSidebar();
    showToast?.("info", "Logging out...");
    clearAdminSession();          // ✅ tambah ini
    try{ await signOut(auth); }catch(_){}
  }finally{
    goLogin();
  }
};
// ===== Prize Modal UI =====
let editingType = "NORMAL";

function renderPrizePills(){
  const arr = (prizeConfig[editingType] || []).slice().sort((a,b)=>a-b);
  $("prizePills").innerHTML = arr.map(v=>`
    <div class="pillTag">
      FREE ${v}
      <button data-del="${v}" title="Remove">✕</button>
    </div>
  `).join("");

  $("prizePills").querySelectorAll("[data-del]").forEach(btn=>{
    btn.onclick = ()=>{
      const val = parseInt(btn.getAttribute("data-del"),10);
      prizeConfig[editingType] = (prizeConfig[editingType]||[]).filter(x=>x!==val);
      renderPrizePills();
    };
  });
}

function openPrizeModal(){
  $("prizeOverlay").style.display = "grid";
  editingType = "NORMAL";
  $("tabNormal").classList.add("active");
  $("tabSuper").classList.remove("active");
  renderPrizePills();
}
function closePrizeModal(){
  $("prizeOverlay").style.display = "none";
}
// ===== USER DROPDOWN ACTIONS =====
document.getElementById("dropPrize")?.addEventListener("click", async ()=>{
  // tutup dropdown dulu
  document.getElementById("userMenu")?.classList.remove("open");

  // load config then open modal
  try{
    await loadPrizeConfig();
  }catch(e){
    console.error(e);
  }
  openPrizeModal();
});

$("sidePrize").onclick = async ()=>{
  closeSidebar();
  await loadPrizeConfig();
  openPrizeModal();
};

$("tabNormal").onclick = ()=>{
  editingType = "NORMAL";
  $("tabNormal").classList.add("active");
  $("tabSuper").classList.remove("active");
  renderPrizePills();
};
$("tabSuper").onclick = ()=>{
  editingType = "SUPER";
  $("tabSuper").classList.add("active");
  $("tabNormal").classList.remove("active");
  renderPrizePills();
};

$("prizeX").onclick = closePrizeModal;
$("prizeCancel").onclick = closePrizeModal;
$("prizeOverlay").addEventListener("click",(e)=>{
  if(e.target === $("prizeOverlay")) closePrizeModal();
});

$("prizeAdd").onclick = ()=>{
  const val = parseInt(($("prizeInput").value||"").trim(),10);
  if(!Number.isFinite(val) || val<=0) return toast("Enter valid number (e.g. 100)");
  const arr = prizeConfig[editingType] || [];
  if(arr.includes(val)) return toast("Prize already exists");
  arr.push(val);
  prizeConfig[editingType] = arr.sort((a,b)=>a-b);
  $("prizeInput").value = "";
  renderPrizePills();
};

$("prizeSave").onclick = async ()=>{
  prizeConfig = {
    NORMAL: cleanPrizeList(prizeConfig.NORMAL),
    SUPER:  cleanPrizeList(prizeConfig.SUPER)
  };

  await set(PRIZES_REF, prizeConfig);

  // refresh dropdown ikut tab yang dipilih
  renderPointsOptions(prizeType);

  closePrizeModal();
  toast("Prize settings saved!");
};
const STATS_REF = ref(db, "stats/daily");

function pad2(n){ return String(n).padStart(2,"0"); }
function toDateKey(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
let fpRange = null;

function initRangePicker(){
  const rp = document.getElementById("rangePicker");
  const rf = document.getElementById("rangeFrom");
  const rt = document.getElementById("rangeTo");
  if(!rp || !rf || !rt || !window.flatpickr) return;

  const tKey = toDateKey(new Date());

  fpRange = flatpickr(rp, {
    mode: "range",
    dateFormat: "Y-m-d",
    showMonths: 2,
    clickOpens: true,
    allowInput: false,
    locale: { rangeSeparator: "  →  " },
    defaultDate: [tKey, tKey],

 onReady(selectedDates, dateStr, inst){
  rf.value = tKey;
  rt.value = tKey;
  inst.input.value = `${tKey}  →  ${tKey}`;
  applyResponsiveFlatpickr(inst);
},
 onOpen(selectedDates, dateStr, inst){
  applyResponsiveFlatpickr(inst);
},
 onMonthChange(sd, ds, inst){
  applyResponsiveFlatpickr(inst);
},
  onYearChange(sd, ds, inst){
  applyResponsiveFlatpickr(inst);
},

onClose(selectedDates, dateStr, inst){
  if(!selectedDates || selectedDates.length < 2) return;

  const fromKey = toDateKey(selectedDates[0]);
  const toKey   = toDateKey(selectedDates[1]);

  rf.value = fromKey;
  rt.value = toKey;
  inst.input.value = `${fromKey}  →  ${toKey}`;
  const hit = detectPresetFromKeys(fromKey, toKey);
  if(hit){
    setActiveChip(hit);
    return;
  }
  document.querySelectorAll("#presetRow .chipBtn").forEach(b=>b.classList.remove("active"));
  activePreset = "";
  applyStatsFilter();
}
  });
}
let fpCodesRange = null;

function initCodesRangePicker(){
  const rp = document.getElementById("codesRangePicker");
  const rf = document.getElementById("codesRangeFrom");
  const rt = document.getElementById("codesRangeTo");
  if(!rp || !rf || !rt || !window.flatpickr) return;

  const now = new Date();

  // ✅ default 1 bulan penuh
  const from0 = startOfMonthKeyLocal(now);
  const to0   = endOfMonthKeyLocal(now);

  fpCodesRange = flatpickr(rp, {
    mode: "range",
    dateFormat: "Y-m-d",
    showMonths: 2,
    clickOpens: true,
    allowInput: false,
    locale: { rangeSeparator: "  →  " },

    // ✅ start terus 1 bulan
    defaultDate: [from0, to0],

    onReady(selectedDates, dateStr, inst){
      rf.value = from0;
      rt.value = to0;

      // ✅ paksa input terus tunjuk 2 tarikh (tanpa click)
      inst.input.value = `${from0}  →  ${to0}`;

      renderCodes(allCodes);
      applyResponsiveFlatpickr(inst);
    },

    onOpen(selectedDates, dateStr, inst){
      // ✅ pastikan bila open pun kekal 2 tarikh
      inst.input.value = `${rf.value || from0}  →  ${rt.value || to0}`;
      applyResponsiveFlatpickr(inst);
    },

    onMonthChange(sd, ds, inst){
      inst.input.value = `${rf.value || from0}  →  ${rt.value || to0}`;
      applyResponsiveFlatpickr(inst);
    },

    onYearChange(sd, ds, inst){
      inst.input.value = `${rf.value || from0}  →  ${rt.value || to0}`;
      applyResponsiveFlatpickr(inst);
    },

    onClose(selectedDates, dateStr, inst){
      // kalau user pilih 1 tarikh je, jangan overwrite
      if(!selectedDates || selectedDates.length < 2){
        inst.input.value = `${rf.value || from0}  →  ${rt.value || to0}`;
        return;
      }

      const fromKey = toDateKeyLocal(selectedDates[0]);
      const toKey   = toDateKeyLocal(selectedDates[1]);

      rf.value = fromKey;
      rt.value = toKey;

      inst.input.value = `${fromKey}  →  ${toKey}`;
      renderCodes(allCodes);
    }
  });
}
function syncRangePickerUI(fromKey, toKey){
  const rp = document.getElementById("rangePicker");
  if(rp) rp.value = `${fromKey}  →  ${toKey}`;

  if(fpRange){
    fpRange.setDate([fromKey, toKey], false);
    fpRange.input.value = `${fromKey}  →  ${toKey}`;
  }
}
async function ensureYesterdaySaved(){
  const y = addDays(new Date(), -1);
  const yKey = toDateKey(y);

  try{
    const snap = await get(ref(db, `stats/daily/${yKey}`));
    if(!snap.exists()){
      await saveSnapshotForDate(y);
      console.log("[stats] catch-up saved:", yKey);
    }
  }catch(e){
    console.error("[stats] ensureYesterdaySaved error", e);
  }
}
function filterCodesByType(list, type){
  if(type === "ALL") return list || [];
  return (list || []).filter(x => String(x.prizeType||"").toUpperCase() === type);
}

function calcTotalsFromCodes(list){
  const customers = new Set();
  let totalPrize = 0;
  for(const x of (list||[])){
    const c = String(x.customer||"").trim();
    if(c) customers.add(c.toUpperCase());
    totalPrize += Number(x.points||0);
  }
  return {
    totalCustomers: customers.size,
    totalPrize,
    totalCodes: (list||[]).length
  };
}

function getStatsRowsForCurrentPreset(){
  const range = getRangeFromInputs();
  if(!range) return [];

  const [s,e] = range;

  let rows = statsDailyArr.filter(r=>{
    const d = new Date(String(r.dateKey||"") + "T00:00:00");
    return d >= s && d <= e;
  });

  // include TODAY live if covered
  const todayS = startOfDay(new Date());
  const todayE = endOfDay(new Date());
  const coverToday = (s <= todayS && e >= todayE);
  if(coverToday){
    const todayKey = toDateKey(new Date());
    rows = [buildSnapshotForDate(new Date()), ...rows.filter(x => String(x.dateKey||"") !== todayKey)];
  }

  return rows;
}
function buildSummaryTotalsForType(type){
  const rows = getStatsRowsForCurrentPreset();

  // ===== ALL: guna stats snapshot (cepat) =====
  if(type === "ALL"){
    let totalCustomers = 0, totalPrize = 0, totalCodes = 0, claim = 0, unclaim = 0;

    for(const r of rows){
      totalCustomers += Number(r.totalCustomers||0);
      totalPrize     += Number(r.totalPrize||0);
      totalCodes     += Number(r.totalCodes||0);
      claim          += Number(r.claimCount||0);
      unclaim        += Number(r.unclaimCount||0);
    }

    return { totalCustomers, totalPrize, totalCodes, claim, unclaim };
  }

  // ===== NORMAL/SUPER: kira berdasarkan allCodes ikut range =====
  const range = getRangeFromInputs();
  if(!range) return { totalCustomers:0,totalPrize:0,totalCodes:0,claim:0,unclaim:0 };

  const [s,e] = range;
  const sMs = s.getTime();
  const eMs = e.getTime();

  const want = type; // "NORMAL" / "SUPER"

  const created = (allCodes||[]).filter(x=>{
    const t = Number(x.createdAt||0);
    return t>=sMs && t<=eMs && String(x.prizeType||"").toUpperCase()===want;
  });

  const claimed = (allCodes||[]).filter(x=>{
    const t = Number(x.claimedAt||0);
    return t && t>=sMs && t<=eMs && String(x.prizeType||"").toUpperCase()===want;
  });

  const customers = new Set();
  let prizeSum = 0;
  for(const x of created){
    const c = String(x.customer||"").trim();
    if(c) customers.add(c.toUpperCase());
    prizeSum += Number(x.points||0);
  }
  const unclaim = Math.max(0, created.length - claimed.length);
  return {
    totalCustomers: customers.size,
    totalPrize: prizeSum,
    totalCodes: created.length,
    claim: claimed.length,
    unclaim
  };
}

function updateSummaryUI(){
  const sel = $("prizeFilter");
  const type = (sel?.value || "ALL").toUpperCase();

  const sum = buildSummaryTotalsForType(type);

  $("sumCustomers").textContent = Number(sum.totalCustomers||0);
  $("sumPrize").textContent     = Number(sum.totalPrize||0);
  $("sumCodes").textContent     = Number(sum.totalCodes||0);
  $("sumClaim").textContent     = Number(sum.claim||0);
  $("sumUnclaim").textContent   = Number(sum.unclaim||0);

  $("sumHint").textContent = `Summary based on Totals History (${type}).`;
}
initPrizeFilterCustomSelect();
refreshPrizeFilterCustomSelect();
$("prizeFilter")?.addEventListener("change", updateSummaryUI);

function buildSnapshotForDate(dateObj){
  const s = startOfDay(dateObj).getTime();
  const e = endOfDay(dateObj).getTime();

  const createdCodes = (allCodes||[]).filter(x=>{
    const t = Number(x.createdAt||0);
    return t >= s && t <= e;
  });

  const claimedCodes = (allCodes||[]).filter(x=>{
    const t = Number(x.claimedAt||0);
    return t && t >= s && t <= e;
  });

  const normalCodes = createdCodes.filter(x => String(x.prizeType||"").toUpperCase()==="NORMAL").length;
  const superCodes  = createdCodes.filter(x => String(x.prizeType||"").toUpperCase()==="SUPER").length;

  const totals = calcTotalsFromCodes(createdCodes);
  const claimCount = claimedCodes.length;
  const createdSet = new Set(
    createdCodes.map(x => String(x.code || "").toUpperCase()).filter(Boolean)
  );

  const claimedSameDayForCreatedSameDay = (allCodes || []).filter(x => {
    const code = String(x.code || "").toUpperCase();
    if (!createdSet.has(code)) return false;
    const t = Number(x.claimedAt || 0);
    return t && t >= s && t <= e;
  }).length;

  const unclaimCount = Math.max(0, createdCodes.length - claimedSameDayForCreatedSameDay);

  return {
    dateKey: toDateKey(dateObj),
    createdAt: Date.now(),
    totalCustomers: totals.totalCustomers,
    totalPrize: totals.totalPrize,
    totalCodes: totals.totalCodes,
    normalCodes,
    superCodes,
    claimCount,
    unclaimCount
  };
}

async function saveSnapshotForDate(dateObj){
  const payload = buildSnapshotForDate(dateObj);
  await set(ref(db, `stats/daily/${payload.dateKey}`), payload);
}


async function saveYesterdaySnapshot(){
  const y = addDays(new Date(), -1);
  const yKey = toDateKey(y);
  const snap = await get(ref(db, `stats/daily/${yKey}`));
  if(snap.exists()){
    console.log("[stats] yesterday already saved:", yKey);
    return;
  }
  await saveSnapshotForDate(y);
  toast("Auto-saved yesterday snapshot!");
}
let saveTodayTimer = null;

function scheduleSaveTodaySnapshot(){
  clearTimeout(saveTodayTimer);
  saveTodayTimer = setTimeout(async ()=>{
    try{
      await saveSnapshotForDate(new Date());
      console.log("[stats] auto-saved TODAY snapshot");
    }catch(e){
      console.error("[stats] auto-save today error", e);
    }
  }, 1200); // debounce 1.2s
}


// auto schedule at midnight
function scheduleMidnightJob(){
  const now = new Date();
  const next = new Date(now);
  next.setHours(24,0,0,0);
  const ms = next.getTime() - now.getTime();

  setTimeout(async ()=>{
    try{
      await saveYesterdaySnapshot();
    }catch(e){
      console.error(e);
    }finally{
      scheduleMidnightJob();
    }
  }, ms + 800);
}
scheduleMidnightJob();

// ------------------------------
// TOTALS HISTORY TABLE
// ------------------------------
let statsDailyArr = [];

function renderStatsRows(rows){
  const tb = $("statsTbody");
  if(!tb) return;

  if(!rows.length){
    tb.innerHTML = `<tr><td colspan="8" style="opacity:.7">No stats yet.</td></tr>`;
    return;
  }

  const sorted = rows.slice().sort((a,b)=> String(b.dateKey).localeCompare(String(a.dateKey)));

tb.innerHTML = sorted.map(r=>`
  <tr>
    <td>${r.dateKey || "-"} ${r._label || ""}</td>
    <td>${Number(r.totalCustomers||0)}</td>
    <td>${Number(r.totalPrize||0)}</td>
    <td>${Number(r.totalCodes||0)}</td>
    <td>${Number(r.normalCodes||0)}</td>
    <td>${Number(r.superCodes||0)}</td>
    <td>${Number(r.claimCount||0)}</td>
    <td>${Number(r.unclaimCount||0)}</td>
  </tr>
`).join("");
}

function getRangeByPreset(preset){
  const now = new Date();
  const todayS = startOfDay(now);
  const todayE = endOfDay(now);

  if(preset==="today") return [todayS, todayE];
  if(preset==="yesterday"){
    const y = addDays(now,-1);
    return [startOfDay(y), endOfDay(y)];
  }

  if(preset==="thismonth"){
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return [startOfDay(s), todayE];
  }
  if(preset==="lastmonth"){
    const s = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return [startOfDay(s), endOfDay(e)];
  }

  // Mon-Sun week
  const day = (now.getDay()+6)%7;
  const mon = addDays(todayS, -day);
  const sun = addDays(mon, 6);

  if(preset==="thisweek") return [startOfDay(mon), endOfDay(sun)];
  if(preset==="lastweek"){
    const lastMon = addDays(mon, -7);
    const lastSun = addDays(lastMon, 6);
    return [startOfDay(lastMon), endOfDay(lastSun)];
  }

  return [todayS, todayE];
}
function detectPresetFromKeys(fromKey, toKey){
  const presets = ["today","yesterday","thisweek","lastweek","thismonth","lastmonth"];

  for(const p of presets){
    const [s,e] = getRangeByPreset(p);
    const ps = toDateKey(s);
    const pe = toDateKey(e);

    if(fromKey === ps && toKey === pe) return p;
  }
  return null;
}
function getLiveTodayRow(){
  const today = new Date();
  const live = buildSnapshotForDate(today);
  return {
    ...live,
    _label: "(Today)"
  };
}
let activePreset = "today";

function setActiveChip(preset){
  activePreset = preset;

  document.querySelectorAll("#presetRow .chipBtn").forEach(b=>{
    b.classList.toggle("active", b.dataset.preset === preset);
  });

  const [s,e] = getRangeByPreset(preset);
  $("rangeFrom").value = toDateKey(s);
  $("rangeTo").value   = toDateKey(e);
  syncRangePickerUI(toDateKey(s), toDateKey(e));
  applyStatsFilter();
}

function getRangeFromInputs(){
  const fromV = $("rangeFrom").value;
  const toV   = $("rangeTo").value;
  if(!fromV || !toV) return null;

  const s = startOfDay(new Date(fromV));
  const e = endOfDay(new Date(toV));
  if(s > e) return null;

  return [s,e];
}

function applyStatsFilter(){
  const range = getRangeFromInputs();
  if(!range){
    renderStatsRows([]);
    return;
  }

  const [s,e] = range;

  let rows = statsDailyArr.filter(r=>{
    const d = new Date(String(r.dateKey||"") + "T00:00:00");
    return d >= s && d <= e;
  });

  // ✅ show TODAY live jika range cover hari ini
  const todayS = startOfDay(new Date());
  const todayE = endOfDay(new Date());
  const coverToday = (s <= todayS && e >= todayE);
  if(coverToday){
    const todayKey = toDateKey(new Date());
    rows = [getLiveTodayRow(), ...rows.filter(x => String(x.dateKey||"").slice(0,10) !== todayKey)];
  }

  renderStatsRows(rows);
  updateSummaryUI();
}

function refreshTotalsHistoryLive(){
  applyStatsFilter();
}
// click preset chips
document.querySelectorAll("#presetRow .chipBtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    setActiveChip(btn.dataset.preset);
  });
});

function initTotalsHistory(){
  if(!$("rangeFrom") || !$("rangeTo") || !document.querySelector("#presetRow .chipBtn")){
    setTimeout(initTotalsHistory, 80);
    return;
  }
   initRangePicker();
  setTimeout(()=> setActiveChip(activePreset || "today"), 0);
}
setTimeout(initTotalsHistory, 200); // fallback kalau browser lambat

onValue(STATS_REF, (snap)=>{
  const v = snap.val() || {};
  statsDailyArr = Object.keys(v).map(k => v[k]).filter(Boolean);
  setActiveChip(activePreset || "today");
  updateSummaryUI();
});
window.addEventListener("error", (ev)=>{
  showToast("error", ev?.message || "Unexpected error");
});

window.addEventListener("unhandledrejection", (ev)=>{
  const msg = ev?.reason?.message || String(ev?.reason || "Promise error");
  showToast("error", msg);
});
const dropLogoutBtn = document.getElementById("dropLogout");
if(dropLogoutBtn){
  dropLogoutBtn.onclick = async ()=>{
    try{
      document.getElementById("userMenu")?.classList.remove("open");
      clearAdminSession();        // ✅ tambah ini
      try{ await signOut(auth); }catch(_){}
    }finally{
      goLogin();
    }
  };
}

(function bootUI(){
  const run = ()=>{
    try{ initTotalsHistory(); }catch(e){ console.error("initTotalsHistory err", e); }
    try{ initCodesRangePicker(); }catch(e){ console.error("initCodesRangePicker err", e); }
  };

  if(document.readyState !== "loading") run();
  else window.addEventListener("DOMContentLoaded", run);

  setTimeout(run, 250);
})();
document.querySelectorAll(".siteFilter").forEach(group=>{
  const target = group.dataset.target;

  group.querySelectorAll(".siteChip").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      group.querySelectorAll(".siteChip")
        .forEach(b=>b.classList.remove("active"));

      btn.classList.add("active");

      const site = btn.dataset.site || "";

      if(target === "codes"){
        activeSiteFilterCodes = site;
        renderCodes(allCodes);
      }

      if(target === "history"){
        activeSiteFilterHist = site;
        renderHist(allHist);
      }
    });
  });
});
