(function () {
  'use strict';

  var grid = document.getElementById('grid');
  var resultStrip = document.getElementById('resultStrip');
  var btn = document.getElementById('generateBtn');
  var btnLabel = document.getElementById('btnLabel');
  var historyList = document.getElementById('historyList');
  var HISTORY_KEY = 'loto649-history';

  // build the 1–49 ticket grid (7x7, standard layout)
  var cells = [];
  for (var n = 1; n <= 49; n++) {
    var cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.num = n;

    var stamp = document.createElement('span');
    stamp.className = 'stamp';
    stamp.style.setProperty('--stamp-rot', (Math.random() * 16 - 8).toFixed(1) + 'deg');

    var label = document.createTextNode(n);
    cell.appendChild(stamp);
    cell.appendChild(label);
    grid.appendChild(cell);
    cells.push(cell);
  }

  function renderPlaceholders() {
    resultStrip.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var ph = document.createElement('div');
      ph.className = 'ball placeholder';
      ph.textContent = '?';
      resultStrip.appendChild(ph);
    }
  }

  function drawSix() {
    // same logic as the original: 6 unique random numbers from 1–49
    var pool = [];
    for (var i = 1; i <= 49; i++) pool.push(i);
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool.slice(0, 6);
  }

  function loadHistory() {
    try {
      var raw = window.localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveHistory(list) {
    try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }

  function renderHistory() {
    var list = loadHistory().slice(0, 5); // only the 5 most recent are shown as chips
    historyList.innerHTML = '';
    if (!list.length) {
      historyList.innerHTML = '<div class="history-row" style="opacity:.5">Încă nicio extragere</div>';
      return;
    }
    list.forEach(function (nums) {
      var row = document.createElement('div');
      row.className = 'history-row';
      nums.forEach(function (n) {
        var chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = n;
        row.appendChild(chip);
      });
      historyList.appendChild(row);
    });
  }

  // Frequency ledger — tallies how many times each number (1–49) has
  // shown up across every draw ever recorded in this browser, then
  // lists them ranked from most to least common.
  var statsGrid = document.getElementById('statsGrid');
  var statsEmpty = document.getElementById('statsEmpty');
  var statsCount = document.getElementById('statsCount');

  function renderStats() {
    var list = loadHistory();
    statsCount.textContent = list.length + (list.length === 1 ? ' extragere' : ' extrageri');

    if (!list.length) {
      statsGrid.style.display = 'none';
      statsEmpty.style.display = 'block';
      return;
    }
    statsGrid.style.display = 'grid';
    statsEmpty.style.display = 'none';

    var counts = {};
    for (var n = 1; n <= 49; n++) counts[n] = 0;
    list.forEach(function (nums) {
      nums.forEach(function (n) { counts[n] = (counts[n] || 0) + 1; });
    });

    var ranked = Object.keys(counts).map(function (n) {
      return { num: parseInt(n, 10), count: counts[n] };
    });
    ranked.sort(function (a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return a.num - b.num;
    });

    var maxCount = ranked[0].count || 1;

    statsGrid.innerHTML = '';
    ranked.forEach(function (item, i) {
      var row = document.createElement('div');
      row.className = 'stats-row';

      var rank = document.createElement('span');
      rank.className = 'stats-rank';
      rank.textContent = (i + 1) + '.';

      var num = document.createElement('span');
      num.className = 'stats-num';
      num.textContent = item.num;

      var barWrap = document.createElement('span');
      barWrap.className = 'stats-bar-wrap';
      var bar = document.createElement('span');
      bar.className = 'stats-bar';
      bar.style.width = (maxCount ? (item.count / maxCount) * 100 : 0) + '%';
      barWrap.appendChild(bar);

      var count = document.createElement('span');
      count.className = 'stats-count';
      count.textContent = item.count + '×';

      row.appendChild(rank);
      row.appendChild(num);
      row.appendChild(barWrap);
      row.appendChild(count);
      statsGrid.appendChild(row);
    });
  }

  function addToHistory(nums) {
    var list = loadHistory();
    list.unshift(nums);
    list = list.slice(0, 500); // keep a generous, but bounded, all-time log
    saveHistory(list);
    renderHistory();
    renderStats();
  }

  var running = false;

  function runDraw() {
    if (running) return;
    running = true;
    btn.disabled = true;
    btn.classList.add('spinning');
    btnLabel.textContent = 'Se extrag...';

    // clear previous stamps
    cells.forEach(function (c) { c.classList.remove('drawn'); });
    renderPlaceholders();

    var drawOrder = drawSix();          // order the numbers are "pulled"
    var sorted = drawOrder.slice().sort(function (a, b) { return a - b; });

    drawOrder.forEach(function (num, idx) {
      window.setTimeout(function () {
        var cell = cells[num - 1];
        cell.classList.add('drawn');

        var sortedIdx = sorted.indexOf(num);
        var ballSlot = resultStrip.children[sortedIdx];
        if (ballSlot) {
          ballSlot.className = 'ball';
          ballSlot.textContent = num;
          ballSlot.style.animationDelay = '0s';
        }

        if (idx === drawOrder.length - 1) {
          window.setTimeout(function () {
            running = false;
            btn.disabled = false;
            btn.classList.remove('spinning');
            btnLabel.textContent = 'Generează din nou';
            addToHistory(sorted);
          }, 350);
        }
      }, idx * 260);
    });
  }

  btn.addEventListener('click', runDraw);

  renderPlaceholders();
  renderHistory();
  renderStats();
})();
