// Copyright 2020–2025 Medeiros
// PAS UK data — loaded from local JSON (updated by GitHub Actions daily)
// Chart.js 4 compatible — replaces deprecated horizontalBar and yAxes syntax

const ByCounty_labels   = [];
const ByCounty_numbers  = [];
const Objecttype_labels = [];
const Objecttype_numbers = [];

// counties_data is used by map.js to colour the choropleth
var counties_data = {};

// Local JSON — populated by GitHub Actions from finds.org.uk
// See .github/workflows/update-data.yml
const pas_url_1300_700 = "/assets/js/geojs/pas_data.json";

// ── DESIGN TOKENS ────────────────────────────────────────────
// Match the site palette from _tokens.scss
const PALETTE = {
  rust:      '#9B4A2C',
  rustDim:   '#C47A5A',
  teal:      '#4A7C8E',
  tealDim:   '#7AACBE',
  olive:     '#6B7C3A',
  oliveDim:  '#9BAC6A',
  ink:       '#1A1612',
  inkFaint:  '#6B5E54',
  rule:      '#DDD5C4',
};

// Generate a repeating palette for N bars
function makePalette(n) {
  const base = [
    PALETTE.rust,    PALETTE.teal,   PALETTE.olive,
    PALETTE.rustDim, PALETTE.tealDim, PALETTE.oliveDim,
  ];
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
}

function makeAlphaPalette(n, alpha = '33') {
  return makePalette(n).map(hex => hex + alpha);
}

// ── LOADING STATE HELPERS ─────────────────────────────────────
function setStatLoading() {
  ['total_ba_ea','ba_nr','ea_nr','published_ba_ia','validation_ba_ia']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '…';
        el.style.opacity = '0.5';
      }
    });
}

function setStatError() {
  ['total_ba_ea','ba_nr','ea_nr','published_ba_ia','validation_ba_ia']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '—';
        el.style.opacity = '1';
        el.title = 'Data unavailable — check pas_data.json';
      }
    });
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value !== undefined && value !== null
    ? Number(value).toLocaleString()
    : '—';
  el.style.opacity = '1';
}

// ── CHART GLOBAL DEFAULTS (Chart.js 4) ───────────────────────
function applyChartDefaults() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.font.family = "'Share Tech Mono', monospace";
  Chart.defaults.font.size   = 11;
  Chart.defaults.color       = PALETTE.inkFaint;
  Chart.defaults.borderColor = PALETTE.rule;
  Chart.defaults.plugins     = Chart.defaults.plugins || {};
  Chart.defaults.plugins.legend = {
    display: true,
    labels: { color: PALETTE.inkFaint, boxWidth: 12 },
  };
  Chart.defaults.plugins.tooltip = {
    backgroundColor: PALETTE.ink,
    titleColor:      '#E8D5A3',
    bodyColor:       '#A8935A',
    cornerRadius:    3,
    padding:         8,
  };
}

// ── DATA FETCH ────────────────────────────────────────────────
async function getHorte_SBZ_FEZ() {
  const response = await fetch(pas_url_1300_700);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  // Stats bar
  setStat('ba_nr',           data.facets?.broadperiod?.["BRONZE AGE"]);
  setStat('ea_nr',           data.facets?.broadperiod?.["IRON AGE"]);
  setStat('total_ba_ea',     data.meta?.["totalResults"]);
  setStat('published_ba_ia', data.facets?.workflow?.["3"]);
  setStat('validation_ba_ia',data.facets?.workflow?.["4"]);

  // Update comparison card if present
  const compUK = document.getElementById('comp-uk-total');
  if (compUK) compUK.textContent = data.meta?.["totalResults"]
    ? Number(data.meta["totalResults"]).toLocaleString()
    : '—';

  // Chart data
  counties_data = data.facets?.county || {};
  const objectType = data.facets?.objectType || {};

  for (const x in counties_data) {
    ByCounty_labels.push(x);
    ByCounty_numbers.push(counties_data[x]);
  }
  for (const y in objectType) {
    Objecttype_labels.push(y);
    Objecttype_numbers.push(objectType[y]);
  }
}

// ── CHARTS ───────────────────────────────────────────────────
async function chartIt() {
  setStatLoading();
  applyChartDefaults();

  try {
    await getHorte_SBZ_FEZ();
  } catch (err) {
    console.error('PAS data load failed:', err);
    setStatError();

    // Show error state in chart containers
    ['chart','chart1'].forEach(id => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = PALETTE.inkFaint;
      ctx.font = "12px 'Share Tech Mono', monospace";
      ctx.fillText('Data unavailable — check pas_data.json', 10, 30);
    });
    return;
  }

  // ── Chart 1: By County ──────────────────────────────────────
  const ctx = document.getElementById('chart')?.getContext('2d');
  if (ctx && ByCounty_labels.length) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ByCounty_labels,
        datasets: [{
          label: 'Finds by County',
          data:  ByCounty_numbers,
          backgroundColor: makeAlphaPalette(ByCounty_labels.length),
          borderColor:     makePalette(ByCounty_labels.length),
          borderWidth:     1,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend:  { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${Number(ctx.raw).toLocaleString()} finds`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: PALETTE.inkFaint },
            grid:  { color: PALETTE.rule + '55' },
          },
          y: {
            ticks: {
              color:    PALETTE.inkFaint,
              font:     { size: 10 },
              autoSkip: false,
            },
            grid: { display: false },
          },
        },
      },
    });
  }

  // ── Chart 2: By Object Type ─────────────────────────────────
  const ctx1 = document.getElementById('chart1')?.getContext('2d');
  if (ctx1 && Objecttype_labels.length) {
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: Objecttype_labels,
        datasets: [{
          label: 'Finds by Object Type',
          data:  Objecttype_numbers,
          backgroundColor: PALETTE.rust + '33',
          borderColor:     PALETTE.rust,
          borderWidth:     1,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend:  { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${Number(ctx.raw).toLocaleString()} finds`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: PALETTE.inkFaint },
            grid:  { color: PALETTE.rule + '55' },
          },
          y: {
            ticks: {
              color:    PALETTE.inkFaint,
              font:     { size: 10 },
              autoSkip: false,
            },
            grid: { display: false },
          },
        },
      },
    });
  }
}

chartIt();