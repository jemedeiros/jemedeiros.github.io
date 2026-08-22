// Copyright 2020–2025 Medeiros
// Leaflet map for PAS Schemes Monitor
// Upgraded: jsDelivr CDN, richer choropleth, legend, popups

// ── MAP INIT ──────────────────────────────────────────────────
const mymap = L.map('Map', {
  loadingControl: true,
  preferCanvas:   true,
}).setView([54.5, 4.5], 5);

const attribution =
  'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>. ' +
  'Finds data: <a href="https://finds.org.uk">PAS UK</a>, ' +
  '<a href="https://portable-antiquities.nl">PAN NL</a>, ' +
  '<a href="https://www.metaldetektorfund.dk">DIME DK</a>.';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution, maxZoom: 18 });
tiles.addTo(mymap);

let shp_uk_lba_eia_id;
let shp_nld_lba_eia_id;
let shp_dime_lba_eia_id;

var loadingHandler = function (event) {
  try { mymap.fireEvent('dataloading', event); } catch(e) {}
};
var loadHandler = function (event) {
  try { mymap.fireEvent('dataload', event); } catch(e) {}
};

// ── CHOROPLETH COLOURS (rust-to-clay scale) ───────────────────
// Replaces the pure-red scale with warm tones matching the site palette
function getColor(d) {
  return d > 300 ? '#5C2010' :
         d > 200 ? '#7A2C18' :
         d > 150 ? '#9B3C22' :
         d > 100 ? '#B85030' :
         d > 75  ? '#C87050' :
         d > 50  ? '#D4906A' :
         d > 30  ? '#DFB090' :
         d > 15  ? '#EAC8A8' :
         d > 5   ? '#F0DBC4' :
         d >= 1  ? '#F7EEDF' :
                   '#FFFFFF';
}

function style(feature) {
  return {
    fillColor:   getColor(feature.properties.pasrecords || 0),
    weight:      1.5,
    opacity:     0.9,
    color:       '#6B5E54',
    dashArray:   '',
    fillOpacity: 0.75,
  };
}

// Highlight on hover
function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
    weight:      2.5,
    color:       '#9B4A2C',
    fillOpacity: 0.9,
  });
  layer.bringToFront();
}

function resetHighlight(e) {
  if (shp_uk_lba_eia_id) shp_uk_lba_eia_id.resetStyle(e.target);
}

function onEachFeatureUK(feature, layer) {
  const name    = feature.properties['NAME'] || 'Unknown county';
  const records = feature.properties.pasrecords || 0;
  layer.bindPopup(
    `<div style="font-family:'Share Tech Mono',monospace;font-size:11px;line-height:1.6;">
      <strong style="font-size:12px;color:#1A1612;">${name}</strong><br>
      <span style="color:#6B5E54;">LBA &amp; EIA finds (1300–700 BC)</span><br>
      <span style="color:#9B4A2C;font-size:14px;font-weight:bold;">${records.toLocaleString()}</span>
      <span style="color:#6B5E54;"> records</span>
    </div>`,
    { maxWidth: 200 }
  );
  layer.on({
    mouseover: highlightFeature,
    mouseout:  resetHighlight,
  });
}

function onEachFeatureNL(feature, layer) {
  const name = feature.properties['NAME_1'] || feature.properties['NAME'] || 'Province';
  layer.bindPopup(
    `<div style="font-family:'Share Tech Mono',monospace;font-size:11px;line-height:1.6;">
      <strong style="font-size:12px;color:#1A1612;">${name}</strong><br>
      <span style="color:#6B5E54;">PAN Netherlands</span><br>
      <em style="color:#9B4A2C;">Period-specific data not yet<br>available via public API.</em>
    </div>`,
    { maxWidth: 200 }
  );
}

function onEachFeatureDK(feature, layer) {
  const name = feature.properties['NAME_2'] || feature.properties['NAME_1'] || 'Region';
  layer.bindPopup(
    `<div style="font-family:'Share Tech Mono',monospace;font-size:11px;line-height:1.6;">
      <strong style="font-size:12px;color:#1A1612;">${name}</strong><br>
      <span style="color:#6B5E54;">DIME Denmark</span><br>
      <em style="color:#9B4A2C;">Period-specific data not yet<br>available via public API.</em>
    </div>`,
    { maxWidth: 200 }
  );
}

