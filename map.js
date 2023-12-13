const map = L.map('map');

// Define BaseMaps
const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, attribution: 'World Imagery &copy; <a href="https://www.arcgis.com/">ArcGIS</a>'
});

const Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
});

// Create separate GeoJSON layers for caribbean and south-america datasets
const californiaLayer = createGeoJSONLayer(california, 'blue');
const arizonaLayer = createGeoJSONLayer(arizona, 'yellow');

// Group both GeoJSON layers for bounds calculation
const featureGroup = L.featureGroup([
    californiaLayer,
    arizonaLayer
]).addTo(map);

// Fit the map to the combined bounds of both datasets
map.fitBounds(featureGroup.getBounds());

// Create a single control for both basemaps and data layers
const baseMaps = {
    'Satellite Imagery': satelliteLayer,
    'OpenStreetMap': osmLayer,
    'Dark Theme': Stadia_AlidadeSmoothDark,
};

const overlayMaps = {
    'California': californiaLayer,
    'Arizona': arizonaLayer
};

const layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Set initial layers
satelliteLayer.addTo(map);  // You can choose the default basemap here
// caribbeanLayer.addTo(map);  // You can choose the default data layer here
// Stadia_AlidadeSmoothDark.addTo(map);  // You can choose the default data layer here

// Listen for overlay add/remove events
map.on('overlayadd overlayremove', function (event) {
    // Fit the map to the combined bounds of all visible overlay layers
    const visibleOverlayLayers = Object.values(layerControl._layers)
        .filter(layer => map.hasLayer(layer.layer) && layer.overlay)
        .map(layer => layer.layer);

    const bounds = L.featureGroup(visibleOverlayLayers).getBounds();

    if (bounds.isValid()) {
        map.fitBounds(bounds);
    }
});

function createGeoJSONLayer(data, color) {
    return L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            const category = feature.properties.category;

            let marker;

            if (category === 1) {
                // Create a star marker for category 1
                marker = L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'star-marker',
                        html: '<div class="star">&#9733;</div>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24],
                    }),
                });
            } else {
                // Create a circle marker for other categories
                marker = L.circleMarker(latlng, {
                    radius: 8, fillColor: color, color: 'black', weight: 2, opacity: 1, fillOpacity: 0.7
                });
            }

            return marker;
        },
        onEachFeature: function (feature, layer) {
            const popupContent = generatePopupTable(feature.properties);
            layer.bindPopup(popupContent);
        }
    });
}

function generatePopupTable(properties) {
    const attributesToShow = ['title', 'Address', 'latitude', 'longitude'];

    let tableContent = '<div style="padding: 0; margin: 0;">';
    tableContent += '<table style="border-collapse: collapse; width: 100%; border: 1px solid black; background-color: #E9E611; margin: 0; padding: 0;">';
    for (const key of attributesToShow) {
        if (properties.hasOwnProperty(key)) {
            tableContent += `<tr style="border: 1px solid black; margin: 0; padding: 0;"><td style="border: 2px solid black; padding: 8px; font-weight: bold; margin: 0;">${key}</td><td style="border: 2px solid black; padding: 8px; margin: 0;">${properties[key]}</td></tr>`;
        }
    }
    tableContent += '</table>';
    tableContent += '</div>';
    return tableContent;
}


// Add CSS styles for the star marker
const starMarkerStyle = document.createElement('style');
starMarkerStyle.innerHTML = `
  .star-marker {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .star {
    color: red;
    font-size: 2.4em;
  }
`;
document.head.appendChild(starMarkerStyle);

