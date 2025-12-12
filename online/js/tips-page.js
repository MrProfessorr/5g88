// online/js/tips-page.js

document.addEventListener("DOMContentLoaded", () => {
  const gridEl         = document.getElementById("tipsCardsGrid");
  const promoGridEl    = document.getElementById("promoGrid");
  const promoBigGridEl = document.getElementById("promoBigGrid");
  const partnerGridEl  = document.getElementById("partnerGrid");

  const homePage    = document.getElementById("homePage");
  const hotGamePage = document.getElementById("hotGamePage");
  const promoPage   = document.getElementById("promoPage");
  const partnerPage = document.getElementById("partnerPage");

  // ✅ Hindari flash: semua section disembunyikan dulu
  if (homePage)    homePage.style.display    = "none";
  if (hotGamePage) hotGamePage.style.display = "none";
  if (promoPage)   promoPage.style.display   = "none";
  if (partnerPage) partnerPage.style.display = "none";

  // ===== BOTTOM NAV (ikon di bawah) =====
  const bottomNavItems   = document.querySelectorAll(".bottom-nav-item");
  const bottomHomeBtn    = document.querySelector('.bottom-nav-item[data-tab="home"]');
  const bottomHotBtn     = document.querySelector('.bottom-nav-item[data-tab="hot"]');
  const bottomPromoBtn   = document.querySelector('.bottom-nav-item[data-tab="promo"]');
  const bottomPartnerBtn = document.querySelector('.bottom-nav-item[data-tab="partner"]');

  function updateBottomNavActive(tab) {
    if (!bottomNavItems || !bottomNavItems.length) return;
    bottomNavItems.forEach(btn => {
      const t = btn.dataset.tab;
      btn.classList.toggle("active", t === tab);
    });
  }

  const rateGameTimeEl = document.getElementById("rateGameTime");

  // ====== CONTAINER FLOATING BUTTONS ======
  const floatingLeftEl  = document.getElementById("floatingLeft");
  const floatingRightEl = document.getElementById("floatingRight");

  const FLOAT_COLLAPSE_KEY = "tipsFloatingContactsCollapsed.v1";
  let floatingCollapsed = false;
  try {
    floatingCollapsed = localStorage.getItem(FLOAT_COLLAPSE_KEY) === "1";
  } catch (e) {
    floatingCollapsed = false;
  }

  // ====== SIDEBAR NAV ======
  const sideMenuBtn   = document.getElementById("sideMenuBtn");
  const sideMenu      = document.getElementById("sideMenu");
  const sideOverlay   = document.getElementById("sideOverlay");
  const sideMenuList  = document.getElementById("sideMenuList");

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

  if (sideMenuBtn)   sideMenuBtn.addEventListener("click", openSidebar);
  if (sideOverlay)   sideOverlay.addEventListener("click", closeSidebar);

  // ====== TAB HOME / HOT / PROMO / PARTNER (LOCALSTORAGE) ======
  const TAB_KEY = "tipsPageActiveTab";
  let currentTab = "home";

  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (["home", "hot", "promo", "partner"].includes(saved)) currentTab = saved;
  } catch (e) {
    console.warn("Gagal baca tab awal dari localStorage", e);
  }

  // config dari Firebase (nav_tabs)
  let navConfig = { home: true, hot: true, promo: true, partner: true };

  function getFirstEnabledTab() {
    const order = ["home", "hot", "promo", "partner"];
    return order.find(t => navConfig[t]) || "home";
  }

  // ✅ Active gold untuk sidebar
  function updateSidebarActive(tab){
    if (!sideMenuList) return;
    sideMenuList.querySelectorAll(".side-menu-item").forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
  }

  function setActiveTab(tab) {
    // kalau tab dimatikan dari admin, pindah ke tab pertama yang aktif
    if (!navConfig[tab]) tab = getFirstEnabledTab();
    currentTab = tab;

    // sembunyikan semua section
    if (homePage)    homePage.style.display    = "none";
    if (hotGamePage) hotGamePage.style.display = "none";
    if (promoPage)   promoPage.style.display   = "none";
    if (partnerPage) partnerPage.style.display = "none";

    // tampilkan section sesuai tab
    if (tab === "hot" && hotGamePage && navConfig.hot) {
      hotGamePage.style.display = "block";
    } else if (tab === "promo" && promoPage && navConfig.promo) {
      promoPage.style.display = "block";
    } else if (tab === "partner" && partnerPage && navConfig.partner) {
      partnerPage.style.display = "block";
    } else if (homePage && navConfig.home) {
      homePage.style.display = "block";
      currentTab = "home";
    }

    // simpan tab ke localStorage
    try { localStorage.setItem(TAB_KEY, currentTab); } catch (e) {}

    // update active bottom + sidebar
    updateBottomNavActive(currentTab);
    updateSidebarActive(currentTab);
  }

  // ==== fungsi global dipanggil dari HTML bottom nav ====
  window.handleBottomNavClick = function (tab) {
    setActiveTab(tab);
  };

  // ==== fallback lama ====
  window.showHome        = () => setActiveTab("home");
  window.showHotGame     = () => setActiveTab("hot");
  window.showPromotion   = () => setActiveTab("promo");
  window.showPartner     = () => setActiveTab("partner");
  window.showPartnership = window.showPartner;

  // ====== BUILDER SIDEBAR: ambil dari bottom-nav otomatis ======
  function buildSidebarItems() {
    if (!sideMenuList) return;
    sideMenuList.innerHTML = "";

    const bottomButtons = document.querySelectorAll(".bottom-nav-item");

    bottomButtons.forEach((btn) => {
      // kalau button dah di-hide (admin OFF), skip terus
      if (btn.style.display === "none") return;

      const tab = btn.dataset.tab;
      const label = btn.querySelector(".bottom-nav-label")?.textContent?.trim() || tab.toUpperCase();
      const iconSrc = btn.querySelector("img")?.getAttribute("src") || "";

      const item = document.createElement("button");
      item.type = "button";
      item.className = "side-menu-item";
      item.dataset.tab = tab; // ✅ penting untuk active state

      item.innerHTML = `
        <span class="side-menu-ico">
          ${iconSrc ? `<img src="${iconSrc}" alt="">` : ""}
        </span>
        <span class="side-menu-text">${label}</span>
      `;

      item.addEventListener("click", () => {
        window.handleBottomNavClick(tab);
        closeSidebar(); // ✅ FIX: dulu closeSideMenu() sebab error
      });

      sideMenuList.appendChild(item);
    });

    // ✅ pastikan highlight ikut tab semasa
    updateSidebarActive(currentTab);
  }

  // ====== set tab awal (sebelum firebase nav_tabs datang) ======
  setActiveTab(currentTab);

  // ====== RATE GAME TIME (REALTIME CLOCK) ======
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

  // ====== AUTO SLIDER HOME IMAGE ======
  const track = document.getElementById("slideTrack");
  if (track) {
    const slides = track.querySelectorAll("img");
    if (slides.length > 1) {
      let index = 0;
      setInterval(() => {
        index = (index + 1) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
      }, 3500);
    }
  }

  // ====== FIREBASE CHECK ======
  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  const cardsRef     = db.ref("tips_cards");
  const promosRef    = db.ref("promo_banners");
  const promoBigRef  = db.ref("promotions");
  const partnersRef  = db.ref("partnerships");
  const navTabsRef   = db.ref("nav_tabs");
  const floatingRef  = db.ref("floating_buttons");

  let promoSliderTimer = null;

  // ====== NAV TABS CONFIG DARI FIREBASE ======
  function applyNavConfig(cfgRaw) {
    const defaults = { home: true, hot: true, promo: true, partner: true };
    navConfig = { ...defaults, ...(cfgRaw || {}) };

    // kontrol tombol bottom-nav
    if (bottomHomeBtn)    bottomHomeBtn.style.display    = navConfig.home    ? "" : "none";
    if (bottomHotBtn)     bottomHotBtn.style.display     = navConfig.hot     ? "" : "none";
    if (bottomPromoBtn)   bottomPromoBtn.style.display   = navConfig.promo   ? "" : "none";
    if (bottomPartnerBtn) bottomPartnerBtn.style.display = navConfig.partner ? "" : "none";

    // pastikan tab aktif tidak OFF
    setActiveTab(currentTab);

    // rebuild sidebar ikut config terbaru
    buildSidebarItems();
  }

  navTabsRef.on("value", (snap) => {
    applyNavConfig(snap.val());
  });

  // ✅ kalau bro tak nak “flash sidebar”, comment line bawah
  buildSidebarItems();

  // ================== FLOATING BUTTONS ==================
  function renderFloatingButtons(snapshot) {
    const data = snapshot.val() || {};
    const wa   = data.whatsapp || {};
    const tg   = data.telegram || {};
    const join = data.join     || {};

    if (floatingLeftEl) {
      floatingLeftEl.innerHTML = "";
      floatingLeftEl.classList.toggle("collapsed", floatingCollapsed);
    }
    if (floatingRightEl) {
      floatingRightEl.innerHTML = "";
    }

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

    if (waBtn)   stack.appendChild(waBtn);
    if (tgBtn)   stack.appendChild(tgBtn);
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

  floatingRef.on("value", renderFloatingButtons);

  // ================== PROMO BANNER ==================
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

    if (cardsDom.length <= 4) return;

    const pageSize   = 4;
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

  promosRef.on("value", renderPromos);

  // ================== PROMOTION BIG ==================
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

  promoBigRef.on("value", renderPromoBig);

  // ================== PARTNERSHIP ==================
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
      const logoUrl = p.logoUrl || "";
      const joinUrl = p.joinUrl || "#";
      const name    = p.name || "";
      const rating  = p.rating != null ? Number(p.rating).toFixed(1) : null;
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

      partnerGridEl.appendChild(card);
    });
  }

  partnersRef.on("value", renderPartners);

  // ====== KALAU TAK ADA GRID TIPS, STOP BAGIAN TIPS ======
  if (!gridEl) return;

  // ====== HISTORY & LOCALSTORAGE UNTUK TIPS ======
  const STORAGE_KEY = "tipsHistory.v1";
  let historyObj = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) historyObj = JSON.parse(raw) || {};
  } catch (e) {
    historyObj = {};
  }

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
      gridEl.innerHTML = '<p class="text-muted small">Belum ada card aktif. Buat dari halaman admin.</p>';
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
      output.textContent = "Tekan Generate untuk keluarkan tips.";

      const actions = document.createElement("div");
      actions.className = "tip-actions";

      const backBtn = document.createElement("button");
      backBtn.className = "btn secondary";
      backBtn.textContent = "Back";

      const genBtn = document.createElement("button");
      genBtn.className = "btn primary";
      genBtn.textContent = "Generate";

      const state = getHistoryState(card.key);

      if (state.history.length > 0 && state.index >= 0) output.textContent = state.history[state.index];

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

  cardsRef.on("value", renderCards);
});

// ===== BACK TO TOP BUTTON =====
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
