(function () {
  'use strict';

  var numInput = document.getElementById('numInput');
  var inputError = document.getElementById('inputError');
  var baseRange = document.getElementById('baseRange');
  var baseTubeTens = document.getElementById('baseTubeTens');
  var baseTubeOnes = document.getElementById('baseTubeOnes');
  var tubeBank = document.getElementById('tubeBank');

  var MIN_BASE = 2;
  var MAX_BASE = 36;

  function updateBaseReadout(base) {
    var padded = String(base).padStart(2, '0');
    baseTubeTens.textContent = padded[0];
    baseTubeOnes.textContent = padded[1];
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

  function renderOutput(str) {
    tubeBank.innerHTML = '';
    str.split('').forEach(function (ch) {
      var tube = document.createElement('span');
      tube.className = 'tube lit';
      tube.textContent = ch;
      tubeBank.appendChild(tube);
    });
  }

  function convert() {
    var base = parseInt(baseRange.value, 10);
    updateBaseReadout(base);
    updateSliderFill(base);

    var raw = numInput.value.trim();

    if (!raw) {
      numInput.classList.remove('has-error');
      inputError.textContent = '';
      renderEmpty('Scrie un număr mai sus');
      return;
    }

    // same logic as the original: parse as base-10, re-express in the chosen base
    var isValidDecimal = /^\d+$/.test(raw);
    var num = isValidDecimal ? parseInt(raw, 10) : NaN;

    if (!isValidDecimal || !Number.isFinite(num)) {
      numInput.classList.add('has-error');
      inputError.textContent = 'Introdu doar cifre, în baza 10.';
      renderEmpty('—');
      return;
    }

    if (!Number.isSafeInteger(num)) {
      numInput.classList.add('has-error');
      inputError.textContent = 'Numărul e prea mare pentru o conversie exactă.';
      renderEmpty('—');
      return;
    }

    numInput.classList.remove('has-error');
    inputError.textContent = '';

    var result = num.toString(base).toUpperCase();
    renderOutput(result);
  }

  numInput.addEventListener('input', convert);
  baseRange.addEventListener('input', convert);

  updateBaseReadout(parseInt(baseRange.value, 10));
  updateSliderFill(parseInt(baseRange.value, 10));
  renderEmpty('Scrie un număr mai sus');
})();
