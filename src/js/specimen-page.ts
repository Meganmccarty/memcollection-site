import L from 'leaflet';

document.addEventListener('DOMContentLoaded', () => {
    const GPSCoordinatesTableCell = document.getElementById('gps-coordinates');

    if (GPSCoordinatesTableCell) {
        const GPSCoordinates = GPSCoordinatesTableCell?.innerText;
        const [stringLat, stringLong] = GPSCoordinates.split(' ');
        const lat = parseFloat(stringLat);
        const long = parseFloat(stringLong);

        const specimenMap = L.map(
            'specimen-map',
            {
                preferCanvas: true,
                scrollWheelZoom: true,
            },
        ).setView([lat, long], 13);

        // Set up the default tile layer (street view)
        const streetView = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(specimenMap);

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
            {
                maxZoom: 19,
                subdomains: ['server', 'services'],
            },
        );
        const satelliteViewRoads = L.tileLayer(
            'https://{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
            {
                maxZoom: 19,
                subdomains: ['server', 'services'],
            },
        );

        // Merge the satellite view tile layers into one layer
        const satelliteGroup = L.layerGroup(
            [satelliteView, satelliteViewLabels, satelliteViewRoads],
        );

        // Set up the baseMap object with the streetView and satelliteGroup tile layers
        const baseMaps = {
            'Street View': streetView,
            'Satellite View': satelliteGroup,
        };

        // Add the baseMaps to the Leaflet map
        L.control.layers(baseMaps).addTo(specimenMap);

        // Create and add a reset button to the Leaflet map
        const resetMapBtn = document.getElementById('reset-map-button');
        resetMapBtn?.addEventListener('click', () => {
            specimenMap.setView([lat, long], 13);
        });

        const bottomLeftControls = document.getElementById('bottom-left-controls');
        const bottomLeft = document.querySelector('div.leaflet-bottom.leaflet-left');

        if (bottomLeft && bottomLeftControls) {
            bottomLeftControls.removeAttribute('hidden');
            bottomLeft.append(bottomLeftControls);
        }

        let icon: L.Icon;

        const taxonTableCell = document.getElementById('taxon');
        const taxonIdentified = taxonTableCell?.getElementsByTagName('a');

        if (taxonIdentified && taxonIdentified.length > 0) {
            icon = L.icon({
                iconUrl: '/assets/uxwing/map-pin-icon-blue.svg',
                iconSize: [25, 85],
                iconAnchor: [12.5, 60],
            });
        } else {
            icon = L.icon({
                iconUrl: '/assets/uxwing/map-pin-icon-yellow.svg',
                iconSize: [25, 85],
                iconAnchor: [12.5, 60],
            });
        }

        const marker: L.Marker = L.marker(
            [lat, long],
            { alt: '', icon },
        );

        marker.addTo(specimenMap);
    }
});
