// JavaScript source code
//const pas_url_1300_700
//PAS_BA_EA_Map is the distribution  of -1300 -700 search result in PAS

const mymap = L.map('PAS_BA_EA_Map').setView([51.505, -0.09], 5);
const attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy <a href="https://www.mapbox.com/">Mapbox</a> Contains OS data &copy Crown copyright and database right 2018 - and the PAS: Thank you';
const tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);

async function get_shapes() {
    const response = await fetch("Counties_shp_1.geojson");
    const data = await response.json();
    var counties_shp = L.geoJson(data);
    //counties_shp.addTo(mymap);
    //console.log(counties_shp);      // ._layers[37].feature.properties['NAME']);
    for (var x in counties_shp._layers) {
    //console.log(counties_shp._layers[x].feature.properties['NAME']);
        for (var y in counties_data) {
            if (y.startsWith(counties_shp._layers[x].feature.properties['NAME'])) {
                counties_shp._layers[x].feature.properties.pasrecords = counties_data[y];
            }
        }  

    // console.log(counties_shp._layers[x].feature.properties['NAME'] + ":" + counties_shp_layers[x].feature.properties.pasrecords );    

    }
    
    counties_shp = L.geoJson(data, {style: style});
    //console.log("Before we add to map it looks like this:");
    //console.log(counties_shp_layers[x].feature.properties.pasrecords);
    counties_shp.addTo(mymap);
}
get_shapes();
//console.log("outside loop it looks like this:");
//console.log(counties_shp_layers.properties.pasrecords);



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