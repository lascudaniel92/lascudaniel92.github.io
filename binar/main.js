(function () {
  'use strict';

  var textInput = document.getElementById('numInput');
  var inputError = document.getElementById('inputError');
  var baseRange = document.getElementById('baseRange');
  var baseTubeTens = document.getElementById('baseTubeTens');
  var baseTubeOnes = document.getElementById('baseTubeOnes');
  var tubeBank = document.getElementById('tubeBank');
  var copyOutput = document.getElementById('copyOutput');
  var copyBtn = document.getElementById('copyBtn');
  var copyBtnLabel = document.getElementById('copyBtnLabel');

  var MIN_BASE = 2;
  var MAX_BASE = 36;
  var lastBase = null;

  function updateBaseReadout(base) {
    var padded = String(base).padStart(2, '0');
    baseTubeTens.textContent = padded[0];
    baseTubeOnes.textContent = padded[1];
    if (base !== lastBase) {
      lastBase = base;
      baseTubeTens.classList.remove('pulse');
      baseTubeOnes.classList.remove('pulse');
      void baseTubeTens.offsetWidth; // restart animation
      baseTubeTens.classList.add('pulse');
      baseTubeOnes.classList.add('pulse');
    }
  }

  function updateSliderFill(base) {
    var pct = ((base - MIN_BASE) / (MAX_BASE - MIN_BASE)) * 100;
    baseRange.style.setProperty('--pct', pct + '%');
  }

  function renderEmpty(message) {
    tubeBank.innerHTML = '';
    var span = document.createElement('span');
    span.className = 'tube-empty';
    span.textContent = message;
    tubeBank.appendChild(span);
  }

  // Each character of the input becomes its own little cluster of
  // tubes: the character's code (e.g. 'p' -> 112) re-expressed in
  // the chosen base — same idea as the original, just for any text
  // instead of only decimal numbers.
  function renderOutput(text, base) {
    tubeBank.innerHTML = '';
    var codes = [];
    text.split('').forEach(function (ch) {
      var group = document.createElement('div');
      group.className = 'tube-group';

      var glyph = document.createElement('span');
      glyph.className = 'tube-glyph';
      glyph.textContent = ch === ' ' ? '\u2423' : ch;
      group.appendChild(glyph);

      var digits = document.createElement('div');
      digits.className = 'tube-digits';
      var code = ch.charCodeAt(0).toString(base).toUpperCase();
      codes.push(code);
      code.split('').forEach(function (d) {
        var tube = document.createElement('span');
        tube.className = 'tube lit';
        tube.textContent = d;
        digits.appendChild(tube);
      });
      group.appendChild(digits);

      tubeBank.appendChild(group);
    });
    copyOutput.value = codes.join(' ');
  }

  function convert() {
    var base = parseInt(baseRange.value, 10);
    updateBaseReadout(base);
    updateSliderFill(base);

    var raw = textInput.value;

    if (!raw) {
      inputError.textContent = '';
      renderEmpty('Scrie ceva mai sus');
      copyOutput.value = '';
      return;
    }

    inputError.textContent = '';
    renderOutput(raw, base);
  }

  textInput.addEventListener('input', convert);
  baseRange.addEventListener('input', convert);

  updateBaseReadout(parseInt(baseRange.value, 10));
  updateSliderFill(parseInt(baseRange.value, 10));
  renderEmpty('Scrie ceva mai sus');

  // --- copy button ---
  var copyResetTimer = null;
  copyBtn.addEventListener('click', function () {
    if (!copyOutput.value) return;

    function showCopied() {
      copyBtn.classList.add('copied');
      copyBtnLabel.textContent = 'Copiat!';
      if (copyResetTimer) window.clearTimeout(copyResetTimer);
      copyResetTimer = window.setTimeout(function () {
        copyBtn.classList.remove('copied');
        copyBtnLabel.textContent = 'Copiază';
      }, 1600);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyOutput.value).then(showCopied, function () {
        copyOutput.select();
        document.execCommand('copy');
        showCopied();
      });
    } else {
      copyOutput.select();
      document.execCommand('copy');
      showCopied();
    }
  });

  // --- theme toggle (dark <-> light), remembered per browser ---
  var THEME_KEY = 'binar-theme';
  var themeToggle = document.getElementById('themeToggle');
  var htmlEl = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'light') {
      htmlEl.setAttribute('data-theme', 'light');
      themeToggle.setAttribute('aria-pressed', 'true');
    } else {
      htmlEl.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed', 'false');
    }
  }

  var savedTheme = null;
  try { savedTheme = window.localStorage.getItem(THEME_KEY); } catch (e) { /* unavailable */ }
  if (savedTheme === 'light') applyTheme('light');

  themeToggle.addEventListener('click', function () {
    var goingLight = htmlEl.getAttribute('data-theme') !== 'light';
    applyTheme(goingLight ? 'light' : 'dark');
    try { window.localStorage.setItem(THEME_KEY, goingLight ? 'light' : 'dark'); } catch (e) { /* ignore */ }
  });
})();
