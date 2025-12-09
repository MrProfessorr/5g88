// admin/js/admin-page.js

document.addEventListener("DOMContentLoaded", () => {
  const platformInput     = document.getElementById("platformName");
  const gameListBox       = document.getElementById("gameListBox");
  const saveBtn           = document.getElementById("saveCardBtn");
  const cardsListEl       = document.getElementById("cardsList");

  // Elemen modal game list
  const gamesModal        = document.getElementById("gamesModal");
  const gamesModalTitle   = document.getElementById("gamesModalTitle");
  const gamesModalBox     = document.getElementById("gamesModalBox");
  const gamesModalEditBtn = document.getElementById("gamesModalEditBtn");
  const gamesModalSaveBtn = document.getElementById("gamesModalSaveBtn");

  // Elemen promo
  const promoListEl       = document.getElementById("promoList");
  const promoModal        = document.getElementById("promoModal");
  const promoModalTitle   = document.getElementById("promoModalTitle");
  const promoTitleInput   = document.getElementById("promoTitle");
  const promoImageInput   = document.getElementById("promoImageUrl");
  const promoTargetInput  = document.getElementById("promoTargetUrl");
  const promoSaveBtn      = document.getElementById("promoModalSaveBtn");

  let currentEditKey  = null; // card tips yang sedang di-edit di modal games
  let currentPromoKey = null; // promo yang sedang di-edit

  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  const cardsRef  = db.ref("tips_cards");
  const promosRef = db.ref("promo_banners");

  // ========= Helpers umum =========
  const makeKey = (name) =>
    (name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  function setupMultiInputKey(el) {
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" && e.ctrlKey) || (e.key === "Enter" && e.metaKey)) {
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
      .split(/[\n\r,;]+/)
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
        platformInput.value    = "";
        gameListBox.textContent = "";
      })
      .catch((err) => {
        console.error("Gagal simpan card:", err);
        alert("Gagal simpan ke Firebase. Cek console.");
      });
  });

  // ========= MODAL VIEW / EDIT DAFTAR GAME =========
  function openGamesModal(key, card) {
    if (!gamesModal || !gamesModalBox) return;

    currentEditKey = key;
    gamesModalTitle.textContent = `Daftar Game • ${card.platformName || key}`;
    setBoxFromGames(gamesModalBox, card.games || []);

    gamesModalBox.setAttribute("contenteditable", "false");
    gamesModalEditBtn.style.display = "inline-flex";
    gamesModalSaveBtn.style.display = "none";

    gamesModal.classList.add("open");
  }

  function closeGamesModalInternal() {
    if (!gamesModal) return;
    gamesModal.classList.remove("open");
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
        card.enabled ? "AKTIF" : "OFF"
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
      toggle.checked = !!card.enabled;
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
      delBtn.textContent = "✖ Hapus";
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

  // ========= PROMO BANNERS (FREE CREDIT) =========
  function openPromoModal(data, key) {
    currentPromoKey = key || null;
    promoModalTitle.textContent = key ? "Edit Promo Banner" : "Tambah Promo Banner";

    promoTitleInput.value  = (data && data.title)     || "";
    promoImageInput.value  = (data && data.imageUrl)  || "";
    promoTargetInput.value = (data && data.targetUrl) || "";

    promoModal.classList.add("open");
  }

  function closePromoModalInternal() {
    promoModal.classList.remove("open");
    currentPromoKey = null;
  }

  window.openPromoNewModal = function () {
    openPromoModal(null, null);
  };
  window.closePromoModal = closePromoModalInternal;

  if (promoSaveBtn) {
    promoSaveBtn.addEventListener("click", () => {
      const title     = promoTitleInput.value.trim();
      const imageUrl  = promoImageInput.value.trim();
      const targetUrl = promoTargetInput.value.trim();

      if (!imageUrl) {
        alert("URL gambar wajib diisi.");
        promoImageInput.focus();
        return;
      }
      if (!targetUrl) {
        alert("Link claim wajib diisi.");
        promoTargetInput.focus();
        return;
      }

      const payload = {
        title,
        imageUrl,
        targetUrl,
        buttonText: "CLAIM",
        enabled: true,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      let op;
      if (currentPromoKey) {
        op = promosRef.child(currentPromoKey).update(payload);
      } else {
        // pakai push untuk id unik
        const ref = promosRef.push();
        payload.order = Date.now();
        op = ref.set(payload);
      }

      op.then(() => {
        closePromoModalInternal();
      }).catch((err) => {
        console.error("Gagal simpan promo:", err);
        alert("Gagal simpan promo. Cek console.");
      });
    });
  }

  function renderPromoList(snapshot) {
    if (!promoListEl) return;

    const data = snapshot.val() || {};
    promoListEl.innerHTML = "";

    const entries = Object.entries(data);
    if (entries.length === 0) {
      promoListEl.innerHTML =
        '<p class="text-muted small">Belum ada promo banner. Tekan "Tambah Banner".</p>';
      return;
    }

    entries
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((p) => {
        const item = document.createElement("div");
        item.className = "admin-card-item";

        const info = document.createElement("div");
        info.className = "admin-card-info";

        const title = document.createElement("div");
        title.className = "admin-card-title";
        title.textContent = p.title || "Promo Banner";

        const sub = document.createElement("div");
        sub.className = "admin-card-sub";
        sub.textContent = (p.enabled === false ? "OFF" : "AKTIF") +
          " • " + (p.imageUrl || "").slice(0, 40);

        info.appendChild(title);
        info.appendChild(sub);

        const controls = document.createElement("div");
        controls.className = "switch-wrap";

        const toggle = document.createElement("input");
        toggle.type = "checkbox";
        toggle.className = "toggle";
        toggle.checked = p.enabled !== false;
        toggle.addEventListener("change", () => {
          promosRef.child(p.key).update({ enabled: toggle.checked });
        });

        const editBtn = document.createElement("button");
        editBtn.className = "btn ghost small";
        editBtn.style.fontSize = "0.7rem";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
          openPromoModal(p, p.key);
        });

        const delBtn = document.createElement("button");
        delBtn.className = "btn secondary";
        delBtn.style.fontSize = "0.7rem";
        delBtn.textContent = "✖ Hapus";
        delBtn.addEventListener("click", () => {
          if (confirm(`Hapus promo "${p.title || p.key}" ?`)) {
            promosRef.child(p.key).remove();
          }
        });

        controls.appendChild(toggle);
        controls.appendChild(editBtn);
        controls.appendChild(delBtn);

        item.appendChild(info);
        item.appendChild(controls);

        promoListEl.appendChild(item);
      });
  }

  promosRef.on("value", renderPromoList);
});
