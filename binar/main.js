(function () {
  'use strict';

  var textInput = document.getElementById('numInput');
  var inputError = document.getElementById('inputError');
  var baseRange = document.getElementById('baseRange');
  var baseTubeTens = document.getElementById('baseTubeTens');
  var baseTubeOnes = document.getElementById('baseTubeOnes');
  var tubeBank = document.getElementById('tubeBank');

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
      code.split('').forEach(function (d) {
        var tube = document.createElement('span');
        tube.className = 'tube lit';
        tube.textContent = d;
        digits.appendChild(tube);
      });
      group.appendChild(digits);

      tubeBank.appendChild(group);
    });
  }

  function convert() {
    var base = parseInt(baseRange.value, 10);
    updateBaseReadout(base);
    updateSliderFill(base);

    var raw = textInput.value;

    if (!raw) {
      inputError.textContent = '';
      renderEmpty('Scrie ceva mai sus');
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
})();