// ── LEGEND ────────────────────────────────────────────────────
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'dm-map-legend');
  const grades  = [0, 1, 5, 15, 30, 50, 75, 100, 150, 200, 300];
  const labels  = [];

  div.innerHTML =
    '<div style="font-family:\'Share Tech Mono\',monospace;font-size:10px;' +
    'background:rgba(247,244,238,0.95);padding:8px 10px;border-radius:3px;' +
    'border:1px solid #DDD5C4;line-height:1.6;">' +
    '<strong style="font-size:11px;display:block;margin-bottom:4px;color:#1A1612;">' +
    'UK Finds (PAS)</strong>';

  for (let i = grades.length - 1; i >= 0; i--) {
    const from = grades[i];
    const to   = grades[i + 1];
    div.innerHTML +=
      `<div style="display:flex;align-items:center;gap:5px;">` +
      `<span style="display:inline-block;width:14px;height:14px;` +
      `background:${getColor(from + 1)};border:1px solid #6B5E54;flex-shrink:0;"></span>` +
      `<span style="color:#3D342C;">${from}${to ? `–${to}` : '+'}</span></div>`;
  }

  div.innerHTML += '</div>';
  return div;
};

let legendAdded = false;

// ── LAYER LOADERS ─────────────────────────────────────────────
async function get_shapes() {
  const cbox = document.getElementById('pas_uk_lba_eia');
  if (!cbox) return;

  if (!cbox.checked) {
    if (shp_uk_lba_eia_id) mymap.removeLayer(shp_uk_lba_eia_id);
    if (legendAdded) { legend.remove(); legendAdded = false; }
    return;
  }

  try {
    const response = await fetch('/assets/js/geojs/Counties_shp_1.geojson');
    const data     = await response.json();

    // Attach PAS record counts to each county feature
    const tempLayer = L.geoJson(data);
    for (const x in tempLayer._layers) {
      const name = tempLayer._layers[x].feature.properties['NAME'];
      for (const y in counties_data) {
        if (y.startsWith(name)) {
          tempLayer._layers[x].feature.properties.pasrecords = counties_data[y];
        }
      }
    }

    shp_uk_lba_eia_id = L.geoJson(data, {
      style:         style,
      onEachFeature: onEachFeatureUK,
    }).addTo(mymap);

    shp_uk_lba_eia_id.on('loading', loadingHandler);
    shp_uk_lba_eia_id.on('load',    loadHandler);

    if (!legendAdded) { legend.addTo(mymap); legendAdded = true; }
  } catch(err) {
    console.error('UK GeoJSON load failed:', err);
  }
}

async function get_shapes_dnk() {
  const cbox = document.getElementById('dime_lba_eia');
  if (!cbox) return;

  if (!cbox.checked) {
    if (shp_dime_lba_eia_id) mymap.removeLayer(shp_dime_lba_eia_id);
    return;
  }

  try {
    const response = await fetch('/assets/js/geojs/gadm36_DNK_2.json');
    const data     = await response.json();
    shp_dime_lba_eia_id = L.geoJson(data, {
      style: {
        fillColor:   '#4A7C8E',
        fillOpacity: 0.15,
        color:       '#4A7C8E',
        weight:      1.5,
        dashArray:   '4 4',
      },
      onEachFeature: onEachFeatureDK,
    }).addTo(mymap);
  } catch(err) {
    console.error('Denmark GeoJSON load failed:', err);
  }
}

async function get_shapes_nld() {
  const cbox = document.getElementById('pan_lba_eia');
  if (!cbox) return;

  if (!cbox.checked) {
    if (shp_nld_lba_eia_id) mymap.removeLayer(shp_nld_lba_eia_id);
    return;
  }

  try {
    const response = await fetch('/assets/js/geojs/gadm36_NLD_1.json');
    const data     = await response.json();
    shp_nld_lba_eia_id = L.geoJson(data, {
      style: {
        fillColor:   '#6B7C3A',
        fillOpacity: 0.15,
        color:       '#6B7C3A',
        weight:      1.5,
        dashArray:   '4 4',
      },
      onEachFeature: onEachFeatureNL,
    }).addTo(mymap);
  } catch(err) {
    console.error('Netherlands GeoJSON load failed:', err);
  }
}