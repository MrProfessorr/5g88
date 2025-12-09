// online/js/tips-page.js

document.addEventListener("DOMContentLoaded", () => {
  const gridEl      = document.getElementById("tipsCardsGrid");
  const promoGridEl = document.getElementById("promoGrid");
  const homePage    = document.getElementById("homePage");
  const hotGamePage = document.getElementById("hotGamePage");
  const navHome     = document.getElementById("navHome");
  const navHot      = document.getElementById("navHot");

  // Elemen teks waktu RATE GAME di header kanan
  const rateGameTimeEl = document.getElementById("rateGameTime");

  /* =====================================================
   *          LANGUAGE SWITCHER (FLAG DROPDOWN)
   * ===================================================== */
  const LANG_KEY   = "tipsPageLang";
  const langButton = document.getElementById("langButton");
  const langMenu   = document.getElementById("langMenu");
  const langFlag   = document.getElementById("langFlag");

  const LANGS = {
    en: { label: "ENGLISH",   flag: "🇬🇧" },
    zh: { label: "CHINA",     flag: "🇨🇳" },
    id: { label: "INDONESIA", flag: "🇮🇩" },
    vi: { label: "VIETNAM",   flag: "🇻🇳" },
    sg: { label: "SINGAPORE", flag: "🇸🇬" },
    th: { label: "THAILAND",  flag: "🇹🇭" },
  };

  function applyLanguage(code){
    const lang = LANGS[code] || LANGS.id;

    // set attribute di <html> (kalau nanti mau styling/per teks per bahasa)
    document.documentElement.setAttribute("data-lang", code);

    // ganti icon bendera di tombol bulat
    if (langFlag) langFlag.textContent = lang.flag;

    // simpan ke localStorage
    try { localStorage.setItem(LANG_KEY, code); } catch(e){}

    // Contoh: kalau mau ubah tulisan nav per bahasa, bisa di sini
    // (sekarang aku biarkan tetap HOME / HOT GAME)
    if (navHome) navHome.textContent = "HOME";
    if (navHot)  navHot.textContent  = "HOT GAME";
  }

  if (langButton && langMenu){
    // buka/tutup dropdown saat tombol bendera ditekan
    langButton.addEventListener("click", () => {
      langMenu.classList.toggle("open");
    });

    // pilih salah satu bahasa
    langMenu.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-lang]");
      if (!btn) return;
      const code = btn.getAttribute("data-lang");
      applyLanguage(code);
      langMenu.classList.remove("open");
    });

    // klik di luar dropdown -> tutup menu
    document.addEventListener("click", (e) => {
      if (!langMenu.contains(e.target) && !langButton.contains(e.target)){
        langMenu.classList.remove("open");
      }
    });

    // set bahasa awal dari localStorage / default INDONESIA
    let initialLang = "id";
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && LANGS[saved]) initialLang = saved;
    } catch(e){}
    applyLanguage(initialLang);
  }

  /* =====================================================
   *      TAB HOME / HOT GAME + LOCALSTORAGE
   * ===================================================== */
  const TAB_KEY = "tipsPageActiveTab";

  function setActiveTab(tab) {
    if (!homePage || !hotGamePage) return;

    if (tab === "hot") {
      homePage.style.display    = "none";
      hotGamePage.style.display = "block";

      navHome && navHome.classList.remove("active");
      navHot  && navHot.classList.add("active");
    } else {
      // default HOME
      homePage.style.display    = "block";
      hotGamePage.style.display = "none";

      navHome && navHome.classList.add("active");
      navHot  && navHot.classList.remove("active");
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

  // baca tab terakhir saat load
  let initialTab = "home";
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === "hot" || saved === "home") initialTab = saved;
  } catch (e) {
    console.warn("Gagal baca tab aktif", e);
  }
  setActiveTab(initialTab);

  /* =====================================================
   *          RATE GAME TIME (REALTIME CLOCK)
   * ===================================================== */
  function updateRateGameTime() {
    if (!rateGameTimeEl) return;

    const now = new Date();

    const pad = (n) => String(n).padStart(2, "0");

    const hours = pad(now.getHours());
    const mins  = pad(now.getMinutes());
    const secs  = pad(now.getSeconds());

    const day   = pad(now.getDate());
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = months[now.getMonth()];
    const year  = now.getFullYear();

    rateGameTimeEl.textContent =
      `RATE GAME : ${hours}:${mins}:${secs} ${day} ${month} ${year}`;
  }

  if (rateGameTimeEl) {
    updateRateGameTime();
    setInterval(updateRateGameTime, 1000);
  }

  /* =====================================================
   *                AUTO SLIDER HOME IMAGE
   * ===================================================== */
  const track = document.getElementById("slideTrack");
  if (track) {
    const slides = track.querySelectorAll("img");
    if (slides.length > 1) {
      let index = 0;
      setInterval(() => {
        index++;
        if (index >= slides.length) index = 0;
        track.style.transform = `translateX(-${index * 100}%)`;
      }, 3500); // 3.5s sekali tukar gambar
    }
  }

  /* =====================================================
   *                FIREBASE CHECK
   * ===================================================== */
  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  const cardsRef  = db.ref("tips_cards");
  const promosRef = db.ref("promo_banners");

  /* =====================================================
   *          PROMO BANNER (FREE CREDIT)
   * ===================================================== */
  function renderPromos(snapshot) {
    if (!promoGridEl) return;

    const data = snapshot.val() || {};
    promoGridEl.innerHTML = "";

    const entries = Object.entries(data);

    if (entries.length === 0) {
      return;
    }

    entries.forEach(([key, promo]) => {
      const imageUrl  = promo.imageUrl || "";
      const targetUrl = promo.targetUrl || "#";
      const title     = promo.title || "";
      const caption   = promo.caption || "";  // caption dari DB

      if (!imageUrl) return; // kalau tak ada gambar, skip

      const card = document.createElement("article");
      card.className = "promo-card";

      // Hanya gambar yang dapat diklik (ke link claim)
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

      // Caption di bawah gambar (bukan link)
      if (caption || title) {
        const captionEl = document.createElement("div");
        captionEl.className = "promo-card-caption";
        captionEl.textContent = caption || title;
        card.appendChild(captionEl);
      }

      promoGridEl.appendChild(card);
    });
  }

  // listen realtime banner
  promosRef.on("value", renderPromos);

  /* =====================================================
   *          TIPS GENERATOR (CARD PLATFORM)
   * ===================================================== */

  // kalau tak ada grid tips, stop
  if (!gridEl) return;

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
