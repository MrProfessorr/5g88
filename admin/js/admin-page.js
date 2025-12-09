// admin/js/admin-page.js

document.addEventListener("DOMContentLoaded", () => {
  const platformInput = document.getElementById("platformName");
  const gameListInput = document.getElementById("gameList");
  const saveBtn       = document.getElementById("saveCardBtn");
  const cardsListEl   = document.getElementById("cardsList");

  if (!window.firebase || !window.db) {
    console.error("Firebase belum siap. Cek script firebase di HTML.");
    return;
  }

  // ====== REF FIREBASE ======
  const cardsRef = db.ref("tips_cards");

  // ====== ELEMEN MODAL EDIT GAME LIST ======
  const gamesModal        = document.getElementById("gamesModal");
  const gamesModalTitle   = document.getElementById("gamesModalTitle");
  const gamesModalTextarea= document.getElementById("gamesModalTextarea");
  const gamesModalEditBtn = document.getElementById("gamesModalEditBtn");
  const gamesModalSaveBtn = document.getElementById("gamesModalSaveBtn");

  let currentEditKey  = null;
  let currentEditCard = null;

  // Helper: buat key dari nama platform: "MEGA888" -> "mega888"
  const makeKey = (name) =>
    (name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  // =========================================================
  // SAVE CARD BARU
  // =========================================================
  saveBtn.addEventListener("click", () => {
    const platformName = platformInput.value.trim();
    const rawGames = gameListInput.value.split("\n");

    const games = rawGames
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    if (!platformName) {
      alert("Isi nama platform dulu bro.");
      platformInput.focus();
      return;
    }
    if (games.length === 0) {
      alert("Isi list nama game (min 1 baris).");
      gameListInput.focus();
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
        gameListInput.value = "";
      })
      .catch((err) => {
        console.error("Gagal simpan card:", err);
        alert("Gagal simpan ke Firebase. Cek console.");
      });
  });

  // =========================================================
  // MODAL: OPEN / CLOSE
  // =========================================================
  function openGamesModal(key, card) {
    currentEditKey  = key;
    currentEditCard = card;

    const platformName = card.platformName || key;

    gamesModalTitle.textContent = `Daftar Game • ${platformName}`;
    gamesModalTextarea.value = (card.games || []).join("\n");
    gamesModalTextarea.disabled = true;

    // mode awal: hanya Edit yang kelihatan
    gamesModalEditBtn.style.display = "inline-flex";
    gamesModalSaveBtn.style.display = "none";

    if (gamesModal) {
      gamesModal.classList.add("show");
    }
  }

  function closeGamesModal() {
    if (gamesModal) {
      gamesModal.classList.remove("show");
    }
    currentEditKey  = null;
    currentEditCard = null;
  }

  // supaya bisa dipanggil dari HTML (backdrop & tombol ✕)
  window.closeGamesModal = closeGamesModal;

  // Tombol EDIT di modal
  if (gamesModalEditBtn) {
    gamesModalEditBtn.addEventListener("click", () => {
      gamesModalTextarea.disabled = false;
      gamesModalTextarea.focus();

      gamesModalEditBtn.style.display = "none";
      gamesModalSaveBtn.style.display = "inline-flex";
    });
  }

  // Tombol SAVE di modal
  if (gamesModalSaveBtn) {
    gamesModalSaveBtn.addEventListener("click", () => {
      if (!currentEditKey) return;

      const lines = gamesModalTextarea.value
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      cardsRef
        .child(currentEditKey)
        .update({ games: lines, updatedAt: firebase.database.ServerValue.TIMESTAMP })
        .then(() => {
          alert("List game berjaya dikemas kini.");
          closeGamesModal();
        })
        .catch((err) => {
          console.error("Gagal update games:", err);
          alert("Gagal simpan perubahan. Cek console.");
        });
    });
  }

  // =========================================================
  // RENDER LIST CARD DI ADMIN
  // =========================================================
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

      // ---- Kiri: info card + Views ----
      const info = document.createElement("div");
      info.className = "admin-card-info";

      const title = document.createElement("div");
      title.className = "admin-card-title";
      title.textContent = card.platformName || key;

      const sub = document.createElement("div");
      sub.className = "admin-card-sub";

      const totalGame = card.games?.length || 0;
      const statusTxt = card.enabled === false ? "OFF" : "AKTIF";

      const stats = document.createElement("span");
      stats.textContent = `${totalGame} game • status: ${statusTxt}`;

      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = "btn ghost view-small";
      viewBtn.textContent = "Views";
      viewBtn.addEventListener("click", () => {
        openGamesModal(key, card);
      });

      sub.appendChild(stats);
      sub.appendChild(viewBtn);

      info.appendChild(title);
      info.appendChild(sub);

      // ---- Kanan: switch Aktif + Hapus ----
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

      const delBtn = document.createElement("button");
      delBtn.className = "btn secondary";
      delBtn.style.fontSize = "0.7rem";
      delBtn.textContent = "✖ Hapus";
      delBtn.addEventListener("click", () => {
        if (confirm(`Hapus card "${card.platformName || key}"?`)) {
          cardsRef.child(key).remove();
        }
      });

      controls.appendChild(label);
      controls.appendChild(toggle);
      controls.appendChild(delBtn);

      // gabungkan ke item
      item.appendChild(info);
      item.appendChild(controls);

      cardsListEl.appendChild(item);
    });
  }

  // listen realtime
  cardsRef.on("value", renderCardsList);
});
