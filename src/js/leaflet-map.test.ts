/** @jest-environment jsdom */
import { expect } from '@jest/globals';
import L from 'leaflet';
import { createMarker, initializeLeafletMap } from './leaflet-map';

const mockSetView = jest.fn().mockReturnThis();
const mockAddTo = jest.fn().mockReturnThis();
const mockMap = {
    setView: mockSetView,
    addTo: mockAddTo,
};
const mockTileLayer = { addTo: mockAddTo };
const mockLayerGroup = {};
const mockControl = { addTo: mockAddTo };
const mockIcon = { iconUrl: '' };

jest.mock('leaflet', () => ({
    map: jest.fn(() => mockMap),
    tileLayer: jest.fn(() => mockTileLayer),
    layerGroup: jest.fn(() => mockLayerGroup),
    control: {
        layers: jest.fn(() => mockControl),
    },
    icon: jest.fn((options) => ({ ...mockIcon, ...options })),
    marker: jest.fn(() => ({
        addTo: mockAddTo,
        bindPopup: jest.fn().mockReturnThis(),
    })),
}));

function setupDOM() {
    document.body.innerHTML = `
        <div id="map"></div>
        <button id="reset-map-button">Reset</button>
        <div id="bottom-left-controls" hidden></div>
        <div class="leaflet-bottom leaflet-left"></div>
    `;
}

describe('createMarker', () => {
    it('creates a Leaflet icon with the given URL', () => {
        const icon = createMarker('/assets/blue-pin.svg');
        expect(L.icon).toHaveBeenCalledWith(expect.objectContaining({
            iconUrl: '/assets/blue-pin.svg',
        }));
        expect(icon).toBeDefined();
    });

    it('creates an icon with the correct size and anchor values', () => {
        createMarker('/assets/blue-pin.svg');
        expect(L.icon).toHaveBeenCalledWith(expect.objectContaining({
            iconSize: [25, 85],
            iconAnchor: [12.5, 60],
            popupAnchor: [0, -35],
        }));
    });
});

describe('initializeLeafletMap', () => {
    beforeEach(() => {
        setupDOM();
        jest.clearAllMocks();
        mockSetView.mockReturnThis();
        mockAddTo.mockReturnThis();
        (L.map as jest.Mock).mockReturnValue(mockMap);
        (L.tileLayer as unknown as jest.Mock).mockReturnValue(mockTileLayer);
        (L.layerGroup as jest.Mock).mockReturnValue(mockLayerGroup);
        (L.control.layers as jest.Mock).mockReturnValue(mockControl);
    });

    it('initializes the Leaflet map with the correct coordinates and zoom', () => {
        initializeLeafletMap(37.7648, -122.4630, 13, 'map');
        expect(L.map).toHaveBeenCalledWith('map', expect.objectContaining({
            preferCanvas: true,
            scrollWheelZoom: true,
        }));
        expect(mockSetView).toHaveBeenCalledWith([37.7648, -122.4630], 13);
    });

    it('adds street view and satellite tile layers', () => {
        initializeLeafletMap(37.7648, -122.4630, 13, 'map');
        expect(L.tileLayer).toHaveBeenCalledTimes(4); // street, satellite, labels, roads
        expect(L.layerGroup).toHaveBeenCalled();
        expect(L.control.layers).toHaveBeenCalledWith({
            'Street View': expect.any(Object),
            'Satellite View': expect.any(Object),
        });
    });

    it('returns the map instance', () => {
        const map = initializeLeafletMap(37.7648, -122.4630, 13, 'map');
        expect(map).toBe(mockMap);
    });

    it('resets the map view when the reset button is clicked', () => {
        initializeLeafletMap(37.7648, -122.4630, 13, 'map');
        document.getElementById('reset-map-button')?.click();
        expect(mockSetView).toHaveBeenLastCalledWith([37.7648, -122.4630], 13);
    });

    it('reveals and appends bottom left controls', () => {
        initializeLeafletMap(37.7648, -122.4630, 13, 'map');
        const controls = document.getElementById('bottom-left-controls');
        expect(controls?.hasAttribute('hidden')).toBe(false);
        const bottomLeft = document.querySelector('div.leaflet-bottom.leaflet-left');
        expect(bottomLeft?.contains(controls)).toBe(true);
    });
});
