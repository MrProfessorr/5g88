// admin/js/admin-page.js

document.addEventListener("DOMContentLoaded", () => {
  const platformInput     = document.getElementById("platformName");
  const gameListBox       = document.getElementById("gameListBox");
  const saveBtn           = document.getElementById("saveCardBtn");
  const cardsListEl       = document.getElementById("cardsList");

  // Elemen modal
  const gamesModal        = document.getElementById("gamesModal");
  const gamesModalTitle   = document.getElementById("gamesModalTitle");
  const gamesModalBox     = document.getElementById("gamesModalBox");
  const gamesModalEditBtn = document.getElementById("gamesModalEditBtn");
  const gamesModalSaveBtn = document.getElementById("gamesModalSaveBtn");

  let currentEditKey = null; // card yang sedang di-edit di modal

  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  const cardsRef = db.ref("tips_cards");

  // ========= Helpers =========

  // Bikin key dari nama platform
  const makeKey = (name) =>
    (name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  // Setup Ctrl+Enter di contenteditable
  function setupMultiInputKey(el) {
    if (!el) return;
    el.addEventListener("keydown", (e) => {
      // Ctrl+Enter / Cmd+Enter -> forced line break
      if ((e.key === "Enter" && e.ctrlKey) || (e.key === "Enter" && e.metaKey)) {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      }
      // Enter biasa tetap boleh (biar rasa textarea)
    });
  }

  setupMultiInputKey(gameListBox);
  setupMultiInputKey(gamesModalBox);

  // Parse text jadi array nama game
  function parseGamesText(raw) {
    if (!raw) return [];
    let text = String(raw).replace(/\u00A0/g, " ").trim();

    // Format array: 'AAA','BBB' atau "AAA","BBB"
    const quoted = text.match(/(['"])(.*?)\1/g);
    if (quoted && quoted.length) {
      return quoted
        .map((m) => m.slice(1, -1).trim())
        .filter(Boolean);
    }

    // Format biasa: newline / koma / titik koma
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
        platformInput.value = "";
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

    // mode view dulu
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

  // supaya onclick="closeGamesModal()" di HTML jalan
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

      // Tombol kecil Views
      const viewBtn = document.createElement("button");
      viewBtn.className = "btn ghost small";
      viewBtn.style.fontSize = "0.7rem";
      viewBtn.textContent = "Views";
      viewBtn.addEventListener("click", () => openGamesModal(key, card));

      // Tombol delete
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
});
