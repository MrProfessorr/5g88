  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import {
    getDatabase, ref, set, get, child, onValue, query, limitToLast,remove,update
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

  // ===== UI helpers =====
  const $ = (id)=>document.getElementById(id);
  const toast = (msg)=>{
    $("toast").textContent = msg;
    $("toast").style.display="block";
    clearTimeout(window.__t);
    window.__t = setTimeout(()=> $("toast").style.display="none", 2200);
  };
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

  $("btnCopy").onclick = async ()=>{
    const code = $("btnCopy").dataset.code;
    if(!code) return;
    await navigator.clipboard.writeText(code);
    toast("Copied!");
  };
;
  // ===== Load Active Codes =====
  let allCodes = [];
  let codeCustomerMap = {};
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

async function deletePromoCode(code){
  const ok = confirm(`Delete promo code: ${code}?`);
  if(!ok) return;

  try{
    await remove(ref(db, `promo_codes/${code}`));
    toast("Promo code deleted!");
  }catch(e){
    alert("Delete failed: " + (e.message || e));
  }
}

function renderCodes(list){
const q = $("searchCode").value.trim().toUpperCase();
const st = ($("statusFilter")?.value || "ALL").toUpperCase();

const filtered = (list || []).filter(x=>{
  // 1) search filter
  const hitSearch = !q
    ? true
    : (String(x.code||"").toUpperCase().includes(q) ||
       String(x.customer||"").toUpperCase().includes(q));

  // 2) status filter
  // approved = claimedAt ada atau usedCount > 0
  const isApproved = !!x.claimedAt || (Number(x.usedCount||0) > 0);
  const rowStatus = isApproved ? "APPROVED" : "PENDING";
  const hitStatus = (st === "ALL") ? true : (rowStatus === st);

  return hitSearch && hitStatus;
});

  const tb = $("codesTbody");
  if(!filtered.length){
    tb.innerHTML = `<tr><td colspan="11" style="color:rgba(233,236,255,.65)">No promo codes found.</td></tr>`;
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
      <td style="text-align:right;">
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
  $("btnRefresh").onclick = async ()=>{
    const snap = await get(ref(db, "promo_codes"));
    const v = snap.val() || {};
    allCodes = Object.keys(v).map(k=>v[k]);
    renderCodes(allCodes);
    toast("Refreshed!");
  };

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
 const filtered = !q ? list : list.filter(x=>{
    const code = String(x.code || x._code || "").toUpperCase();
    const user = String(x.userId || "").toUpperCase();
    const cust = String(codeCustomerMap[code] || x.customer || "").toUpperCase();
    return code.includes(q) || user.includes(q) || cust.includes(q);
  });

  const tb = $("histTbody");
  if(!filtered.length){
    tb.innerHTML = `<tr><td colspan="5" style="color:rgba(233,236,255,.65)">No history found.</td></tr>`;
    return;
  }

  const rows = filtered
    .sort((a,b)=> (b.redeemedAt||0)-(a.redeemedAt||0))
    .slice(0, 500);

  tb.innerHTML = rows.map(x=>`
    <tr>
      <td style="font-weight:900;letter-spacing:1px">${x.code || x._code}</td>
      <td>FREE ${x.points}</td>
      <td>${(codeCustomerMap[String(x.code || x._code || "").toUpperCase()] || x.customer || x.userId || "-")}</td>
      <td>${fmtTime(x.redeemedAt)}</td>
      <td style="text-align:right;">
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

    // ✅ terus ada 2 tarikh bila load
    defaultDate: [tKey, tKey],

    onReady(selectedDates, dateStr, inst){
      rf.value = tKey;
      rt.value = tKey;
      inst.input.value = `${tKey}  →  ${tKey}`;
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

// bila page siap (refresh terus auto render)
window.addEventListener("DOMContentLoaded", initTotalsHistory);
setTimeout(initTotalsHistory, 200); // fallback kalau browser lambat

onValue(STATS_REF, (snap)=>{
  const v = snap.val() || {};
  statsDailyArr = Object.keys(v).map(k => v[k]).filter(Boolean);
  setActiveChip(activePreset || "today");
  updateSummaryUI();
});
