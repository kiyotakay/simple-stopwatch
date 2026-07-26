(() => {
  'use strict';

  const displayEl = document.getElementById('display');
  const toggleEl = document.getElementById('toggle');
  const secondaryEl = document.getElementById('secondary');
  const lapsEl = document.getElementById('laps');

  let running = false;
  let startedAt = 0;   // performance.now() の値（最後に開始した時刻）
  let accumulated = 0; // 停止中に持ち越した経過時間 (ms)
  let rafId = null;
  let laps = [];       // 各ラップの split (ms)

  const elapsed = () =>
    running ? accumulated + (performance.now() - startedAt) : accumulated;

  const pad = (n, width = 2) => String(n).padStart(width, '0');

  function parts(ms) {
    const t = Math.floor(ms);
    return {
      h: Math.floor(t / 3600000),
      m: Math.floor(t / 60000) % 60,
      s: Math.floor(t / 1000) % 60,
      cs: Math.floor((t % 1000) / 10),
    };
  }

  function format(ms) {
    const { h, m, s, cs } = parts(ms);
    return `${h > 0 ? pad(h) + ':' : ''}${pad(m)}:${pad(s)}.${pad(cs)}`;
  }

  function render() {
    const { h, m, s, cs } = parts(elapsed());
    const head = `${h > 0 ? pad(h) + ':' : ''}${pad(m)}:${pad(s)}`;
    displayEl.innerHTML = `${head}<span class="cs">.${pad(cs)}</span>`;
  }

  function tick() {
    render();
    rafId = requestAnimationFrame(tick);
  }

  function syncButtons() {
    toggleEl.textContent = running ? 'ストップ' : (accumulated > 0 ? '再開' : 'スタート');
    toggleEl.classList.toggle('running', running);
    secondaryEl.textContent = running ? 'ラップ' : 'リセット';
    secondaryEl.disabled = !running && elapsed() === 0;
  }

  function renderLaps() {
    if (laps.length === 0) {
      lapsEl.innerHTML = '';
      return;
    }

    const fastest = Math.min(...laps);
    const slowest = Math.max(...laps);
    const marked = laps.length >= 2 && fastest !== slowest;

    let total = 0;
    const rows = laps.map((split, i) => {
      total += split;
      const cls = marked
        ? (split === fastest ? ' class="fast"' : split === slowest ? ' class="slow"' : '')
        : '';
      return `<li${cls}>` +
        `<span class="no">Lap ${i + 1}</span>` +
        `<span class="split">${format(split)}</span>` +
        `<span class="total">${format(total)}</span>` +
        `</li>`;
    });

    // 最新のラップを先頭に表示する
    lapsEl.innerHTML = rows.reverse().join('');
  }

  function start() {
    if (running) return;
    running = true;
    startedAt = performance.now();
    tick();
    syncButtons();
  }

  function stop() {
    if (!running) return;
    accumulated += performance.now() - startedAt;
    running = false;
    cancelAnimationFrame(rafId);
    rafId = null;
    render();
    syncButtons();
  }

  function toggle() {
    running ? stop() : start();
  }

  function lap() {
    if (!running) return;
    const total = elapsed();
    const recorded = laps.reduce((sum, v) => sum + v, 0);
    laps.push(total - recorded);
    renderLaps();
  }

  function reset() {
    stop();
    accumulated = 0;
    laps = [];
    renderLaps();
    render();
    syncButtons();
  }

  toggleEl.addEventListener('click', toggle);
  secondaryEl.addEventListener('click', () => (running ? lap() : reset()));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;

    // e.code はキーボード配列に依存しないが，環境によっては空になるため e.key も見る
    const code = e.code || '';
    const key = (e.key || '').toLowerCase();
    const is = (c, ...keys) => code === c || keys.includes(key);

    if (is('Space', ' ', 'spacebar') || is('Enter', 'enter')) {
      e.preventDefault();
      // ボタンにフォーカスがある状態で二重に発火させない
      if (document.activeElement instanceof HTMLButtonElement) {
        document.activeElement.blur();
      }
      toggle();
    } else if (is('KeyL', 'l')) {
      e.preventDefault();
      lap();
    } else if (is('KeyR', 'r')) {
      e.preventDefault();
      reset();
    }
  });

  // タブが非表示の間は描画を止め，復帰時に追いつかせる
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (running && rafId === null) {
      tick();
    }
  });

  render();
  syncButtons();
})();
