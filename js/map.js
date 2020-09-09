// Copyright 2020 Medeiros
// A map and data from the BA in England from BZ
// The idea is to make the  map for every country.
// Still working on that.

const mymap = L.map('Map', { loadingControl: true }).setView([51.505, -0.09], 5);
const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy <a href="https://www.mapbox.com/">Mapbox</a> Contains OS data &copy Crown copyright and database right 2018 - and the PAS: Thank you';
const tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

let shp_uk_lba_eia_id;
let shp_nld_lba_eia_id;
let shp_dime_lba_eia_id;
async function get_shapes() {
    var cbox = document.getElementById("pas_uk_lba_eia");
    if (cbox.checked === false) {
        mymap.removeLayer(shp_uk_lba_eia_id);
    } else {
        const response = await fetch("Counties_shp_1.geojson");
        const data = await response.json();
        var counties_shp = L.geoJson(data);
        for (var x in counties_shp._layers) {
            for (var y in counties_data) {
                if (y.startsWith(counties_shp._layers[x].feature.properties['NAME'])) {
                    counties_shp._layers[x].feature.properties.pasrecords = counties_data[y];
                        }
            }
        }
        counties_shp = L.geoJson(data, {style: style});
        counties_shp.addTo(mymap);
        shp_uk_lba_eia_id = L.stamp(counties_shp);
    } 
}
// get_shapes();

async function get_shapes_dnk() {
    if (cbox.checked === false) {
        mymap.removeLayer(shp_dnk_lba_eia_id);
    } else {
        const response = await fetch("./geojs/gadm36_DNK_2.json");
        const data = await response.json();
        var counties_shp = L.geoJson(data);
        counties_shp.addTo(mymap);
        shp_dnk_lba_eia_id = L.stamp(counties_shp);
    }
}
// get_shapes_dnk();

async function get_shapes_nld() {
    if (cbox.checked === false) {
        mymap.removeLayer(shp_nld_lba_eia_id);
    } else {
        const response = await fetch("./geojs/gadm36_NLD_1.json");
        const data = await response.json();
        var counties_shp = L.geoJson(data);
        counties_shp.addTo(mymap);
        shp_nld_lba_eia_id = L.stamp(counties_shp);
    }
}
// get_shapes_nld();

function getColor(d) {
    return d > 300 ? '#610B21':   
        d > 250 ? '#8A0829' :
            d > 200 ? '#B40431' :
                d > 150 ? '#DF013A' :
                    d > 100 ? '#FF0040' :
                        d > 50 ? '#FE2E64' :
                            d > 20 ? '#FA5882' :
                                d > 10 ? '#F7819F' :
                                    d > 5 ? '#F5A9BC' :
                                        d >= 2 ? '#F6CED8' :
                                            d > 0 ? '#F8E0E6':  
                                                    '#ffffff';   
                                        
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.pasrecords),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}