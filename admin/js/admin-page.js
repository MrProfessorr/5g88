// admin/js/admin-page.js

document.addEventListener("DOMContentLoaded", () => {
  const MODAL_OPEN_CLASS = "show";

  // ===== ELEMENT CARD PLATFORM =====
  const platformInput = document.getElementById("platformName");
  const gameListBox   = document.getElementById("gameListBox");
  const saveBtn       = document.getElementById("saveCardBtn");
  const cardsListEl   = document.getElementById("cardsList");

  // Modal VIEW / EDIT list game
  const gamesModal        = document.getElementById("gamesModal");
  const gamesModalTitle   = document.getElementById("gamesModalTitle");
  const gamesModalBox     = document.getElementById("gamesModalBox");
  const gamesModalEditBtn = document.getElementById("gamesModalEditBtn");
  const gamesModalSaveBtn = document.getElementById("gamesModalSaveBtn");
  let currentEditKey      = null; // card yang sedang di-edit di modal

  // ===== NAV TABS TOGGLE =====
  const navHomeToggle    = document.getElementById("navHomeToggle");
  const navHotToggle     = document.getElementById("navHotToggle");
  const navPromoToggle   = document.getElementById("navPromoToggle");
  const navPartnerToggle = document.getElementById("navPartnerToggle");

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
  const partnerModalSaveBtn = document.getElementById("partnerModalSaveBtn");
  let currentPartnerKey     = null;

  // ===== FIREBASE CHECK =====
  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  const cardsRef    = db.ref("tips_cards");
  const promosRef   = db.ref("promo_banners");   // free credit kecil
  const promoBigRef = db.ref("promotions");      // promotion besar (tab PROMOTION)
  const partnersRef = db.ref("partnerships");    // partnership untuk tab PARTNERSHIP
  const navTabsRef  = db.ref("nav_tabs");        // setting tombol nav

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

  // ========= SAVE CARD BARU =========
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const platformName = platformInput.value.trim();
      const games        = getGamesFromBox(gameListBox);

      if (!platformName) {
        alert("Isi nama platform dulu bro.");
        platformInput.focus();
        return;
      }
      if (games.length === 0) {
        alert("Isi list nama game (min 1).");
        gameListBox.focus();
        return;
      }

      const key = makeKey(platformName);
      const payload = {
        platformName,
        games,
        enabled: true,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      cardsRef
        .child(key)
        .set(payload)
        .then(() => {
          alert("Card berjaya disimpan. Cek di bawah & di halaman user.");
          platformInput.value = "";
          gameListBox.textContent = "";
        })
        .catch((err) => {
          console.error("Gagal simpan card:", err);
          alert("Gagal simpan ke Firebase. Cek console.");
        });
    });
  }

  // ========= MODAL VIEW / EDIT DAFTAR GAME =========
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
      cardsRef
        .child(currentEditKey)
        .update({
          games,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        })
        .then(() => {
          alert("List game berjaya diupdate.");
          closeGamesModalInternal();
        })
        .catch((err) => {
          console.error("Gagal update list games:", err);
          alert("Gagal update. Cek console.");
        });
    });
  }

  // ========= RENDER LIST CARD DI ADMIN =========
  function renderCardsList(snapshot) {
    const data = snapshot.val() || {};
    cardsListEl.innerHTML = "";

    const entries = Object.entries(data);

    if (entries.length === 0) {
      cardsListEl.innerHTML =
        '<p class="text-muted small">Belum ada card. Buat card baru di atas.</p>';
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
  // ============  PROMO BANNER / FREE CREDIT =========
  // ==================================================

  function resetPromoForm() {
    if (!promoTitleInput || !promoCaptionInput || !promoImageInput || !promoTargetInput) return;
    promoTitleInput.value   = "";
    promoCaptionInput.value = "";
    promoImageInput.value   = "";
    promoTargetInput.value  = "";
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
        alert("Isi URL gambar dulu bro.");
        promoImageInput.focus();
        return;
      }
      if (!targetUrl) {
        alert("Isi Link Claim dulu bro.");
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
        // update saja, biar properti enabled tidak berubah
        promosRef.child(currentPromoKey).update(payload)
          .then(() => {
            alert("Promo banner berjaya diupdate.");
            closePromoModalInternal();
          })
          .catch((err) => {
            console.error("Gagal update promo banner:", err);
            alert("Gagal update promo. Cek console.");
          });
      } else {
        // record baru -> enabled: true
        promosRef.push().set({
          ...payload,
          enabled: true
        })
          .then(() => {
            alert("Promo banner berjaya disimpan.");
            closePromoModalInternal();
          })
          .catch((err) => {
            console.error("Gagal simpan promo banner:", err);
            alert("Gagal simpan promo. Cek console.");
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
      delBtn.textContent = "✖ Hapus";
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
    promoBigTargetInput.value  = "";
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
      delBtn.textContent = "✖ Hapus";
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
      sub.textContent = `${ratingText} • ${p.joinUrl || ""}`;

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
      delBtn.textContent = "✖ Hapus";
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
});
