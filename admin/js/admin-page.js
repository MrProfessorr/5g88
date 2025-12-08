// js/admin-page.js

document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('platformName');
  const listInput = document.getElementById('gameList');
  const saveBtn   = document.getElementById('saveCardBtn');
  const cardsList = document.getElementById('cardsList');

  const tipCardsRef = db.ref('tipCards');

  // Simpan card baru
  saveBtn.addEventListener('click', () => {
    const name = (nameInput.value || '').trim();
    const listRaw = listInput.value || '';

    if (!name) {
      alert('Nama platform tidak boleh kosong.');
      return;
    }

    // pecah text area jadi array (per baris), buang kosong
    const games = listRaw
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (games.length === 0) {
      alert('Masukkan minimal 1 nama game.');
      return;
    }

    const payload = {
      name,
      games,
      active: true,
      createdAt: Date.now()
    };

    tipCardsRef.push(payload)
      .then(() => {
        nameInput.value = '';
        listInput.value = '';
        alert('Card berhasil disimpan.');
      })
      .catch(err => {
        console.error(err);
        alert('Gagal simpan card: ' + err.message);
      });
  });

  // Render list card admin (real-time)
  tipCardsRef.on('value', snapshot => {
    cardsList.innerHTML = '';
    const val = snapshot.val();
    if (!val) {
      cardsList.innerHTML = '<p class="text-muted small">Belum ada card. Silakan tambah.</p>';
      return;
    }

    Object.entries(val).forEach(([id, card]) => {
      const item = document.createElement('div');
      item.className = 'admin-card-item';

      const info = document.createElement('div');
      info.className = 'admin-card-info';
      const title = document.createElement('div');
      title.className = 'admin-card-title';
      title.textContent = card.name || '(tanpa nama)';

      const sub = document.createElement('div');
      sub.className = 'admin-card-sub';
      const count = Array.isArray(card.games) ? card.games.length : 0;
      sub.textContent = `Games: ${count} • Status: ${card.active ? 'ON' : 'OFF'}`;

      info.appendChild(title);
      info.appendChild(sub);

      const switchWrap = document.createElement('div');
      switchWrap.className = 'switch-wrap';

      const label = document.createElement('span');
      label.className = 'switch-label';
      label.textContent = 'Tampil:';

      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.className = 'toggle';
      toggle.checked = !!card.active;

      toggle.addEventListener('change', () => {
        tipCardsRef.child(id).child('active').set(toggle.checked);
      });

      switchWrap.appendChild(label);
      switchWrap.appendChild(toggle);

      item.appendChild(info);
      item.appendChild(switchWrap);

      cardsList.appendChild(item);
    });
  });
});
