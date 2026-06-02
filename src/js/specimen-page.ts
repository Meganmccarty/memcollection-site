import L from 'leaflet';
import { createMarker, initializeLeafletMap } from './leaflet-map';

export function parseGPSCoordinates(coordinateString: string): [number, number] {
    const [stringLat, stringLong] = coordinateString.split(' ');
    return [parseFloat(stringLat), parseFloat(stringLong)];
}

export function isSpecimenIdentified(): boolean {
    const taxonTableCell = document.getElementById('taxon');
    const taxonIdentified = taxonTableCell?.getElementsByTagName('a');
    return !!(taxonIdentified && taxonIdentified.length > 0);
}

export function createSpecimenIcon(identified: boolean): L.Icon {
    const iconUrl = identified
        ? '/assets/uxwing/map-pin-icon-blue.svg'
        : '/assets/uxwing/map-pin-icon-yellow.svg';
    return createMarker(iconUrl);
}

export function initializeSpecimenMap(lat: number, long: number, zoom: number): L.Map {
    const map = initializeLeafletMap(lat, long, zoom, 'specimen-map');
    const icon = createSpecimenIcon(isSpecimenIdentified());
    L.marker([lat, long], { alt: 'Specimen location', icon }).addTo(map);
    return map;
}

document.addEventListener('DOMContentLoaded', () => {
    const GPSCoordinatesTableCell = document.getElementById('gps-coordinates');
    if (!GPSCoordinatesTableCell) return;

    const [lat, long] = parseGPSCoordinates(GPSCoordinatesTableCell.textContent ?? '');
    initializeSpecimenMap(lat, long, 13);
});
