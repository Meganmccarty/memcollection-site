/** @jest-environment jsdom */
import { expect } from '@jest/globals';

import L from 'leaflet';
import {
    parseGPSCoordinates,
    isSpecimenIdentified,
    createSpecimenIcon,
    initializeSpecimenMap,
} from './specimen-page';
import { createMarker, initializeLeafletMap } from './leaflet-map';

const mockAddTo = jest.fn().mockReturnThis();
const mockBindPopup = jest.fn().mockReturnThis();
const mockMarkerInstance = { addTo: mockAddTo, bindPopup: mockBindPopup };
const mockMapInstance = { setView: jest.fn().mockReturnThis() };
const mockIcon = { iconUrl: '' };

jest.mock('leaflet', () => ({
    marker: jest.fn(() => mockMarkerInstance),
    icon: jest.fn((options) => ({ ...mockIcon, ...options })),
}));

jest.mock('./leaflet-map', () => ({
    createMarker: jest.fn((url) => ({ iconUrl: url })),
    initializeLeafletMap: jest.fn(() => mockMapInstance),
}));

describe('parseGPSCoordinates', () => {
    it('parses a coordinate string into a lat/long tuple', () => {
        const [lat, long] = parseGPSCoordinates('37.7648 -122.4630');
        expect(lat).toBe(37.7648);
        expect(long).toBe(-122.4630);
    });

    it('handles positive longitude', () => {
        const [lat, long] = parseGPSCoordinates('51.5074 20.1278');
        expect(lat).toBe(51.5074);
        expect(long).toBe(20.1278);
    });
});

describe('isSpecimenIdentified', () => {
    it('returns true when the taxon cell contains a link', () => {
        document.body.innerHTML = `
            <table><tbody><tr>
                <td id="taxon"><a href="/taxa/1">Danaus plexippus</a></td>
            </tr></tbody></table>
        `;
        expect(isSpecimenIdentified()).toBe(true);
    });

    it('returns false when the taxon cell has no link', () => {
        document.body.innerHTML = `
            <table><tbody><tr>
                <td id="taxon">Nymphalidae</td>
            </tr></tbody></table>
        `;
        expect(isSpecimenIdentified()).toBe(false);
    });

    it('returns false when the taxon cell is missing', () => {
        document.body.innerHTML = '';
        expect(isSpecimenIdentified()).toBe(false);
    });
});

describe('createSpecimenIcon', () => {
    it('uses the blue icon for identified specimens', () => {
        createSpecimenIcon(true);
        expect(createMarker).toHaveBeenCalledWith('/assets/uxwing/map-pin-icon-blue.svg');
    });

    it('uses the yellow icon for unidentified specimens', () => {
        createSpecimenIcon(false);
        expect(createMarker).toHaveBeenCalledWith('/assets/uxwing/map-pin-icon-yellow.svg');
    });
});

describe('initializeSpecimenMap', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = `
            <table><tbody><tr>
                <td id="taxon"><a href="/taxa/1">Danaus plexippus</a></td>
            </tr></tbody></table>
        `;
    });

    it('initializes the map with the correct coordinates and zoom', () => {
        initializeSpecimenMap(37.7648, -122.4630, 13);
        expect(initializeLeafletMap).toHaveBeenCalledWith(37.7648, -122.4630, 13, 'specimen-map');
    });

    it('adds a marker at the correct coordinates', () => {
        initializeSpecimenMap(37.7648, -122.4630, 13);
        expect(L.marker).toHaveBeenCalledWith(
            [37.7648, -122.4630],
            expect.objectContaining({ alt: 'Specimen location', icon: { iconUrl: '/assets/uxwing/map-pin-icon-blue.svg' } }),
        );
        expect(mockAddTo).toHaveBeenCalledWith(mockMapInstance);
    });

    it('uses a blue icon for an identified specimen', () => {
        initializeSpecimenMap(37.7648, -122.4630, 13);
        expect(createMarker).toHaveBeenCalledWith('/assets/uxwing/map-pin-icon-blue.svg');
    });

    it('uses a yellow icon for an unidentified specimen', () => {
        document.body.innerHTML = '<td id="taxon">Nymphalidae</td>';
        initializeSpecimenMap(37.7648, -122.4630, 13);
        expect(createMarker).toHaveBeenCalledWith('/assets/uxwing/map-pin-icon-yellow.svg');
    });

    it('returns the map instance', () => {
        const map = initializeSpecimenMap(37.7648, -122.4630, 13);
        expect(map).toBe(mockMapInstance);
    });
});

describe('DOMContentLoaded', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls initializeSpecimenMap with parsed coordinates when gps-coordinates element exists', () => {
        document.body.innerHTML = `
            <table><tbody><tr>
                <td id="gps-coordinates">37.7648 -122.4630</td>
                <td id="taxon"><a href="/taxa/1">Danaus plexippus</a></td>
            </tr></tbody></table>
        `;

        jest.isolateModules(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
            expect(initializeLeafletMap).toHaveBeenCalledWith(37.7648, -122.463, 13, 'specimen-map');
        });
    });

    it('does nothing when gps-coordinates element is missing', () => {
        document.body.innerHTML = '';

        jest.isolateModules(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
            expect(initializeLeafletMap).not.toHaveBeenCalled();
        });
    });
});
