// online/js/tips-page.js

document.addEventListener("DOMContentLoaded", () => {
  const gridEl        = document.getElementById("tipsCardsGrid");
  const promoGridEl   = document.getElementById("promoGrid");
  const promoBigGridEl= document.getElementById("promoBigGrid"); // ✅ grid untuk PROMOTION

  const homePage      = document.getElementById("homePage");
  const hotGamePage   = document.getElementById("hotGamePage");
  const promoPage     = document.getElementById("promoPage");

  const navHome       = document.getElementById("navHome");
  const navHot        = document.getElementById("navHot");
  const navPromo      = document.getElementById("navPromo");

  // ⬇️ Elemen teks waktu RATE GAME di header kanan
  const rateGameTimeEl = document.getElementById("rateGameTime");

  // ====== TAB HOME / HOT GAME / PROMOTION DENGAN LOCALSTORAGE ======
  const TAB_KEY = "tipsPageActiveTab";

  function setActiveTab(tab) {
    if (!homePage || !hotGamePage) return;

    // sembunyikan semua page dulu
    homePage.style.display    = "none";
    hotGamePage.style.display = "none";
    if (promoPage) promoPage.style.display = "none";

    // reset active nav
    navHome  && navHome.classList.remove("active");
    navHot   && navHot.classList.remove("active");
    navPromo && navPromo.classList.remove("active");

    if (tab === "hot") {
      hotGamePage.style.display = "block";
      navHot && navHot.classList.add("active");
    } else if (tab === "promo") {
      if (promoPage) promoPage.style.display = "block";
      navPromo && navPromo.classList.add("active");
    } else {
      // default HOME
      homePage.style.display = "block";
      navHome && navHome.classList.add("active");
      tab = "home";
    }

    try {
      localStorage.setItem(TAB_KEY, tab);
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

  // baca tab terakhir saat load
  let initialTab = "home";
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === "hot" || saved === "home" || saved === "promo") {
      initialTab = saved;
    }
  } catch (e) {
    console.warn("Gagal baca tab aktif", e);
  }
  setActiveTab(initialTab);

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

  const cardsRef    = db.ref("tips_cards");
  const promosRef   = db.ref("promo_banners"); // FREE CREDIT kecil
  const promoBigRef = db.ref("promotions");    // PROMOTION besar

  let promoSliderTimer = null;

  // ================== PROMO BANNER (FREE CREDIT) ==================
  function renderPromos(snapshot) {
    if (!promoGridEl) return;

    // bersihkan timer lama kalau ada
    if (promoSliderTimer) {
      clearInterval(promoSliderTimer);
      promoSliderTimer = null;
    }

    const data = snapshot.val() || {};
    promoGridEl.innerHTML = "";

    const entries = Object.entries(data);
    if (entries.length === 0) return;

    const cardsDom = []; // simpan DOM card untuk slider

    entries.forEach(([key, promo]) => {
      const imageUrl  = promo.imageUrl || "";
      const targetUrl = promo.targetUrl || "#";
      const title     = promo.title || "";
      const caption   = promo.caption || "";

      if (!imageUrl) return; // kalau tak ada gambar, skip

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

      // Caption di bawah gambar
      if (caption || title) {
        const captionEl = document.createElement("div");
        captionEl.className = "promo-card-caption";
        captionEl.textContent = caption || title;
        card.appendChild(captionEl);
      }

      promoGridEl.appendChild(card);
      cardsDom.push(card);
    });

    // Kalau banner <= 4 → tampil biasa, tidak usah slider
    if (cardsDom.length <= 4) return;

    // ========= SLIDER: tampil 4 card sekaligus, auto ganti setiap 3 detik =========
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

  // ====== KALAU TAK ADA GRID TIPS, STOP BAGIAN TIPS ======
  if (!gridEl) return;

  // ====== HISTORY & LOCALSTORAGE UNTUK TIPS ======
  const STORAGE_KEY = "tipsHistory.v1";

  // { [cardKey]: { history: [text], index:number } }
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

  // Random integer [min, max]
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

  function renderCards(snapshot) {
    const data = snapshot.val() || {};
    gridEl.innerHTML = "";

    const entries = Object.entries(data)
      .map(([key, card]) => ({ key, ...card }))
      .filter((c) => c.enabled !== false); // default aktif

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

      // Kalau ada history tersimpan, tampilkan last state
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
