// js/tips-page.js

document.addEventListener('DOMContentLoaded', () => {
  const tipsGrid = document.getElementById('tipsCardsGrid');
  const tipCardsRef = db.ref('tipCards');

  // Simpan state untuk tombol Back (per card)
  const cardStates = {}; // { cardId: { currentTips: string, previousTips: string|null } }

  function randPercent(min = 70, max = 100) {
    const diff = max - min + 1;
    return Math.floor(Math.random() * diff) + min;
  }

  function pickRandomGames(games, maxCount = 3) {
    if (!Array.isArray(games) || games.length === 0) return [];

    const copy = games.slice();
    // shuffle Fisher-Yates
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    const count = Math.min(maxCount, copy.length);
    return copy.slice(0, count);
  }

  function generateTipsText(cardName, games) {
    const chosen = pickRandomGames(games, 3);
    if (chosen.length === 0) {
      return `${cardName.toUpperCase()}\n==========\n(no game configured)`;
    }

    const lines = [];
    lines.push(cardName.toUpperCase());
    lines.push('==========');

    chosen.forEach((game, idx) => {
      const pct = randPercent(70, 100);
      lines.push(`${idx + 1}. ${game} ${pct}%`);
    });

    return lines.join('\n');
  }

  function renderCards(cardsObj) {
    tipsGrid.innerHTML = '';

    if (!cardsObj) {
      tipsGrid.innerHTML = '<p class="text-muted small">Belum ada card. Silakan minta admin buat di halaman Admin.</p>';
      return;
    }

    Object.entries(cardsObj).forEach(([id, card]) => {
      if (!card.active) return; // hanya card ON

      const games = Array.isArray(card.games) ? card.games : [];
      const name = card.name || '(NO NAME)';

      const cardEl = document.createElement('article');
      cardEl.className = 'tip-card';
      cardEl.dataset.id = id;

      // header
      const header = document.createElement('div');
      header.className = 'tip-card-header';

      const title = document.createElement('div');
      title.className = 'tip-card-title';
      title.textContent = name;

      const pill = document.createElement('div');
      pill.className = 'tip-card-pill';
      pill.textContent = `${games.length} game`;

      header.appendChild(title);
      header.appendChild(pill);

      // output
      const output = document.createElement('pre');
      output.className = 'tip-output';
      output.textContent = 'Tekan GENERATE untuk lihat tips.';

      // actions
      const actions = document.createElement('div');
      actions.className = 'tip-actions';

      const backBtn = document.createElement('button');
      backBtn.className = 'btn secondary';
      backBtn.textContent = '⮌ Back';
      backBtn.disabled = true;

      const genBtn = document.createElement('button');
      genBtn.className = 'btn primary';
      genBtn.textContent = '🎲 Generate';

      // init state
      cardStates[id] = {
        currentTips: '',
        previousTips: null
      };

      genBtn.addEventListener('click', () => {
        const state = cardStates[id];
        if (!state) return;

        const newTips = generateTipsText(name, games);

        if (state.currentTips) {
          state.previousTips = state.currentTips;
        }
        state.currentTips = newTips;
        output.textContent = newTips;

        backBtn.disabled = !state.previousTips;
      });

      backBtn.addEventListener('click', () => {
        const state = cardStates[id];
        if (!state || !state.previousTips) return;

        // tukar current dengan previous
        const temp = state.currentTips;
        state.currentTips = state.previousTips;
        state.previousTips = temp;

        output.textContent = state.currentTips;

        backBtn.disabled = !state.previousTips;
      });

      actions.appendChild(backBtn);
      actions.appendChild(genBtn);

      cardEl.appendChild(header);
      cardEl.appendChild(output);
      cardEl.appendChild(actions);

      tipsGrid.appendChild(cardEl);
    });

    // Kalau setelah filter tidak ada card aktif
    if (!tipsGrid.hasChildNodes()) {
      tipsGrid.innerHTML = '<p class="text-muted small">Tidak ada card aktif. Silakan minta admin ON-kan di halaman Admin.</p>';
    }
  }

  // Listen ke Firebase (real-time)
  tipCardsRef.on('value', snapshot => {
    const val = snapshot.val();
    renderCards(val);
  });
});
