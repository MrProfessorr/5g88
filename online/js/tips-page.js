// online/js/tips-page.js

document.addEventListener("DOMContentLoaded", () => {
  const gridEl       = document.getElementById("tipsCardsGrid");
  const promoGridEl  = document.getElementById("promoGrid");

  // ====== TAB HOME / HOT GAME (dengan localStorage) ======
  const homePage   = document.getElementById("homePage");
  const hotGamePage= document.getElementById("hotGamePage");
  const navHome    = document.getElementById("navHome");
  const navHot     = document.getElementById("navHot");
  const TAB_KEY    = "tipsPage.activeTab.v1";

  function setActiveTab(tab){
    localStorage.setItem(TAB_KEY, tab);
  }

  window.showHome = function () {
    if (!homePage || !hotGamePage) return;
    homePage.style.display   = "block";
    hotGamePage.style.display= "none";
    navHome && navHome.classList.add("active");
    navHot  && navHot.classList.remove("active");
    setActiveTab("home");
  };

  window.showHotGame = function () {
    if (!homePage || !hotGamePage) return;
    homePage.style.display   = "none";
    hotGamePage.style.display= "block";
    navHot  && navHot.classList.add("active");
    navHome && navHome.classList.remove("active");
    setActiveTab("hot");
  };

  // pilih tab dari localStorage (default: home)
  const savedTab = localStorage.getItem(TAB_KEY);
  if (savedTab === "hot") {
    window.showHotGame();
  } else {
    window.showHome();
  }

  // ===== AUTO SLIDER HOME IMAGE =====
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

  // Kalau tak ada grid tips, tak perlu lanjut Firebase
  if (!gridEl && !promoGridEl) return;

  // ====== FIREBASE CHECK ======
  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  const cardsRef  = db.ref("tips_cards");
  const promosRef = db.ref("promo_banners");

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

    // shuffle
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

  // ====== RENDER TIPS CARDS ======
  function renderCards(snapshot) {
    if (!gridEl) return;

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

  // ====== RENDER PROMO BANNERS ======
  function renderPromos(snapshot) {
    if (!promoGridEl) return;

    const data = snapshot.val() || {};
    promoGridEl.innerHTML = "";

    const entries = Object.entries(data)
      .map(([key, item]) => ({ key, ...item }))
      .filter((p) => p.enabled !== false);

    if (entries.length === 0) return;

    entries.sort((a, b) => (a.order || 0) - (b.order || 0));

    entries.forEach((p) => {
      const card = document.createElement("article");
      card.className = "promo-card";

      const imgWrap = document.createElement("div");
      imgWrap.className = "promo-card-img-wrap";

      const img = document.createElement("img");
      img.className = "promo-card-img";
      img.src = p.imageUrl;
      img.alt = p.title || "Free Credit";

      imgWrap.appendChild(img);

      const footer = document.createElement("div");
      footer.className = "promo-card-footer";

      const btn = document.createElement("button");
      btn.className = "btn primary promo-claim-btn";
      btn.textContent = p.buttonText || "CLAIM";

      btn.addEventListener("click", () => {
        if (!p.targetUrl) return;
        window.open(p.targetUrl, "_blank", "noopener");
      });

      footer.appendChild(btn);

      card.appendChild(imgWrap);
      card.appendChild(footer);

      promoGridEl.appendChild(card);
    });
  }

  cardsRef.on("value", renderCards);
  promosRef.on("value", renderPromos);
});
