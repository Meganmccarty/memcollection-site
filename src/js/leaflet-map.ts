import L from 'leaflet';

/**
 * Creates a Leaflet marker using a custom image
 * @param url - The url of the image asset used as the icon
 * @returns The generated Leaflet icon
 */
export function createMarker(url: string): L.Icon {
    return L.icon({
        iconUrl: url,
        iconSize: [25, 85],
        iconAnchor: [12.5, 60],
        popupAnchor: [0, -35],
    });
}

/**
 * Sets up the Leaflet map that will display the specimen markers
 * @param lat - The latitude coordinate for the center of the map
 * @param long - The longitude coordinate for the center of the map
 * @param zoom - The zoom level for the map
 * @param mapElementId - The id of the map container
 * @returns The newly-created Leaflet map
 */
export function initializeLeafletMap(
    lat: number,
    long: number,
    zoom: number,
    mapElementId: string,
): L.Map {
    // Create the Leaflet map and set its default position and zoom
    const map = L.map(mapElementId, {
        preferCanvas: true,
        scrollWheelZoom: true,
    }).setView([lat, long], zoom);

    // Set up the default tile layer (street view)
    const streetView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Set up the satellite view tile layer, along with labels and roads
    const satelliteView = L.tileLayer(
        'https://{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            maxZoom: 19,
            subdomains: ['server', 'services'],
            attribution: '<a href="https://static.arcgis.com/attribution/World_Imagery">DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community</a>',
        },
    );
    const satelliteViewLabels = L.tileLayer(
        'https://{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, subdomains: ['server', 'services'] },
    );
    const satelliteViewRoads = L.tileLayer(
        'https://{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, subdomains: ['server', 'services'] },
    );

    // Merge the satellite view tile layers into one layer
    const satelliteGroup = L.layerGroup([satelliteView, satelliteViewLabels, satelliteViewRoads]);

    // Set up the baseMap object with the streetView and satelliteGroup tile layers
    const baseMaps = {
        'Street View': streetView,
        'Satellite View': satelliteGroup,
    };

    // Add the baseMaps to the Leaflet map
    L.control.layers(baseMaps).addTo(map);

    // Add event listener to map reset button to reset the map view
    // to the initial lat, long, and zoom
    const resetMapBtn = document.getElementById('reset-map-button');
    resetMapBtn?.addEventListener('click', () => {
        map.setView([lat, long], zoom);
    });

    // Ensure the map controls are visible
    const bottomLeftControls = document.getElementById('bottom-left-controls');
    const bottomLeft = document.querySelector('div.leaflet-bottom.leaflet-left');

    if (bottomLeft && bottomLeftControls) {
        bottomLeftControls.removeAttribute('hidden');
        bottomLeft.append(bottomLeftControls);
    }

    return map;
}
