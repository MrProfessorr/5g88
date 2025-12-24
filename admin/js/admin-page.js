// admin/js/admin-page.js

document.addEventListener("DOMContentLoaded", () => {
  const MODAL_OPEN_CLASS = "show";

  // ===== ELEMENT MODAL PLATFORM / PRODUCT =====
  const platformModal      = document.getElementById("platformModal");
  const platformModalTitle = document.getElementById("platformModalTitle");
  const platformInput      = document.getElementById("platformName");
  const gameListBox        = document.getElementById("gameListBox");
  const platformSaveBtn    = document.getElementById("platformModalSaveBtn");
  const cardsListEl        = document.getElementById("cardsList");

  // Modal VIEW / EDIT list game per card
  const gamesModal        = document.getElementById("gamesModal");
  const gamesModalTitle   = document.getElementById("gamesModalTitle");
  const gamesModalBox     = document.getElementById("gamesModalBox");
  const gamesModalEditBtn = document.getElementById("gamesModalEditBtn");
  const gamesModalSaveBtn = document.getElementById("gamesModalSaveBtn");
  let currentEditKey      = null;

  // ===== NAV TABS TOGGLE =====
  const navHomeToggle    = document.getElementById("navHomeToggle");
  const navHotToggle     = document.getElementById("navHotToggle");
  const navGameListToggle = document.getElementById("navGameListToggle");
  const navPromoToggle   = document.getElementById("navPromoToggle");
  const navPartnerToggle = document.getElementById("navPartnerToggle");

  // ===== ELEMENT FLOATING BUTTONS (WA / TG / JOIN) =====
  const waEnabled       = document.getElementById("waEnabled");
  const waLinkInput     = document.getElementById("waLink");
  const waIconInput     = document.getElementById("waIcon");

  const tgEnabled       = document.getElementById("tgEnabled");
  const tgLinkInput     = document.getElementById("tgLink");
  const tgIconInput     = document.getElementById("tgIcon");

  const joinEnabled     = document.getElementById("joinEnabled");
  const joinLinkInput   = document.getElementById("joinLink");
  const joinIconInput   = document.getElementById("joinIcon");

  const floatingSaveBtn = document.getElementById("floatingSaveBtn");

  // ===== ELEMENT PROMO BANNER (FREE CREDIT kecil) =====
  const promoListEl       = document.getElementById("promoList");
  const promoModal        = document.getElementById("promoModal");
  const promoModalTitle   = document.getElementById("promoModalTitle");
  const promoTitleInput   = document.getElementById("promoTitle");
  const promoCaptionInput = document.getElementById("promoCaption");
  const promoImageInput   = document.getElementById("promoImageUrl");
  const promoTargetInput  = document.getElementById("promoTargetUrl");
  const promoModalSaveBtn = document.getElementById("promoModalSaveBtn");
  let currentPromoKey     = null;

  // ===== ELEMENT PROMOTION BANNER BESAR =====
  const promoBigListEl       = document.getElementById("promoBigList");
  const promoBigModal        = document.getElementById("promoBigModal");
  const promoBigModalTitle   = document.getElementById("promoBigModalTitle");
  const promoBigTitleInput   = document.getElementById("promoBigTitle");
  const promoBigCaptionInput = document.getElementById("promoBigCaption");
  const promoBigImageInput   = document.getElementById("promoBigImageUrl");
  const promoBigTargetInput  = document.getElementById("promoBigTargetUrl");
  const promoBigModalSaveBtn = document.getElementById("promoBigModalSaveBtn");
  let currentPromoBigKey     = null;

  // ===== ELEMENT PARTNERSHIP =====
  const partnerListEl       = document.getElementById("partnerList");
  const partnerModal        = document.getElementById("partnerModal");
  const partnerModalTitle   = document.getElementById("partnerModalTitle");
  const partnerNameInput    = document.getElementById("partnerName");
  const partnerRatingInput  = document.getElementById("partnerRating");
  const partnerLogoInput    = document.getElementById("partnerLogoUrl");
  const partnerJoinInput    = document.getElementById("partnerJoinUrl");
  const partnerChannelInput = document.getElementById("partnerChannelUrl");
  const partnerModalSaveBtn = document.getElementById("partnerModalSaveBtn");
  let currentPartnerKey     = null;

  // ==================================================
  // ✅ GAME LIST (ADMIN) ELEMENTS
  // ==================================================
  const gameListAdminListEl  = document.getElementById("gameListAdminList");
  const gameListModal        = document.getElementById("gameListModal");
  const gameListModalTitle   = document.getElementById("gameListModalTitle");
  const gameListNameInput    = document.getElementById("gameListName");
  const gameListImageInput   = document.getElementById("gameListImageUrl");
  const gameListPlayInput    = document.getElementById("gameListPlayUrl");
  const gameListPlayedMaxInput= document.getElementById("gameListPlayedMax"); 
  const gameListModalSaveBtn = document.getElementById("gameListModalSaveBtn");
  let currentGameListKey     = null;


// =========================
// ✅ TOAST SYSTEM
// =========================
const toastHost = document.getElementById("toastHost");

function toast(message, type = "info", opts = {}) {
  if (!toastHost) {
    // fallback kalau container tak wujud
    alert(message);
    return;
  }

  const duration = Number(opts.duration ?? 3200);
  const t = document.createElement("div");
  t.className = "toast";
  t.dataset.type = type;

  const icons = {
    success: `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    error: `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`,
    info: `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 8h.01M11 12h1v6h1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" stroke-width="1.6"/>
      </svg>`,
    warn: `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4m0 4h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M10.3 3.6 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" stroke="currentColor" stroke-width="1.6"/>
      </svg>`
  };

  t.innerHTML = `
    <div class="t-ico">${icons[type] || icons.info}</div>
    <div class="t-text"></div>
    <button class="t-close" type="button" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  t.querySelector(".t-text").textContent = String(message || "");

  let timer = null;

  function removeToast() {
    clearTimeout(timer);
    t.classList.remove("show");
    setTimeout(() => t.remove(), 200);
  }

  t.querySelector(".t-close").addEventListener("click", removeToast);

  // auto close
  if (duration > 0) timer = setTimeout(removeToast, duration);

  toastHost.appendChild(t);

  // trigger animation
  requestAnimationFrame(() => t.classList.add("show"));

  return { close: removeToast, el: t };
}

// Optional: shortcut functions
const toastSuccess = (m, o) => toast(m, "success", o);
const toastError   = (m, o) => toast(m, "error", o);
const toastInfo    = (m, o) => toast(m, "info", o);
const toastWarn    = (m, o) => toast(m, "warn", o);
  // ===== FIREBASE CHECK =====
  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  const cardsRef    = db.ref("tips_cards");
  const promosRef   = db.ref("promo_banners");
  const promoBigRef = db.ref("promotions");
  const partnersRef = db.ref("partnerships");
  const navTabsRef  = db.ref("nav_tabs");
  const floatingRef = db.ref("floating_buttons");
  const gameListRef = db.ref("game_list");
  const gamePlayedRef = db.ref("game_list_played");

  // ========= Helpers umum =========
  const makeKey = (name) =>
    (name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  function setupMultiInputKey(el) {
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      }
    });
  }

  setupMultiInputKey(gameListBox);
  setupMultiInputKey(gamesModalBox);

  function parseGamesText(raw) {
    if (!raw) return [];
    let text = String(raw).replace(/\u00A0/g, " ").trim();

    const quoted = text.match(/(['"])(.*?)\1/g);
    if (quoted && quoted.length) {
      return quoted
        .map((m) => m.slice(1, -1).trim())
        .filter(Boolean);
    }

    return text
      .split(/[\n\r,;]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function getGamesFromBox(el) {
    if (!el) return [];
    const raw = el.innerText || el.textContent || "";
    return parseGamesText(raw);
  }

  function setBoxFromGames(el, games) {
    if (!el) return;
    el.textContent = (games || []).join("\n");
  }

  function isValidUrl(u){
    if (!u) return false;
    try { new URL(u); return true; } catch(e) { return false; }
  }

  // ==================================================
  // ============  MODAL PLATFORM / PRODUCT  ==========
  // ==================================================
  function resetPlatformForm() {
    if (!platformInput || !gameListBox) return;
    platformInput.value = "";
    gameListBox.textContent = "";
  }

  function openPlatformNewModal() {
    if (!platformModal) return;
    platformModalTitle.textContent = "Add Platform";
    resetPlatformForm();
    platformModal.classList.add(MODAL_OPEN_CLASS);
  }

  function closePlatformModalInternal() {
    if (!platformModal) return;
    platformModal.classList.remove(MODAL_OPEN_CLASS);
  }

  window.openPlatformNewModal = openPlatformNewModal;
  window.closePlatformModal   = closePlatformModalInternal;

if (platformSaveBtn) {
  platformSaveBtn.addEventListener("click", () => {
    const platformName = (platformInput.value || "").trim();
    const games        = getGamesFromBox(gameListBox);

    // ✅ VALIDATION GUNA TOAST
    if (!platformName) {
      toastWarn("Isi nama platform dulu bro.");
      platformInput.focus();
      return;
    }

    if (games.length === 0) {
      toastWarn("Isi list nama game (min 1).");
      gameListBox.focus();
      return;
    }

    // 🔽 BARU SAMBUNG PROSES FIREBASE
    const key = makeKey(platformName);
    const payload = {
      platformName,
      games,
      enabled: true,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    cardsRef.child(key).set(payload)
      .then(() => {
        toastSuccess("Platform berjaya disimpan ✅");
        resetPlatformForm();
        closePlatformModalInternal();
      })
      .catch((err) => {
        console.error("Gagal simpan platform:", err);
        toastError("Gagal simpan ke Firebase. Cek console.", { duration: 4500 });
      });
  });
}

  // ==================================================
  // ==========  MODAL VIEW / EDIT LIST GAME  =========
  // ==================================================
  function openGamesModal(key, card) {
    if (!gamesModal || !gamesModalBox) return;

    currentEditKey = key;
    gamesModalTitle.textContent = `Daftar Game • ${card.platformName || key}`;
    setBoxFromGames(gamesModalBox, card.games || []);

    gamesModalBox.setAttribute("contenteditable", "false");
    gamesModalEditBtn.style.display = "inline-flex";
    gamesModalSaveBtn.style.display = "none";

    gamesModal.classList.add(MODAL_OPEN_CLASS);
  }

  function closeGamesModalInternal() {
    if (!gamesModal) return;
    gamesModal.classList.remove(MODAL_OPEN_CLASS);
    currentEditKey = null;
  }

  window.closeGamesModal = closeGamesModalInternal;

  if (gamesModalEditBtn && gamesModalSaveBtn && gamesModalBox) {
    gamesModalEditBtn.addEventListener("click", () => {
      gamesModalBox.setAttribute("contenteditable", "true");
      gamesModalBox.focus();
      gamesModalEditBtn.style.display = "none";
      gamesModalSaveBtn.style.display = "inline-flex";
    });

    gamesModalSaveBtn.addEventListener("click", () => {
      if (!currentEditKey) return;
      const games = getGamesFromBox(gamesModalBox);
      if (games.length === 0) {
        if (!confirm("Semua game kosong. Kosongkan list untuk card ini?")) {
          return;
        }
      }
      cardsRef.child(currentEditKey).update({
        games,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      })
.then(() => {
  toastSuccess("List game berjaya diupdate ✅");
  closeGamesModalInternal();
})
.catch((err) => {
  console.error("Gagal update list games:", err);
  toastError("Gagal update. Cek console.", { duration: 4500 });
});
    });
  }

  // ==================================================
  // ===========  RENDER LIST CARD PLATFORM  ==========
  // ==================================================
  function renderCardsList(snapshot) {
    const data = snapshot.val() || {};
    cardsListEl.innerHTML = "";

    const entries = Object.entries(data);
    if (entries.length === 0) {
      cardsListEl.innerHTML =
        '<p class="text-muted small">Belum ada platform. Tekan "Tambah Platform".</p>';
      return;
    }

    entries.forEach(([key, card]) => {
      const item = document.createElement("div");
      item.className = "admin-card-item";

      const info = document.createElement("div");
      info.className = "admin-card-info";

      const title = document.createElement("div");
      title.className = "admin-card-title";
      title.textContent = card.platformName || key;

      const sub = document.createElement("div");
      sub.className = "admin-card-sub";
      sub.textContent = `${card.games?.length || 0} game • status: ${
        card.enabled === false ? "OFF" : "AKTIF"
      }`;

      info.appendChild(title);
      info.appendChild(sub);

      const controls = document.createElement("div");
      controls.className = "switch-wrap";

      const label = document.createElement("span");
      label.className = "switch-label";
      label.textContent = "Aktif";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "toggle";
      toggle.checked = card.enabled !== false;
      toggle.addEventListener("change", () => {
        cardsRef.child(key).update({ enabled: toggle.checked });
      });

      const viewBtn = document.createElement("button");
      viewBtn.className = "btn ghost small";
      viewBtn.style.fontSize = "0.7rem";
      viewBtn.textContent = "Views";
      viewBtn.addEventListener("click", () => openGamesModal(key, card));

      const delBtn = document.createElement("button");
      delBtn.className = "btn secondary";
      delBtn.style.fontSize = "0.7rem";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        if (confirm(`Hapus card "${card.platformName}"?`)) {
          cardsRef.child(key).remove();
        }
      });

      controls.appendChild(label);
      controls.appendChild(toggle);
      controls.appendChild(viewBtn);
      controls.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(controls);
      cardsListEl.appendChild(item);
    });
  }

  cardsRef.on("value", renderCardsList);

  // ==================================================
  // ============  NAVIGATION TABS ADMIN  =============
  // ==================================================
  function renderNavTabs(snapshot) {
    const data = snapshot.val() || {};
    const defaults = { home: true, hot: true, promo: true, partner: true };
    const cfg = { ...defaults, ...data };

    if (navHomeToggle)    navHomeToggle.checked    = !!cfg.home;
    if (navHotToggle)     navHotToggle.checked     = !!cfg.hot;
    if (navGameListToggle)  navGameListToggle.checked  = !!cfg.gamelist;
    if (navPromoToggle)   navPromoToggle.checked   = !!cfg.promo;
    if (navPartnerToggle) navPartnerToggle.checked = !!cfg.partner;
  }

  if (navHomeToggle) {
    navHomeToggle.addEventListener("change", () => {
      navTabsRef.update({ home: navHomeToggle.checked });
    });
  }
  if (navHotToggle) {
    navHotToggle.addEventListener("change", () => {
      navTabsRef.update({ hot: navHotToggle.checked });
    });
  }
  if (navGameListToggle) {
    navGameListToggle.addEventListener("change", () => {
    navTabsRef.update({ gamelist: navGameListToggle.checked });
   });
  }
  if (navPromoToggle) {
    navPromoToggle.addEventListener("change", () => {
      navTabsRef.update({ promo: navPromoToggle.checked });
    });
  }
  if (navPartnerToggle) {
    navPartnerToggle.addEventListener("change", () => {
      navTabsRef.update({ partner: navPartnerToggle.checked });
    });
  }

  navTabsRef.on("value", renderNavTabs);

  // ==================================================
  // ============  FLOATING BUTTONS ADMIN  ============
  // ==================================================
  function renderFloatingButtons(snapshot) {
    const data = snapshot.val() || {};
    const wa   = data.whatsapp || {};
    const tg   = data.telegram || {};
    const join = data.join     || {};

    if (waEnabled)   waEnabled.checked = !!wa.enabled;
    if (waLinkInput) waLinkInput.value = wa.link || "";
    if (waIconInput) waIconInput.value = wa.iconUrl || "";

    if (tgEnabled)   tgEnabled.checked = !!tg.enabled;
    if (tgLinkInput) tgLinkInput.value = tg.link || "";
    if (tgIconInput) tgIconInput.value = tg.iconUrl || "";

    if (joinEnabled)   joinEnabled.checked = !!join.enabled;
    if (joinLinkInput) joinLinkInput.value = join.link || "";
    if (joinIconInput) joinIconInput.value = join.iconUrl || "";
  }

  floatingRef.on("value", renderFloatingButtons);

  if (floatingSaveBtn) {
    floatingSaveBtn.addEventListener("click", () => {
      const waLink   = (waLinkInput?.value || "").trim();
      const waIcon   = (waIconInput?.value || "").trim();
      const tgLink   = (tgLinkInput?.value || "").trim();
      const tgIcon   = (tgIconInput?.value || "").trim();
      const joinLink = (joinLinkInput?.value || "").trim();
      const joinIcon = (joinIconInput?.value || "").trim();

      const payload = {
        whatsapp: { enabled: !!waEnabled?.checked && !!waLink, link: waLink, iconUrl: waIcon },
        telegram: { enabled: !!tgEnabled?.checked && !!tgLink, link: tgLink, iconUrl: tgIcon },
        join:     { enabled: !!joinEnabled?.checked && !!joinLink, link: joinLink, iconUrl: joinIcon }
      };

floatingRef.set(payload)
  .then(() => toastSuccess("Setting floating buttons berjaya disimpan ✅"))
  .catch((err) => {
    console.error("Gagal simpan floating buttons:", err);
    toastError("Gagal simpan floating buttons. Cek console.", { duration: 4500 });
  });
    });
  }

  // ==================================================
  // ================== GAME LIST ADMIN ===============
  // ==================================================
  function resetGameListForm(){
    if (gameListNameInput)  gameListNameInput.value  = "";
    if (gameListImageInput) gameListImageInput.value = "";
  }

  function openGameListNewModal(){
    if (!gameListModal) return;
    currentGameListKey = null;
    if (gameListModalTitle) gameListModalTitle.textContent = "Tambah Game";
    resetGameListForm();
    gameListModal.classList.add(MODAL_OPEN_CLASS);
  }

  function openGameListEditModal(key, data){
    if (!gameListModal) return;
    currentGameListKey = key;
    if (gameListModalTitle) gameListModalTitle.textContent = "Edit Game";
    if (gameListNameInput)  gameListNameInput.value  = data.gameName || data.name || "";
    if (gameListImageInput) gameListImageInput.value = data.imageUrl || data.image || "";
    if (gameListPlayInput)  gameListPlayInput.value  = data.playUrl  || data.link || "";
    if (gameListPlayedMaxInput) {
    const raw = Number(data.playedMax ?? 398);
    gameListPlayedMaxInput.value = (isFinite(raw) && raw > 0) ? Math.floor(raw) : 398;
  }
    gameListModal.classList.add(MODAL_OPEN_CLASS);
  }

  function closeGameListModalInternal(){
    if (!gameListModal) return;
    gameListModal.classList.remove(MODAL_OPEN_CLASS);
    currentGameListKey = null;
  }

  window.openGameListNewModal = openGameListNewModal;
  window.closeGameListModal   = closeGameListModalInternal;

  if (gameListModalSaveBtn) {
    gameListModalSaveBtn.addEventListener("click", () => {
      const gameName = (gameListNameInput?.value || "").trim();
      const imageUrl = (gameListImageInput?.value || "").trim();
      const playUrl  = (gameListPlayInput?.value || "").trim();

if (!gameName) { toastWarn("Please fill Platform name."); gameListNameInput?.focus(); return; }
if (!imageUrl) { toastWarn("Please fill URL image."); gameListImageInput?.focus(); return; }
if (!playUrl)  { toastWarn("Please fill link Playnow"); gameListPlayInput?.focus(); return; }

if (!isValidUrl(imageUrl)) { toastWarn("URL image not valid. Example : https://"); return; }
if (!isValidUrl(playUrl))  { toastWarn("Link PlayNow not valid. Example : https://"); return; }
      const playedMaxRaw = Number(gameListPlayedMaxInput?.value || 398);
      const playedMax = (isFinite(playedMaxRaw) && playedMaxRaw > 0) ? Math.floor(playedMaxRaw) : 398;

      const payload = {
        gameName,
        imageUrl,
        playUrl,
        playedMax,
        enabled: true,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      let op;

      if (currentGameListKey) {
      op = gameListRef.child(currentGameListKey).update(payload);
      } else {
      const newRef = gameListRef.push();
      op = newRef.set(payload).then(() => {
    // ✅ init played global untuk game baru
      gamePlayedRef.child(newRef.key).set({
      value: 250,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  });
}
op.then(() => {
  toastSuccess("Game list berjaya disimpan ✅");
  closeGameListModalInternal();
}).catch((err) => {
  console.error("Gagal simpan game list:", err);
  toastError("Gagal simpan game list. Cek console.", { duration: 4500 });
});
    });
  }

  function renderGameListAdmin(snapshot){
    if (!gameListAdminListEl) return;

    const data = snapshot.val() || {};
    gameListAdminListEl.innerHTML = "";

    const entries = Object.entries(data);
    if (!entries.length) {
      gameListAdminListEl.innerHTML =
        '<p class="text-muted small">Belum ada game list. Tekan "Tambah Game".</p>';
      return;
    }

    entries.forEach(([key, g]) => {
      const gameName = g?.gameName || "(No name)";
      const imageUrl = g?.imageUrl || "";
      const playUrl  = g?.playUrl  || "";

      const item = document.createElement("div");
      item.className = "admin-card-item";

      const thumbWrap = document.createElement("div");
      thumbWrap.style.display = "flex";
      thumbWrap.style.alignItems = "center";

      const thumb = document.createElement("img");
      thumb.src = imageUrl || "https://i.imgur.com/AM4LUPK.png";
      thumb.alt = gameName;
      thumb.style.maxWidth = "140px";
      thumb.style.borderRadius = "10px";
      thumb.style.objectFit = "cover";
      thumbWrap.appendChild(thumb);

      const info = document.createElement("div");
      info.className = "admin-card-info";

      const titleEl = document.createElement("div");
      titleEl.className = "admin-card-title";
      titleEl.textContent = gameName;

      const sub = document.createElement("div");
      sub.className = "admin-card-sub";
      const pm = Number(g?.playedMax ?? 398);
      sub.textContent = `PlayNow: ${playUrl || "-"} • Max Played: ${(isFinite(pm) && pm > 0) ? Math.floor(pm) : 398}`;

      info.appendChild(titleEl);
      info.appendChild(sub);

      const controls = document.createElement("div");
      controls.className = "switch-wrap";

      const activeLabel = document.createElement("span");
      activeLabel.className = "switch-label";
      activeLabel.textContent = "Aktif";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "toggle";
      toggle.checked = g?.enabled !== false;
      toggle.addEventListener("change", () => {
        gameListRef.child(key).update({ enabled: toggle.checked });
      });

      const editBtn = document.createElement("button");
      editBtn.className = "btn secondary";
      editBtn.style.fontSize = "0.7rem";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openGameListEditModal(key, g || {}));

      const delBtn = document.createElement("button");
      delBtn.className = "btn secondary";
      delBtn.style.fontSize = "0.7rem";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        if (confirm(`Hapus game "${gameName}"?`)) {
          gameListRef.child(key).remove();
          gamePlayedRef.child(key).remove();
        }
      });

      controls.appendChild(activeLabel);
      controls.appendChild(toggle);
      controls.appendChild(editBtn);
      controls.appendChild(delBtn);

      item.appendChild(thumbWrap);
      item.appendChild(info);
      item.appendChild(controls);

      gameListAdminListEl.appendChild(item);
    });
  }

  if (gameListAdminListEl) {
    gameListRef.on("value", renderGameListAdmin);
  }

  // ==================================================
  // ============  PROMO BANNER / FREE CREDIT =========
  // ==================================================
  function resetPromoForm() {
    if (!promoTitleInput || !promoCaptionInput || !promoImageInput || !promoTargetInput) return;
    promoTitleInput.value   = "";
    promoCaptionInput.value = "";
    promoImageInput.value   = "";
  }

  function openPromoNewModal() {
    if (!promoModal) return;
    currentPromoKey = null;
    promoModalTitle.textContent = "Tambah Banner";
    resetPromoForm();
    promoModal.classList.add(MODAL_OPEN_CLASS);
  }

  function openPromoEditModal(key, data) {
    if (!promoModal) return;
    currentPromoKey = key;
    promoModalTitle.textContent = "Edit Banner";
    promoTitleInput.value   = data.title   || "";
    promoCaptionInput.value = data.caption || "";
    promoImageInput.value   = data.imageUrl  || "";
    promoTargetInput.value  = data.targetUrl || "";
    promoModal.classList.add(MODAL_OPEN_CLASS);
  }

  function closePromoModalInternal() {
    if (!promoModal) return;
    promoModal.classList.remove(MODAL_OPEN_CLASS);
    currentPromoKey = null;
  }

  window.openPromoNewModal = openPromoNewModal;
  window.closePromoModal   = closePromoModalInternal;

  if (promoModalSaveBtn) {
    promoModalSaveBtn.addEventListener("click", () => {
      const title     = (promoTitleInput.value   || "").trim();
      const caption   = (promoCaptionInput.value || "").trim();
      const imageUrl  = (promoImageInput.value   || "").trim();
      const targetUrl = (promoTargetInput.value  || "").trim();

      if (!imageUrl) {
        toastWarn("Please fill URL image first.");
        promoImageInput.focus();
        return;
      }
      if (!targetUrl) {
        toastWarn("Please fill Link Claimed.");
        promoTargetInput.focus();
        return;
      }

      const payload = {
        title,
        caption,
        imageUrl,
        targetUrl,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      if (currentPromoKey) {
        promosRef.child(currentPromoKey).update(payload)
          .then(() => {
            toastSuccess("Promo banner berjaya diupdate ✅");
            closePromoModalInternal();
          })
          .catch((err) => {
            console.error("Gagal update promo banner:", err);
            toastSuccess("Gagal update promo. Cek console.");
          });
      } else {
        promosRef.push().set({ ...payload, enabled: true })
          .then(() => {
            alert("Promo banner berjaya disimpan.");
            closePromoModalInternal();
          })
          .catch((err) => {
            console.error("Gagal simpan promo banner:", err);
            toastError("Gagal simpan promo. Cek console.", { duration: 4500 });
          });
      }
    });
  }

  function renderPromoList(snapshot) {
    if (!promoListEl) return;

    const data = snapshot.val() || {};
    promoListEl.innerHTML = "";

    const entries = Object.entries(data);
    if (!entries.length) {
      promoListEl.innerHTML =
        '<p class="text-muted small">Belum ada banner. Tekan "Tambah Banner".</p>';
      return;
    }

    entries.forEach(([key, promo]) => {
      const item = document.createElement("div");
      item.className = "admin-card-item";

      const thumbWrap = document.createElement("div");
      thumbWrap.style.display = "flex";
      thumbWrap.style.alignItems = "center";

      const thumb = document.createElement("img");
      thumb.src = promo.imageUrl || "";
      thumb.alt = promo.title || "";
      thumb.style.maxWidth = "140px";
      thumb.style.borderRadius = "10px";
      thumb.style.objectFit = "cover";

      thumbWrap.appendChild(thumb);

      const info = document.createElement("div");
      info.className = "admin-card-info";

      const titleEl = document.createElement("div");
      titleEl.className = "admin-card-title";
      titleEl.textContent = promo.title || "(Tanpa judul)";

      const sub = document.createElement("div");
      sub.className = "admin-card-sub";
      sub.textContent = promo.caption || promo.targetUrl || "";

      info.appendChild(titleEl);
      info.appendChild(sub);

      const controls = document.createElement("div");
      controls.className = "switch-wrap";

      const activeLabel = document.createElement("span");
      activeLabel.className = "switch-label";
      activeLabel.textContent = "Aktif";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "toggle";
      toggle.checked = promo.enabled !== false;
      toggle.addEventListener("change", () => {
        promosRef.child(key).update({ enabled: toggle.checked });
      });

      const editBtn = document.createElement("button");
      editBtn.className = "btn secondary";
      editBtn.style.fontSize = "0.7rem";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openPromoEditModal(key, promo));

      const delBtn = document.createElement("button");
      delBtn.className = "btn secondary";
      delBtn.style.fontSize = "0.7rem";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        if (confirm("Hapus banner ini?")) {
          promosRef.child(key).remove();
        }
      });

      controls.appendChild(activeLabel);
      controls.appendChild(toggle);
      controls.appendChild(editBtn);
      controls.appendChild(delBtn);

      item.appendChild(thumbWrap);
      item.appendChild(info);
      item.appendChild(controls);

      promoListEl.appendChild(item);
    });
  }

  promosRef.on("value", renderPromoList);

  // ==================================================
  // ============  PROMOTION BANNER BESAR =============
  // ==================================================

  function resetBigPromoForm() {
    if (!promoBigTitleInput || !promoBigCaptionInput || !promoBigImageInput || !promoBigTargetInput) return;
    promoBigTitleInput.value   = "";
    promoBigCaptionInput.value = "";
    promoBigImageInput.value   = "";
  }

  function openBigPromoNewModal() {
    if (!promoBigModal) return;
    currentPromoBigKey = null;
    promoBigModalTitle.textContent = "Tambah Promotion";
    resetBigPromoForm();
    promoBigModal.classList.add(MODAL_OPEN_CLASS);
  }

  function openBigPromoEditModal(key, data) {
    if (!promoBigModal) return;
    currentPromoBigKey = key;
    promoBigModalTitle.textContent = "Edit Promotion";

    promoBigTitleInput.value   = data.title    || "";
    promoBigCaptionInput.value = data.caption  || "";
    promoBigImageInput.value   = data.imageUrl || "";
    promoBigTargetInput.value  = data.targetUrl|| "";

    promoBigModal.classList.add(MODAL_OPEN_CLASS);
  }

  function closeBigPromoModalInternal() {
    if (!promoBigModal) return;
    promoBigModal.classList.remove(MODAL_OPEN_CLASS);
    currentPromoBigKey = null;
  }

  window.openBigPromoNewModal = openBigPromoNewModal;
  window.closeBigPromoModal   = closeBigPromoModalInternal;

  if (promoBigModalSaveBtn) {
    promoBigModalSaveBtn.addEventListener("click", () => {
      const title     = (promoBigTitleInput.value   || "").trim();
      const caption   = (promoBigCaptionInput.value || "").trim();
      const imageUrl  = (promoBigImageInput.value   || "").trim();
      const targetUrl = (promoBigTargetInput.value  || "").trim();

      if (!imageUrl) {
        alert("Isi URL gambar dulu bro.");
        promoBigImageInput.focus();
        return;
      }
      if (!targetUrl) {
        alert("Isi Link Tab Baru dulu bro.");
        promoBigTargetInput.focus();
        return;
      }

      const payload = {
        title,
        caption,
        imageUrl,
        targetUrl,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      if (currentPromoBigKey) {
        promoBigRef.child(currentPromoBigKey).update(payload)
          .then(() => {
            alert("Promotion banner berjaya diupdate.");
            closeBigPromoModalInternal();
          })
          .catch((err) => {
            console.error("Gagal update promotion banner:", err);
            alert("Gagal update promotion. Cek console.");
          });
      } else {
        promoBigRef.push().set({
          ...payload,
          enabled: true
        })
          .then(() => {
            alert("Promotion banner berjaya disimpan.");
            closeBigPromoModalInternal();
          })
          .catch((err) => {
            console.error("Gagal simpan promotion banner:", err);
            alert("Gagal simpan promotion. Cek console.");
          });
      }
    });
  }

  function renderBigPromoList(snapshot) {
    if (!promoBigListEl) return;

    const data = snapshot.val() || {};
    promoBigListEl.innerHTML = "";

    const entries = Object.entries(data);

    if (!entries.length) {
      promoBigListEl.innerHTML =
        '<p class="text-muted small">Belum ada promotion. Tekan "Tambah Promotion".</p>';
      return;
    }

    entries.forEach(([key, promo]) => {
      const item = document.createElement("div");
      item.className = "admin-card-item";

      const thumbWrap = document.createElement("div");
      thumbWrap.style.display = "flex";
      thumbWrap.style.alignItems = "center";

      const thumb = document.createElement("img");
      thumb.src = promo.imageUrl || "";
      thumb.alt = promo.title || "";
      thumb.style.maxWidth = "160px";
      thumb.style.borderRadius = "10px";
      thumb.style.objectFit = "cover";
      thumbWrap.appendChild(thumb);

      const info = document.createElement("div");
      info.className = "admin-card-info";

      const titleEl = document.createElement("div");
      titleEl.className = "admin-card-title";
      titleEl.textContent = promo.title || "(Tanpa judul)";

      const sub = document.createElement("div");
      sub.className = "admin-card-sub";
      sub.textContent = promo.caption || promo.targetUrl || "";

      info.appendChild(titleEl);
      info.appendChild(sub);

      const controls = document.createElement("div");
      controls.className = "switch-wrap";

      const activeLabel = document.createElement("span");
      activeLabel.className = "switch-label";
      activeLabel.textContent = "Aktif";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "toggle";
      toggle.checked = promo.enabled !== false;
      toggle.addEventListener("change", () => {
        promoBigRef.child(key).update({ enabled: toggle.checked });
      });

      const editBtn = document.createElement("button");
      editBtn.className = "btn secondary";
      editBtn.style.fontSize = "0.7rem";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openBigPromoEditModal(key, promo));

      const delBtn = document.createElement("button");
      delBtn.className = "btn secondary";
      delBtn.style.fontSize = "0.7rem";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        if (confirm("Hapus promotion ini?")) {
          promoBigRef.child(key).remove();
        }
      });

      controls.appendChild(activeLabel);
      controls.appendChild(toggle);
      controls.appendChild(editBtn);
      controls.appendChild(delBtn);

      item.appendChild(thumbWrap);
      item.appendChild(info);
      item.appendChild(controls);

      promoBigListEl.appendChild(item);
    });
  }

  promoBigRef.on("value", renderBigPromoList);

  // ==================================================
  // ===============  PARTNERSHIP ADMIN  ===============
  // ==================================================

  function resetPartnerForm() {
    if (!partnerNameInput || !partnerRatingInput || !partnerLogoInput || !partnerJoinInput) return;
    partnerNameInput.value   = "";
    partnerRatingInput.value = "";
    partnerLogoInput.value   = "";
    partnerJoinInput.value   = "";
    if (partnerChannelInput) partnerChannelInput.value = "";
  }

  function openPartnerNewModal() {
    if (!partnerModal) return;
    currentPartnerKey = null;
    partnerModalTitle.textContent = "Tambah Partnership";
    resetPartnerForm();
    partnerModal.classList.add(MODAL_OPEN_CLASS);
  }

  function openPartnerEditModal(key, data) {
    if (!partnerModal) return;
    currentPartnerKey = key;
    partnerModalTitle.textContent = "Edit Partnership";

    partnerNameInput.value   = data.name    || "";
    partnerRatingInput.value = data.rating  != null ? data.rating : "";
    partnerLogoInput.value   = data.logoUrl || "";
    partnerJoinInput.value   = data.joinUrl || "";
    if (partnerChannelInput) partnerChannelInput.value = data.channelUrl || data.channelLink || ""; // ✅ NEW

    partnerModal.classList.add(MODAL_OPEN_CLASS);
  }

  function closePartnerModalInternal() {
    if (!partnerModal) return;
    partnerModal.classList.remove(MODAL_OPEN_CLASS);
    currentPartnerKey = null;
  }

  window.openPartnerNewModal = openPartnerNewModal;
  window.closePartnerModal   = closePartnerModalInternal;

  if (partnerModalSaveBtn) {
    partnerModalSaveBtn.addEventListener("click", () => {
      const name    = (partnerNameInput.value   || "").trim();
      const ratingS = (partnerRatingInput.value || "").trim();
      const logoUrl = (partnerLogoInput.value   || "").trim();
      const joinUrl = (partnerJoinInput.value   || "").trim();
      const channelUrl = (partnerChannelInput?.value || "").trim(); // ✅ NEW

      if (!logoUrl) {
        alert("Isi URL logo dulu bro.");
        partnerLogoInput.focus();
        return;
      }
      if (!joinUrl) {
        alert("Isi Link Join Now dulu bro.");
        partnerJoinInput.focus();
        return;
      }

      let rating = parseFloat(ratingS);
      if (!isFinite(rating)) rating = 0;

      const payload = {
        name,
        rating,
        logoUrl,
        joinUrl,
        channelUrl,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      if (currentPartnerKey) {
        partnersRef.child(currentPartnerKey).update(payload)
          .then(() => {
            alert("Partnership berjaya diupdate.");
            closePartnerModalInternal();
          })
          .catch((err) => {
            console.error("Gagal update partnership:", err);
            alert("Gagal update partnership. Cek console.");
          });
      } else {
        partnersRef.push().set({
          ...payload,
          enabled: true
        })
          .then(() => {
            alert("Partnership berjaya disimpan.");
            closePartnerModalInternal();
          })
          .catch((err) => {
            console.error("Gagal simpan partnership:", err);
            alert("Gagal simpan partnership. Cek console.");
          });
      }
    });
  }

  function renderPartnerList(snapshot) {
    if (!partnerListEl) return;

    const data = snapshot.val() || {};
    partnerListEl.innerHTML = "";

    const entries = Object.entries(data);
    if (!entries.length) {
      partnerListEl.innerHTML =
        '<p class="text-muted small">Belum ada partnership. Tekan "Tambah Partnership".</p>';
      return;
    }

    entries.forEach(([key, p]) => {
      const item = document.createElement("div");
      item.className = "admin-card-item";

      const thumbWrap = document.createElement("div");
      thumbWrap.style.display = "flex";
      thumbWrap.style.alignItems = "center";

      const thumb = document.createElement("img");
      thumb.src = p.logoUrl || "";
      thumb.alt = p.name || "";
      thumb.style.maxWidth = "140px";
      thumb.style.borderRadius = "10px";
      thumb.style.objectFit = "cover";

      thumbWrap.appendChild(thumb);

      const info = document.createElement("div");
      info.className = "admin-card-info";

      const titleEl = document.createElement("div");
      titleEl.className = "admin-card-title";
      titleEl.textContent = p.name || "(Tanpa nama)";

      const sub = document.createElement("div");
      sub.className = "admin-card-sub";
      const ratingText = p.rating != null
        ? `${Number(p.rating).toFixed(1)} ★`
        : "No rating";
      const chText = p.channelUrl || p.channelLink || "";
      sub.textContent = `${ratingText} • Join: ${p.joinUrl || ""}${chText ? " • Channel: " + chText : ""}`;

      info.appendChild(titleEl);
      info.appendChild(sub);

      const controls = document.createElement("div");
      controls.className = "switch-wrap";

      const activeLabel = document.createElement("span");
      activeLabel.className = "switch-label";
      activeLabel.textContent = "Aktif";

      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className = "toggle";
      toggle.checked = p.enabled !== false;
      toggle.addEventListener("change", () => {
        partnersRef.child(key).update({ enabled: toggle.checked });
      });

      const editBtn = document.createElement("button");
      editBtn.className = "btn secondary";
      editBtn.style.fontSize = "0.7rem";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openPartnerEditModal(key, p));

      const delBtn = document.createElement("button");
      delBtn.className = "btn secondary";
      delBtn.style.fontSize = "0.7rem";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        if (confirm("Hapus partnership ini?")) {
          partnersRef.child(key).remove();
        }
      });

      controls.appendChild(activeLabel);
      controls.appendChild(toggle);
      controls.appendChild(editBtn);
      controls.appendChild(delBtn);

      item.appendChild(thumbWrap);
      item.appendChild(info);
      item.appendChild(controls);

      partnerListEl.appendChild(item);
    });
  }

  partnersRef.on("value", renderPartnerList);
const viewButtons = document.querySelectorAll("[data-view]");
const sections = document.querySelectorAll(".admin-section");

function hideAllSections(){
  sections.forEach(sec => sec.classList.remove("show"));
}

viewButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetKey = btn.dataset.view;

    // kalau tekan button sama lagi → close (balik kosong)
    const targetSection = document.querySelector(`.admin-section[data-section="${targetKey}"]`);
    const isAlreadyOpen = targetSection && targetSection.classList.contains("show");

    hideAllSections();

    if (targetSection && !isAlreadyOpen) {
      targetSection.classList.add("show");
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
});
