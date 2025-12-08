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

  // Semua card disimpan di path ini
  const cardsRef = db.ref("tips_cards");

  // Buat key dari nama platform: "MEGA888" -> "mega888"
  const makeKey = (name) =>
    (name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  // ====== SAVE CARD ======
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

  // ====== RENDER LIST CARD DI ADMIN ======
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

      // Switch enable
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

      // Tombol delete (opsional)
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
      controls.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(controls);

      cardsListEl.appendChild(item);
    });
  }

  cardsRef.on("value", renderCardsList);
});
