document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // ✅ LOADING OVERLAY
  // =========================
  const loaderEl   = document.getElementById("pageLoading");
  const appShellEl = document.getElementById("appShell");

  let loadingHiddenOnce = false;

  function showLoading() {
    if (loaderEl) {
      loaderEl.classList.remove("is-hide");
      loaderEl.style.display = "flex";
      loaderEl.style.opacity = "1";
      loaderEl.style.pointerEvents = "auto";
    }
    if (appShellEl) {
      appShellEl.style.transition = "opacity .25s ease, filter .25s ease";
      appShellEl.style.opacity = "0.25";
      appShellEl.style.filter = "blur(2px)";
      appShellEl.style.pointerEvents = "none";
    }
  }

  function hideLoading() {
    if (loadingHiddenOnce) return;
    loadingHiddenOnce = true;

    if (appShellEl) {
      appShellEl.style.transition = "opacity .35s ease, filter .35s ease";
      appShellEl.style.opacity = "1";
      appShellEl.style.filter = "none";
      appShellEl.style.pointerEvents = "auto";
    }

    if (loaderEl) {
      loaderEl.style.transition = "opacity .35s ease";
      loaderEl.style.opacity = "0";
      loaderEl.style.pointerEvents = "none";

      setTimeout(() => {
        loaderEl.classList.add("is-hide");
        loaderEl.style.display = "none";
        loaderEl.style.opacity = "1";
      }, 350);
    }
  }

  showLoading();

  // =========================
  // ✅ ELEMENTS
  // =========================
  const gridEl         = document.getElementById("tipsCardsGrid");
  const promoGridEl    = document.getElementById("promoGrid");
  const promoBigGridEl = document.getElementById("promoBigGrid");
  const partnerGridEl  = document.getElementById("partnerGrid");

  const homePage     = document.getElementById("homePage");
  const hotGamePage  = document.getElementById("hotGamePage");
  const gameListPage = document.getElementById("gameListPage");
  const gameListGrid = document.getElementById("gameListGrid");
  const promoPage    = document.getElementById("promoPage");
  const partnerPage  = document.getElementById("partnerPage");

  if (homePage)     homePage.style.display     = "none";
  if (hotGamePage)  hotGamePage.style.display  = "none";
  if (gameListPage) gameListPage.style.display = "none";
  if (promoPage)    promoPage.style.display    = "none";
  if (partnerPage)  partnerPage.style.display  = "none";

  // =========================
  // ✅ BOTTOM NAV
  // =========================
  const bottomNavItems    = document.querySelectorAll(".bottom-nav-item");
  const bottomHomeBtn     = document.querySelector('.bottom-nav-item[data-tab="home"]');
  const bottomHotBtn      = document.querySelector('.bottom-nav-item[data-tab="hot"]');
  const bottomGameListBtn = document.querySelector('.bottom-nav-item[data-tab="gamelist"]');
  const bottomPromoBtn    = document.querySelector('.bottom-nav-item[data-tab="promo"]');
  const bottomPartnerBtn  = document.querySelector('.bottom-nav-item[data-tab="partner"]');

  function updateBottomNavActive(tab) {
    if (!bottomNavItems || !bottomNavItems.length) return;
    bottomNavItems.forEach(btn => {
      const t = btn.dataset.tab;
      if (btn.dataset.sidebarOnly === "true") return;
      if (!t) return;
      btn.classList.toggle("active", t === tab);
    });
  }

  // =========================
  // ✅ RATE GAME TIME
  // =========================
  const rateGameTimeEl = document.getElementById("rateGameTime");
  function updateRateGameTime() {
    if (!rateGameTimeEl) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    const hours = pad(now.getHours());
    const mins  = pad(now.getMinutes());
    const secs  = pad(now.getSeconds());

    const day    = pad(now.getDate());
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month  = months[now.getMonth()];
    const year   = now.getFullYear();

    rateGameTimeEl.textContent = `RATE GAME : ${hours}:${mins}:${secs} ${day} ${month} ${year}`;
  }
  if (rateGameTimeEl) {
    updateRateGameTime();
    setInterval(updateRateGameTime, 1000);
  }

  // =========================
  // ✅ FLOATING CONTACTS
  // =========================
  const floatingLeftEl  = document.getElementById("floatingLeft");
  const floatingRightEl = document.getElementById("floatingRight");

  const FLOAT_COLLAPSE_KEY = "tipsFloatingContactsCollapsed.v1";
  let floatingCollapsed = false;
  try { floatingCollapsed = localStorage.getItem(FLOAT_COLLAPSE_KEY) === "1"; } catch (e) {}

  // =========================
  // ✅ SIDEBAR MENU
  // =========================
  const sideMenuBtn  = document.getElementById("sideMenuBtn");
  const sideMenu     = document.getElementById("sideMenu");
  const sideOverlay  = document.getElementById("sideOverlay");
  const sideMenuList = document.getElementById("sideMenuList");

  function openSidebar() {
    if (!sideMenu || !sideOverlay) return;
    sideMenu.classList.add("open");
    sideOverlay.classList.add("show");
  }
  function closeSidebar() {
    if (!sideMenu || !sideOverlay) return;
    sideMenu.classList.remove("open");
    sideOverlay.classList.remove("show");
  }
  if (sideMenuBtn) sideMenuBtn.addEventListener("click", openSidebar);
  if (sideOverlay) sideOverlay.addEventListener("click", closeSidebar);

  // =========================
  // ✅ TAB SYSTEM
  // =========================
  const TAB_KEY = "tipsPageActiveTab";
  let currentTab = "home";

  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (["home","hot","gamelist","promo","partner"].includes(saved)) currentTab = saved;
  } catch (e) {}

  let navConfig = { home: true, hot: true, gamelist: true, promo: true, partner: true };

  function getFirstEnabledTab() {
    const order = ["home","hot","gamelist","promo","partner"];
    return order.find(t => navConfig[t]) || "home";
  }

  function updateSidebarActive(tab){
    if (!sideMenuList) return;
    sideMenuList.querySelectorAll(".side-menu-item").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
  }

  function setActiveTab(tab) {
    if (!navConfig[tab]) tab = getFirstEnabledTab();
    currentTab = tab;

    if (homePage)     homePage.style.display     = "none";
    if (hotGamePage)  hotGamePage.style.display  = "none";
    if (gameListPage) gameListPage.style.display = "none";
    if (promoPage)    promoPage.style.display    = "none";
    if (partnerPage)  partnerPage.style.display  = "none";

    if (tab === "hot" && hotGamePage && navConfig.hot) {
      hotGamePage.style.display = "block";
    } else if (tab === "gamelist" && gameListPage && navConfig.gamelist) {
      gameListPage.style.display = "block";
    } else if (tab === "promo" && promoPage && navConfig.promo) {
      promoPage.style.display = "block";
    } else if (tab === "partner" && partnerPage && navConfig.partner) {
      partnerPage.style.display = "block";
    } else if (homePage && navConfig.home) {
      homePage.style.display = "block";
      currentTab = "home";
    }

    try { localStorage.setItem(TAB_KEY, currentTab); } catch (e) {}
    updateBottomNavActive(currentTab);
    updateSidebarActive(currentTab);
  }

  window.handleBottomNavClick = function(tab) { setActiveTab(tab); };
  window.showHome      = () => setActiveTab("home");
  window.showHotGame   = () => setActiveTab("hot");
  window.showGameList  = () => setActiveTab("gamelist");
  window.showPromotion = () => setActiveTab("promo");
  window.showPartner   = () => setActiveTab("partner");
  window.showPartnership = window.showPartner;

  function buildSidebarItems() {
    if (!sideMenuList) return;
    sideMenuList.innerHTML = "";

    const bottomButtons = document.querySelectorAll(".bottom-nav-item");
    bottomButtons.forEach((btn) => {
      const tab = btn.dataset.tab;
      if (!tab) return;

      const isSidebarOnly = btn.dataset.sidebarOnly === "true";
      if (btn.style.display === "none" && !isSidebarOnly) return;

      const label = btn.querySelector(".bottom-nav-label")?.textContent?.trim() || tab.toUpperCase();
      const iconSrc = btn.querySelector("img")?.getAttribute("src") || "";

      const item = document.createElement("button");
      item.type = "button";
      item.className = "side-menu-item";
      item.dataset.tab = tab;

      item.innerHTML = `
        <span class="side-menu-ico">${iconSrc ? `<img src="${iconSrc}" alt="">` : ""}</span>
        <span class="side-menu-text">${label}</span>
      `;

      item.addEventListener("click", () => {
        window.handleBottomNavClick(tab);
        closeSidebar();
      });

      sideMenuList.appendChild(item);
    });

    updateSidebarActive(currentTab);
  }

  setActiveTab(currentTab);

  // =========================
  // ✅ HOME SLIDER
  // =========================
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

  // =========================
  // ✅ FIREBASE READY CHECK
  // =========================
  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    hideLoading();
    return;
  }

  // =========================
  // ✅ FIREBASE REFS
  // =========================
  const cardsRef     = db.ref("tips_cards");
  const promosRef    = db.ref("promo_banners");
  const promoBigRef  = db.ref("promotions");
  const partnersRef  = db.ref("partnerships");
  const navTabsRef   = db.ref("nav_tabs");
  const floatingRef  = db.ref("floating_buttons");

  const gameListRef   = db.ref("game_list");
  const gamePlayedRef = db.ref("game_list_played");
  const gameRtpRef    = db.ref("game_list_rtp");
  const playedMetaRef = db.ref("game_list_played_meta");

  // =========================
  // ✅ LOADING GATE
  // =========================
  const MIN_LOADING_MS = 650;
  const startAt = Date.now();

  const firstLoad = {
    nav: false,
    floating: false,
    promos: false,
    promoBig: false,
    partners: false,
    cards: !gridEl,
    gamelist: !gameListGrid
  };

  function markLoaded(k) {
    firstLoad[k] = true;
    const done = Object.values(firstLoad).every(Boolean);
    if (!done) return;

    const elapsed = Date.now() - startAt;
    const wait = Math.max(0, MIN_LOADING_MS - elapsed);
    setTimeout(hideLoading, wait);
  }

  // fallback max 8s
  setTimeout(() => hideLoading(), 8000);

  // =========================
  // ✅ APPLY NAV CONFIG
  // =========================
  function applyNavConfig(cfgRaw) {
    const defaults = { home:true, hot:true, gamelist:true, promo:true, partner:true };
    navConfig = { ...defaults, ...(cfgRaw || {}) };

    if (bottomHomeBtn) bottomHomeBtn.style.display = navConfig.home ? "" : "none";
    if (bottomHotBtn)  bottomHotBtn.style.display  = navConfig.hot  ? "" : "none";

    if (bottomGameListBtn) {
      const sidebarOnly = bottomGameListBtn.dataset.sidebarOnly === "true";
      bottomGameListBtn.style.display = sidebarOnly ? "none" : (navConfig.gamelist ? "" : "none");
    }

    if (bottomPromoBtn)   bottomPromoBtn.style.display   = navConfig.promo   ? "" : "none";
    if (bottomPartnerBtn) bottomPartnerBtn.style.display = navConfig.partner ? "" : "none";

    setActiveTab(currentTab);
    buildSidebarItems();
  }

  navTabsRef.on("value", (snap) => {
    applyNavConfig(snap.val());
    markLoaded("nav");
  });

  buildSidebarItems();

  // =========================
  // ✅ RTP + PLAYED (FIREBASE ONLY)
  // =========================
  const RTP_INTERVAL_MS = 10 * 60 * 1000; // 10 min rotate
  const RTP_META_KEY = "__meta";

  function randRtp() {
    const v = 89 + Math.random() * (98 - 89);
    return Math.round(v * 10) / 10;
  }

  async function ensureRtpFreshFirebase(gameKeys) {
    if (!gameKeys || !gameKeys.length) return {};

    const now = Date.now();
    const tsSnap = await gameRtpRef.child(RTP_META_KEY).child("ts").once("value");
    const lastTs = Number(tsSnap.val() || 0);

    const needRotate = (!lastTs) || (now - lastTs >= RTP_INTERVAL_MS);

    const snap = await gameRtpRef.once("value");
    let map = snap.val() || {};
    delete map[RTP_META_KEY];

    if (needRotate) {
      const updates = {};
      gameKeys.forEach(k => { updates[k] = randRtp(); });
      updates[`${RTP_META_KEY}/ts`] = now;
      await gameRtpRef.update(updates);

      const out = {};
      gameKeys.forEach(k => out[k] = updates[k]);
      return out;
    }

    const missing = {};
    gameKeys.forEach(k => {
      if (typeof map[k] !== "number") missing[k] = randRtp();
    });

    if (Object.keys(missing).length) {
      await gameRtpRef.update(missing);
      Object.assign(map, missing);
    }

    return map;
  }

  let rtpTickerTimer = null;
  function startRtpTickerFirebase(renderFn) {
    if (rtpTickerTimer) clearInterval(rtpTickerTimer);

    rtpTickerTimer = setInterval(async () => {
      try {
        const rawKeys = window.__gameListKeys || [];
        if (!rawKeys.length) return;

        await ensureRtpFreshFirebase(rawKeys);
        if (typeof renderFn === "function") await renderFn();
      } catch (e) {
        console.warn("RTP ticker failed:", e);
      }
    }, 15 * 1000);
  }

  let playedMapGlobal = {};

  function todayStrMY(){
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const my  = new Date(utc + (8 * 60 * 60000));

    const y = my.getFullYear();
    const m = String(my.getMonth() + 1).padStart(2, "0");
    const d = String(my.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async function checkDailyPlayedReset(entries){
    if (!entries || !entries.length) return;

    const today = todayStrMY();
    try{
      const snap = await playedMetaRef.child("lastResetDate").once("value");
      const last = snap.val();
      if (last === today) return;

      console.log("🔁 DAILY RESET PLAYED COUNTER:", today);

      const jobs = entries.map(g => {
        if (!g?.key) return Promise.resolve();
        return gamePlayedRef.child(g.key).update({
          value: 0,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
      });

      jobs.push(playedMetaRef.child("lastResetDate").set(today));
      await Promise.all(jobs);

    } catch(err){
      console.warn("Daily reset failed:", err);
    }
  }

  function clamp(n, min, max){
    n = Number(n);
    if (!isFinite(n)) n = 0;
    return Math.max(min, Math.min(max, Math.floor(n)));
  }

  function getMaxPlayed(g){
    const raw = Number(g?.playedMax ?? 398);
    return (isFinite(raw) && raw > 0) ? Math.floor(raw) : 398;
  }

  function paintPlayedToDom(map){
    document.querySelectorAll(".game-card[data-key]").forEach(card=>{
      const key = card.dataset.key;
      if (key === "__meta") return;

      const numEl = card.querySelector(".played-num");
      if (!numEl) return;

      const val = Number(map?.[key]?.value ?? 0);
      numEl.textContent = String(isFinite(val) ? val : 0);
    });
  }

  gamePlayedRef.on("value", snap => {
    playedMapGlobal = snap.val() || {};
    paintPlayedToDom(playedMapGlobal);
  });

  function tickPlayedFirebase(entries){
    entries.forEach(g => {
      const key = g.key;
      const max = getMaxPlayed(g);

      gamePlayedRef.child(key).transaction((curr) => {
        const prev = Number(curr?.value ?? 0);

        const goingUp = Math.random() < 0.7;
        const step = goingUp
          ? (Math.floor(Math.random() * 25) + 10)  // 10..34
          : (Math.floor(Math.random() * 4) + 1);   // 1..4

        let next = prev + (goingUp ? step : -step);
        next = clamp(next, 0, max);

        return {
          value: next,
          updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
      });
    });
  }

  // =========================
  // ✅ GAMELIST RENDER
  // =========================
  let lastGameListData = null;

  async function renderGameList(dataObj) {
    if (!gameListGrid) return;

    const data = dataObj || {};
    gameListGrid.innerHTML = "";

    const entries = Object.entries(data)
      .map(([key, g]) => ({ key, ...(g || {}) }))
      .filter(g => g && g.enabled !== false);

    window.__gameListEntries = entries;

    if (!entries.length) {
      gameListGrid.innerHTML = '<p class="text-muted small">Belum ada game list. Admin boleh tambah dari panel.</p>';
      return;
    }

    window.__gameListKeys = entries.map(e => e.key);

    await checkDailyPlayedReset(entries);
    const rtpMap = await ensureRtpFreshFirebase(window.__gameListKeys);

    entries.forEach((g) => {
      const imgUrl  = g.imageUrl || g.imgUrl || g.image || "";
      const name    = g.gameName || g.name || "Game";
      const playUrl = g.playUrl  || g.joinUrl || g.link || "#";

      const rtp = Number(rtpMap[g.key] ?? randRtp());
      const isHot = rtp > 95;

      const card = document.createElement("article");
      card.className = "game-card";
      card.setAttribute("data-key", g.key);

      const imgWrap = document.createElement("div");
      imgWrap.className = "game-img-wrap";

      if (isHot) {
        const hot = document.createElement("div");
        hot.className = "game-hot-badge";
        hot.innerHTML = `<span class="hot">HOT</span><span class="rtp">RTP ${rtp.toFixed(1)}%</span>`;
        imgWrap.appendChild(hot);
      }

      const img = document.createElement("img");
      img.className = "game-img";
      img.loading = "lazy";
      img.alt = name;
      img.src = imgUrl || "https://i.imgur.com/AM4LUPK.png";
      imgWrap.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "game-meta";

      const titleRow = document.createElement("div");
      titleRow.className = "game-title-row";

      const title = document.createElement("span");
      title.className = "game-title";
      title.textContent = name;

      const percent = document.createElement("span");
      percent.className = "game-rtp";
      percent.textContent = `${rtp.toFixed(1)}%`;

      titleRow.appendChild(title);
      titleRow.appendChild(percent);

      const playedRow = document.createElement("div");
      playedRow.className = "game-played";

      const playedLabel = document.createElement("span");
      playedLabel.textContent = "Played :";

      const playedNum = document.createElement("span");
      playedNum.className = "played-num";
      const initialVal = Number(playedMapGlobal?.[g.key]?.value ?? 0);
      playedNum.textContent = String(isFinite(initialVal) ? initialVal : 0);

      playedRow.appendChild(playedLabel);
      playedRow.appendChild(playedNum);

      const btn = document.createElement("a");
      btn.className = "game-play-btn";
      btn.href = playUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.textContent = "Play Now";

      meta.appendChild(titleRow);
      meta.appendChild(playedRow);
      meta.appendChild(btn);

      card.appendChild(imgWrap);
      card.appendChild(meta);

      gameListGrid.appendChild(card);
    });
  }

  if (gameListGrid) {
    // ✅ FIX: callback must be async to use await
    gameListRef.on("value", async (snap) => {
      lastGameListData = snap.val() || {};
      await renderGameList(lastGameListData);
      markLoaded("gamelist");

      // start ticker safely
      startRtpTickerFirebase(updateRtpOnly);
    });

    // ✅ ONE played timer only
    if (!window.__playedTimer) {
      window.__playedTimer = setInterval(async () => {
        const entries = window.__gameListEntries || [];
        if (!entries.length) return;

        await checkDailyPlayedReset(entries);
        tickPlayedFirebase(entries);
      }, 60 * 1000);
    }
  } else {
    markLoaded("gamelist");
  }
async function updateRtpOnly(){
  try{
    const keys = window.__gameListKeys || [];
    if (!keys.length) return;

    // ensure rtp latest (rotate/missing fill)
    const rtpMap = await ensureRtpFreshFirebase(keys);

    // update DOM sahaja (tak buang card)
    document.querySelectorAll(".game-card[data-key]").forEach(card=>{
      const key = card.dataset.key;
      const rtpEl = card.querySelector(".game-rtp");
      const badgeRtpEl = card.querySelector(".game-hot-badge .rtp");

      if (!rtpEl) return;

      const rtp = Number(rtpMap[key] ?? randRtp());
      rtpEl.textContent = `${rtp.toFixed(1)}%`;

      // HOT badge update
      const isHot = rtp > 95;

      if (isHot) {
        if (badgeRtpEl) {
          badgeRtpEl.textContent = `RTP ${rtp.toFixed(1)}%`;
        } else {
          // kalau badge belum ada, buat sekali sahaja
          const imgWrap = card.querySelector(".game-img-wrap");
          if (imgWrap && !imgWrap.querySelector(".game-hot-badge")) {
            const hot = document.createElement("div");
            hot.className = "game-hot-badge";
            hot.innerHTML = `<span class="hot">HOT</span><span class="rtp">RTP ${rtp.toFixed(1)}%</span>`;
            imgWrap.prepend(hot);
          }
        }
      } else {
        // kalau tak hot, buang badge kalau ada
        const badge = card.querySelector(".game-hot-badge");
        if (badge) badge.remove();
      }
    });
  }catch(e){
    console.warn("updateRtpOnly failed:", e);
  }
}
  // =========================
  // ✅ FLOATING BUTTONS RENDER
  // =========================
  function renderFloatingButtons(snapshot) {
    const data = snapshot.val() || {};
    const wa   = data.whatsapp || {};
    const tg   = data.telegram || {};
    const join = data.join     || {};

    if (floatingLeftEl) {
      floatingLeftEl.innerHTML = "";
      floatingLeftEl.classList.toggle("collapsed", floatingCollapsed);
    }
    if (floatingRightEl) floatingRightEl.innerHTML = "";

    function createFloatingBtn(cfg, extraClass, labelText) {
      if (!cfg || !cfg.enabled || !cfg.link) return null;

      const a = document.createElement("a");
      a.href   = cfg.link;
      a.target = "_blank";
      a.rel    = "noopener noreferrer";
      a.className = "floating-btn " + (extraClass || "");

      if (cfg.iconUrl) {
        const img = document.createElement("img");
        img.src = cfg.iconUrl;
        img.alt = labelText || "icon";
        img.className = "floating-btn-img";
        img.loading = "lazy";
        a.appendChild(img);
      } else {
        const span = document.createElement("span");
        span.className = "floating-btn-label";
        span.textContent = labelText || "BTN";
        a.appendChild(span);
      }

      return a;
    }

    if (!floatingLeftEl) return;

    const stack = document.createElement("div");
    stack.className = "floating-stack";

    const waBtn   = createFloatingBtn(wa,   "floating-wa",   "WA");
    const tgBtn   = createFloatingBtn(tg,   "floating-tg",   "TG");
    const joinBtn = createFloatingBtn(join, "floating-join", "JOIN");

    if (waBtn) stack.appendChild(waBtn);
    if (tgBtn) stack.appendChild(tgBtn);
    if (joinBtn) stack.appendChild(joinBtn);

    floatingLeftEl.appendChild(stack);

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "floating-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle contact buttons");

    const svgUp = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14l5-5 5 5" /></svg>`;
    const svgDown = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>`;

    function updateArrowIcon() {
      toggleBtn.innerHTML = floatingCollapsed ? svgDown : svgUp;
    }
    updateArrowIcon();

    toggleBtn.addEventListener("click", () => {
      floatingCollapsed = !floatingCollapsed;
      floatingLeftEl.classList.toggle("collapsed", floatingCollapsed);
      try { localStorage.setItem(FLOAT_COLLAPSE_KEY, floatingCollapsed ? "1" : "0"); } catch (e) {}
      updateArrowIcon();
    });

    floatingLeftEl.appendChild(toggleBtn);
  }

  floatingRef.on("value", (snap) => {
    renderFloatingButtons(snap);
    markLoaded("floating");
  });

  // =========================
  // ✅ PROMO SLIDER (SMALL)
  // =========================
  let promoSliderTimer = null;

  function renderPromos(snapshot) {
    if (!promoGridEl) return;

    if (promoSliderTimer) {
      clearInterval(promoSliderTimer);
      promoSliderTimer = null;
    }

    const raw = snapshot.val() || {};
    promoGridEl.innerHTML = "";

    const entries = Object.entries(raw).filter(([k, promo]) => promo && promo.enabled !== false);
    if (!entries.length) return;

    const cardsDom = [];

    entries.forEach(([key, promo]) => {
      const imageUrl  = promo.imageUrl || "";
      const targetUrl = promo.targetUrl || "#";
      const title     = promo.title || "";
      const caption   = promo.caption || "";
      if (!imageUrl) return;

      const card = document.createElement("article");
      card.className = "promo-card";

      const link = document.createElement("a");
      link.className = "promo-card-link";
      link.href   = targetUrl;
      link.target = "_blank";
      link.rel    = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = title || caption || "Promo";
      img.className = "promo-card-img";
      img.loading = "lazy";

      link.appendChild(img);
      card.appendChild(link);

      if (caption || title) {
        const captionEl = document.createElement("div");
        captionEl.className = "promo-card-caption";
        captionEl.textContent = caption || title;
        card.appendChild(captionEl);
      }

      promoGridEl.appendChild(card);
      cardsDom.push(card);
    });

    if (cardsDom.length <= 2) return;

    const pageSize   = 2;
    const totalPages = Math.ceil(cardsDom.length / pageSize);
    let currentPage  = 0;

    function showPage(pageIndex) {
      cardsDom.forEach((card, idx) => {
        const pIndex = Math.floor(idx / pageSize);
        card.style.display = pIndex === pageIndex ? "" : "none";
      });
    }

    showPage(currentPage);

    promoSliderTimer = setInterval(() => {
      currentPage = (currentPage + 1) % totalPages;
      showPage(currentPage);
    }, 3000);
  }

  promosRef.on("value", (snap) => {
    renderPromos(snap);
    markLoaded("promos");
  });

  // =========================
  // ✅ PROMO BIG
  // =========================
  function renderPromoBig(snapshot) {
    if (!promoBigGridEl) return;

    const data = snapshot.val() || {};
    promoBigGridEl.innerHTML = "";

    const entries = Object.entries(data).filter(([key, promo]) => promo && promo.enabled !== false);
    if (!entries.length) {
      promoBigGridEl.innerHTML = '<p class="text-muted small">Belum ada promotion aktif.</p>';
      return;
    }

    entries.forEach(([key, promo]) => {
      const imageUrl  = promo.imageUrl || "";
      const targetUrl = promo.targetUrl || "#";
      const title     = promo.title || "";
      const caption   = promo.caption || "";
      if (!imageUrl) return;

      const card = document.createElement("article");
      card.className = "promo-big-card";

      const link = document.createElement("a");
      link.className = "promo-big-link";
      link.href   = targetUrl;
      link.target = "_blank";
      link.rel    = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = title || caption || "Promotion";
      img.className = "promo-big-img";
      img.loading = "lazy";

      link.appendChild(img);
      card.appendChild(link);

      if (title || caption) {
        const captionBox = document.createElement("div");
        captionBox.className = "promo-big-caption";

        if (title) {
          const titleEl = document.createElement("div");
          titleEl.className = "promo-big-title";
          titleEl.textContent = title;
          captionBox.appendChild(titleEl);
        }
        if (caption) {
          const capEl = document.createElement("div");
          capEl.className = "promo-big-text";
          capEl.textContent = caption;
          captionBox.appendChild(capEl);
        }

        card.appendChild(captionBox);
      }

      promoBigGridEl.appendChild(card);
    });
  }

  promoBigRef.on("value", (snap) => {
    renderPromoBig(snap);
    markLoaded("promoBig");
  });

  // =========================
  // ✅ PARTNERS
  // =========================
  function normalizeTelegramLink(url) {
    if (!url) return "";
    let u = String(url).trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u) && !/^tg:\/\//i.test(u)) {
      u = u.replace(/^@/, "");
      u = "https://t.me/" + u;
    }
    return u;
  }

  function renderPartners(snapshot) {
    if (!partnerGridEl) return;

    const data = snapshot.val() || {};
    partnerGridEl.innerHTML = "";

    const entries = Object.entries(data).filter(([key, p]) => p && p.enabled !== false);

    if (!entries.length) {
      partnerGridEl.innerHTML = '<p class="text-muted small">Belum ada partnership aktif.</p>';
      return;
    }

    entries.forEach(([key, p]) => {
      const logoUrl    = p.logoUrl || "";
      const joinUrl    = p.joinUrl || "#";
      const channelUrl = normalizeTelegramLink(p.channelUrl || p.channelLink || "");
      const name       = p.name || "";
      const rating     = p.rating != null ? Number(p.rating).toFixed(1) : null;

      if (!logoUrl) return;

      const card = document.createElement("article");
      card.className = "partner-card";

      if (rating !== null) {
        const badge = document.createElement("div");
        badge.className = "partner-rating";
        badge.textContent = rating + " ★";
        card.appendChild(badge);
      }

      const logoWrap = document.createElement("div");
      logoWrap.className = "partner-logo-wrap";

      const img = document.createElement("img");
      img.src = logoUrl;
      img.alt = name || "Partner";
      img.className = "partner-logo";
      img.loading = "lazy";

      logoWrap.appendChild(img);
      card.appendChild(logoWrap);

      if (name) {
        const nameEl = document.createElement("div");
        nameEl.className = "partner-name";
        nameEl.textContent = name;
        card.appendChild(nameEl);
      }

      const joinLink = document.createElement("a");
      joinLink.href   = joinUrl;
      joinLink.target = "_blank";
      joinLink.rel    = "noopener noreferrer";
      joinLink.className = "partner-join-link";

      const joinBtn = document.createElement("button");
      joinBtn.type = "button";
      joinBtn.className = "btn partner-join-btn";
      joinBtn.textContent = "Join Now";

      joinLink.appendChild(joinBtn);
      card.appendChild(joinLink);

      const channelLink = document.createElement("a");
      channelLink.target = "_blank";
      channelLink.rel    = "noopener noreferrer";
      channelLink.className = "partner-join-link";

      if (channelUrl) {
        channelLink.href = channelUrl;
      } else {
        channelLink.href = "javascript:void(0)";
        channelLink.style.pointerEvents = "none";
        channelLink.style.opacity = "0.55";
        channelLink.title = "Channel link belum diisi (admin).";
      }

      const channelBtn = document.createElement("button");
      channelBtn.type = "button";
      channelBtn.className = "btn partner-join-btn";
      channelBtn.textContent = "View Channel";
      channelBtn.style.marginTop = "10px";

      channelLink.appendChild(channelBtn);
      card.appendChild(channelLink);

      partnerGridEl.appendChild(card);
    });
  }

  partnersRef.on("value", (snap) => {
    renderPartners(snap);
    markLoaded("partners");
  });

  // =========================
  // ✅ TIPS CARDS (HISTORY)
  // =========================
  if (gridEl) {
    const STORAGE_KEY = "tipsHistory.v1";
    let historyObj = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) historyObj = JSON.parse(raw) || {};
    } catch (e) { historyObj = {}; }

    function saveHistory() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(historyObj)); } catch (e) {}
    }

    function getHistoryState(key) {
      if (!historyObj[key]) historyObj[key] = { history: [], index: -1 };
      return historyObj[key];
    }

    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    function generateTipsForCard(card) {
      const games = (card.games || []).slice();
      if (games.length === 0) return "Belum ada game.";

      for (let i = games.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [games[i], games[j]] = [games[j], games[i]];
      }

      const count  = Math.min(3, games.length);
      const chosen = games.slice(0, count);
      const lines = [card.platformName || card.key, "==========="];

      chosen.forEach((name, idx) => {
        const percent = randInt(70, 98);
        lines.push(`${idx + 1}. ${name} ${percent}%`);
      });

      return lines.join("\n");
    }

    function renderCards(snapshot) {
      const data = snapshot.val() || {};
      gridEl.innerHTML = "";

      const entries = Object.entries(data)
        .map(([key, card]) => ({ key, ...card }))
        .filter((c) => c.enabled !== false);

      if (entries.length === 0) {
        gridEl.innerHTML = '<p class="text-muted small">Not allowed this time.</p>';
        return;
      }

      entries.forEach((card) => {
        const cardEl = document.createElement("article");
        cardEl.className = "tip-card";

        const header = document.createElement("div");
        header.className = "tip-card-header";

        const title = document.createElement("div");
        title.className = "tip-card-title";
        title.textContent = card.platformName || card.key;

        const pill = document.createElement("div");
        pill.className = "tip-card-pill";
        pill.textContent = "5G88_Site";

        header.appendChild(title);
        header.appendChild(pill);

        const output = document.createElement("pre");
        output.className = "tip-output";
        output.textContent = "Click generate.";

        const actions = document.createElement("div");
        actions.className = "tip-actions";

        const backBtn = document.createElement("button");
        backBtn.className = "btn secondary";
        backBtn.textContent = "Back";

        const genBtn = document.createElement("button");
        genBtn.className = "btn primary";
        genBtn.textContent = "Generate";

        const state = getHistoryState(card.key);
        if (state.history.length > 0 && state.index >= 0) {
          output.textContent = state.history[state.index];
        }

        genBtn.addEventListener("click", () => {
          const txt = generateTipsForCard(card);
          if (!txt) return;

          state.history.push(txt);
          state.index = state.history.length - 1;
          output.textContent = txt;
          saveHistory();
        });

        backBtn.addEventListener("click", () => {
          if (state.index > 0) {
            state.index -= 1;
            output.textContent = state.history[state.index];
          } else if (state.history.length === 0) {
            output.textContent = "Belum ada tips sebelumnya.";
          } else {
            output.textContent = state.history[0];
          }
          saveHistory();
        });

        actions.appendChild(backBtn);
        actions.appendChild(genBtn);

        cardEl.appendChild(header);
        cardEl.appendChild(output);
        cardEl.appendChild(actions);

        gridEl.appendChild(cardEl);
      });
    }

    cardsRef.on("value", (snap) => {
      renderCards(snap);
      markLoaded("cards");
    });
  } else {
    markLoaded("cards");
  }

  // =========================
  // ✅ SHARE SHEET
  // =========================
  const shareOverlay = document.getElementById("shareOverlay");
  const shareSheet   = document.getElementById("shareSheet");
  const shareInput   = document.getElementById("shareLinkInput");

  function shareUrl(){ return window.location.href; }
  function shareText(){ return "5G88 • Tips Game"; }

  window.openShareSheet = function(){
    if (shareInput) shareInput.value = shareUrl();
    if (shareOverlay) shareOverlay.style.display = "block";
    if (shareSheet) {
      shareSheet.style.display = "block";
      shareSheet.setAttribute("aria-hidden","false");
    }
  };

  window.closeShareSheet = function(){
    if (shareOverlay) shareOverlay.style.display = "none";
    if (shareSheet) {
      shareSheet.style.display = "none";
      shareSheet.setAttribute("aria-hidden","true");
    }
  };

  window.copyShareLink = async function(){
    const url = shareUrl();
    try{
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }catch(e){
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert("Link copied!");
    }
  };

  if (shareOverlay) shareOverlay.addEventListener("click", window.closeShareSheet);

  if (shareSheet) {
    shareSheet.addEventListener("click", async (e) => {
      const btn = e.target.closest(".share-icon");
      if (!btn) return;

      const type = btn.dataset.share;
      const url  = encodeURIComponent(shareUrl());
      const text = encodeURIComponent(shareText());

      if (type === "whatsapp") {
        window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
      } else if (type === "telegram") {
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
      } else if (type === "facebook") {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
      } else if (type === "copy") {
        await window.copyShareLink();
      }

      window.closeShareSheet();
    });
  }
}); // ✅ DOMContentLoaded end

// =========================
// ✅ BACK TO TOP (OUTSIDE)
// =========================
let scrollTimer;
const btn = document.getElementById("backToTop");

if (btn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
      btn.classList.add("show");
      btn.classList.remove("hide");
    } else {
      btn.classList.remove("show");
      btn.classList.add("hide");
    }

    clearTimeout(scrollTimer);

    scrollTimer = setTimeout(() => {
      if (window.scrollY > 200) {
        btn.classList.add("hide");
        btn.classList.remove("show");
      }
    }, 1000);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
