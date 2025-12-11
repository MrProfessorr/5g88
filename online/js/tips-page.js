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

  const navHome    = document.getElementById("navHome");
  const navHot     = document.getElementById("navHot");
  const navPromo   = document.getElementById("navPromo");
  const navPartner = document.getElementById("navPartner");
  const navMoreBtn   = document.getElementById("navMoreBtn");
  const navDropdown  = document.getElementById("navDropdown");

  const rateGameTimeEl = document.getElementById("rateGameTime");

  // ====== CONTAINER FLOATING BUTTONS ======
  const floatingLeftEl  = document.getElementById("floatingLeft");
  const floatingRightEl = document.getElementById("floatingRight");

  // 🔽 STATE COLLAPSE UNTUK FLOATING BUTTONS (WA / TG / JOIN)
  const FLOAT_COLLAPSE_KEY = "tipsFloatingContactsCollapsed.v1";
  let floatingCollapsed = false;
  try {
    floatingCollapsed = localStorage.getItem(FLOAT_COLLAPSE_KEY) === "1";
  } catch (e) {
    floatingCollapsed = false;
  }

  // ====== TAB HOME / HOT / PROMO / PARTNER (LOCALSTORAGE) ======
  const TAB_KEY = "tipsPageActiveTab";
  let currentTab = "home";

  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (["home", "hot", "promo", "partner"].includes(saved)) {
      currentTab = saved;
    }
  } catch (e) {
    console.warn("Gagal baca tab awal dari localStorage", e);
  }

  function setActiveTab(tab) {
    currentTab = tab;

    if (homePage)    homePage.style.display    = "none";
    if (hotGamePage) hotGamePage.style.display = "none";
    if (promoPage)   promoPage.style.display   = "none";
    if (partnerPage) partnerPage.style.display = "none";

    navHome    && navHome.classList.remove("active");
    navHot     && navHot.classList.remove("active");
    navPromo   && navPromo.classList.remove("active");
    navPartner && navPartner.classList.remove("active");

    if (tab === "hot" && hotGamePage && navHot && navHot.style.display !== "none") {
      hotGamePage.style.display = "block";
      navHot.classList.add("active");
    } else if (tab === "promo" && promoPage && navPromo && navPromo.style.display !== "none") {
      promoPage.style.display = "block";
      navPromo.classList.add("active");
    } else if (tab === "partner" && partnerPage && navPartner && navPartner.style.display !== "none") {
      partnerPage.style.display = "block";
      navPartner.classList.add("active");
    } else {
      if (homePage && navHome && navHome.style.display !== "none") {
        homePage.style.display = "block";
        navHome.classList.add("active");
        currentTab = "home";
        tab = "home";
      }
    }

    try {
      localStorage.setItem(TAB_KEY, currentTab);
    } catch (e) {
      console.warn("Gagal simpan tab aktif", e);
    }
  }

  // dipakai di onclick HTML
  window.showHome = function () {
    setActiveTab("home");
  };
  window.showHotGame = function () {
    setActiveTab("hot");
  };
  window.showPromotion = function () {
    setActiveTab("promo");
  };
  window.showPartner = function () {
    setActiveTab("partner");
  };
  // alias kalau nanti di HTML kamu pakai showPartnership()
  window.showPartnership = window.showPartner;

  // sementara sebelum baca config nav_tabs, pakai tab dari localStorage
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

    rateGameTimeEl.textContent =
      `RATE GAME : ${hours}:${mins}:${secs} ${day} ${month} ${year}`;
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
        index++;
        if (index >= slides.length) index = 0;
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
  const floatingRef  = db.ref("floating_buttons"); // 🔥 config tombol floating

  let promoSliderTimer = null;

  // ====== NAV TABS CONFIG DARI FIREBASE ======
  function applyNavConfig(cfgRaw) {
    const defaults = { home: true, hot: true, promo: true, partner: true };
    const cfg = { ...defaults, ...(cfgRaw || {}) };

    if (navHome) {
      navHome.style.display = cfg.home ? "" : "none";
    }
    if (homePage && !cfg.home) homePage.style.display = "none";

    if (navHot) {
      navHot.style.display = cfg.hot ? "" : "none";
    }
    if (hotGamePage && !cfg.hot) hotGamePage.style.display = "none";

    if (navPromo) {
      navPromo.style.display = cfg.promo ? "" : "none";
    }
    if (promoPage && !cfg.promo) promoPage.style.display = "none";

    if (navPartner) {
      navPartner.style.display = cfg.partner ? "" : "none";
    }
    if (partnerPage && !cfg.partner) partnerPage.style.display = "none";

    let wanted = currentTab;
    if (!cfg[wanted]) {
      const order = ["home", "hot", "promo", "partner"];
      wanted = order.find((t) => cfg[t]) || "home";
    }
    setActiveTab(wanted);
  }

  navTabsRef.on("value", (snap) => {
    applyNavConfig(snap.val());
  });

  // ================== FLOATING BUTTONS (WA / TG / JOIN US) ==================
  function renderFloatingButtons(snapshot) {
    const data = snapshot.val() || {};
    const wa   = data.whatsapp || {};
    const tg   = data.telegram || {};
    const join = data.join     || {};

    if (floatingLeftEl) {
      floatingLeftEl.innerHTML = "";
      // apply class collapsed sesuai state
      if (floatingCollapsed) {
        floatingLeftEl.classList.add("collapsed");
      } else {
        floatingLeftEl.classList.remove("collapsed");
      }
    }
    if (floatingRightEl) {
      floatingRightEl.innerHTML = ""; // kanan tidak dipakai
    }

    // Helper buat 1 tombol
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

    // stack untuk WA / TG / JOIN
    const stack = document.createElement("div");
    stack.className = "floating-stack";

    const waBtn   = createFloatingBtn(wa,   "floating-wa",   "WA");
    const tgBtn   = createFloatingBtn(tg,   "floating-tg",   "TG");
    const joinBtn = createFloatingBtn(join, "floating-join", "JOIN");

    if (waBtn)   stack.appendChild(waBtn);   // 1
    if (tgBtn)   stack.appendChild(tgBtn);   // 2
    if (joinBtn) stack.appendChild(joinBtn); // 3

    floatingLeftEl.appendChild(stack);

    // ===== tombol panah toggle di bawah =====
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "floating-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle contact buttons");

    const svgUp = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 14l5-5 5 5" />
      </svg>`;
    const svgDown = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10l5 5 5-5" />
      </svg>`;

    function updateArrowIcon() {
      toggleBtn.innerHTML = floatingCollapsed ? svgDown : svgUp;
    }

    updateArrowIcon();

    toggleBtn.addEventListener("click", () => {
      floatingCollapsed = !floatingCollapsed;

      if (floatingCollapsed) {
        floatingLeftEl.classList.add("collapsed");
        try { localStorage.setItem(FLOAT_COLLAPSE_KEY, "1"); } catch (e) {}
      } else {
        floatingLeftEl.classList.remove("collapsed");
        try { localStorage.setItem(FLOAT_COLLAPSE_KEY, "0"); } catch (e) {}
      }
      updateArrowIcon();
    });

    floatingLeftEl.appendChild(toggleBtn);
  }

  floatingRef.on("value", renderFloatingButtons);

  // ================== PROMO BANNER (FREE CREDIT) ==================
  function renderPromos(snapshot) {
    if (!promoGridEl) return;

    if (promoSliderTimer) {
      clearInterval(promoSliderTimer);
      promoSliderTimer = null;
    }

    const raw = snapshot.val() || {};
    promoGridEl.innerHTML = "";

    const entries = Object.entries(raw)
      .filter(([k, promo]) => promo && promo.enabled !== false);

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

  // ================== PROMOTION BANNER BESAR (TAB PROMOTION) ==================
  function renderPromoBig(snapshot) {
    if (!promoBigGridEl) return;

    const data = snapshot.val() || {};
    promoBigGridEl.innerHTML = "";

    const entries = Object.entries(data)
      .filter(([key, promo]) => promo && promo.enabled !== false);

    if (!entries.length) {
      promoBigGridEl.innerHTML =
        '<p class="text-muted small">Belum ada promotion aktif.</p>';
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

  // ================== PARTNERSHIP (TAB PARTNERSHIP) ==================
  function renderPartners(snapshot) {
    if (!partnerGridEl) return;

    const data = snapshot.val() || {};
    partnerGridEl.innerHTML = "";

    const entries = Object.entries(data)
      .filter(([key, p]) => p && p.enabled !== false);

    if (!entries.length) {
      partnerGridEl.innerHTML =
        '<p class="text-muted small">Belum ada partnership aktif.</p>';
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyObj));
    } catch (e) {
      console.warn("Gagal simpan history ke localStorage", e);
    }
  }

  function getHistoryState(key) {
    if (!historyObj[key]) {
      historyObj[key] = { history: [], index: -1 };
    }
    return historyObj[key];
  }

  const randInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

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
      gridEl.innerHTML =
        '<p class="text-muted small">Belum ada card aktif. Buat dari halaman admin.</p>';
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

  cardsRef.on("value", renderCards);
});
