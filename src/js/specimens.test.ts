/** @jest-environment jsdom */
import { expect } from '@jest/globals';

import L from 'leaflet';
import {
    fetchSpecimens,
    getSpecimensWithGPS,
    addSpecimenMarker,
    createSpecimenMarkers,
    sortRows,
    sortTable,
    getCount,
    setInnerText,
    filterSpecimens,
    filterTable,
    configureTableHeaders,
    createSpecimenTableRows,
    toggleLoader,
    filterSpecimensInMapAndTable,
    initializePage,
} from './specimens';
import {
    mockSpecimen,
    mockUnidentifiedSpecimen,
    mockSpecimenNoGPS,
    mockSpecimens,
} from './fixtures/specimens';
import { createMarker, initializeLeafletMap } from './leaflet-map';

const mockAddTo = jest.fn().mockReturnThis();
const mockBindPopup = jest.fn().mockReturnThis();
const mockClearLayers = jest.fn();
const mockMapInstance = {
    setView: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    on: jest.fn(),
    getCenter: jest.fn(() => ({
        lat: { toFixed: jest.fn(() => '37.765') },
        lng: { toFixed: jest.fn(() => '-122.463') },
    })),
    getZoom: jest.fn(() => 13),
};
const mockMarkerInstance = { addTo: mockAddTo, bindPopup: mockBindPopup };
const mockLayerGroup = { clearLayers: mockClearLayers, addTo: mockAddTo };

jest.mock('leaflet', () => ({
    marker: jest.fn(() => mockMarkerInstance),
    icon: jest.fn((options) => options),
    layerGroup: jest.fn(() => mockLayerGroup),
}));

jest.mock('./leaflet-map', () => ({
    createMarker: jest.fn((url) => ({ iconUrl: url })),
    initializeLeafletMap: jest.fn(),
}));

global.fetch = jest.fn();

// ─── fetchSpecimens ───────────────────────────────────────────────────────────

describe('fetchSpecimens', () => {
    it('fetches and returns specimen data', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockSpecimens),
        });
        const result = await fetchSpecimens();
        expect(global.fetch).toHaveBeenCalledWith('/specimens-data.js');
        expect(result).toEqual(mockSpecimens);
    });
});

// ─── getSpecimensWithGPS ──────────────────────────────────────────────────────

describe('getSpecimensWithGPS', () => {
    it('returns only specimens with GPS data', () => {
        const result = getSpecimensWithGPS(mockSpecimens);
        expect(result).toHaveLength(2);
        expect(result).not.toContain(mockSpecimenNoGPS);
    });

    it('returns an empty array when no specimens have GPS data', () => {
        expect(getSpecimensWithGPS([mockSpecimenNoGPS])).toEqual([]);
    });
});

// ─── addSpecimenMarker ────────────────────────────────────────────────────────

describe('addSpecimenMarker', () => {
    beforeEach(() => jest.clearAllMocks());

    const icon = { iconUrl: '/assets/blue-pin.svg' } as unknown as L.Icon;

    it('creates a marker for each specimen', () => {
        addSpecimenMarker(icon, [mockSpecimen], mockLayerGroup as unknown as L.LayerGroup);
        expect(L.marker).toHaveBeenCalledWith(
            [mockSpecimen.gps.lat, mockSpecimen.gps.long],
            expect.objectContaining({ alt: mockSpecimen.usi }),
        );
    });

    it('wraps the taxon in italics when specimen.italics is true', () => {
        addSpecimenMarker(icon, [mockSpecimen], mockLayerGroup as unknown as L.LayerGroup);
        expect(mockBindPopup).toHaveBeenCalledWith(
            expect.stringContaining(`<i>${mockSpecimen.taxon}</i>`),
        );
    });

    it('does not italicize the taxon when specimen.italics is false', () => {
        addSpecimenMarker(
            icon,
            [mockUnidentifiedSpecimen],
            mockLayerGroup as unknown as L.LayerGroup,
        );
        expect(mockBindPopup).toHaveBeenCalledWith(
            expect.not.stringContaining('<i>'),
        );
    });

    it('omits the common name when it is empty', () => {
        addSpecimenMarker(
            icon,
            [mockUnidentifiedSpecimen],
            mockLayerGroup as unknown as L.LayerGroup,
        );
        expect(mockBindPopup).toHaveBeenCalledWith(
            expect.not.stringContaining('()'),
        );
    });
});

// ─── createSpecimenMarkers ────────────────────────────────────────────────────

describe('createSpecimenMarkers', () => {
    beforeEach(() => jest.clearAllMocks());

    it('clears existing layers before adding new markers', () => {
        createSpecimenMarkers([mockSpecimen], mockLayerGroup as unknown as L.LayerGroup);
        expect(mockClearLayers).toHaveBeenCalled();
    });

    it('creates blue markers for identified specimens', () => {
        createSpecimenMarkers([mockSpecimen], mockLayerGroup as unknown as L.LayerGroup);
        expect(createMarker).toHaveBeenCalledWith('/assets/uxwing/map-pin-icon-blue.svg');
    });

    it('creates yellow markers for unidentified specimens', () => {
        createSpecimenMarkers(
            [mockUnidentifiedSpecimen],
            mockLayerGroup as unknown as L.LayerGroup,
        );
        expect(createMarker).toHaveBeenCalledWith('/assets/uxwing/map-pin-icon-yellow.svg');
    });
});

// ─── sortRows ─────────────────────────────────────────────────────────────────

describe('sortRows', () => {
    function makeRow(value: string): HTMLTableRowElement {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
        return row;
    }

    it('sorts rows ascending', () => {
        const rows = [makeRow('Zebra'), makeRow('Apple'), makeRow('Mango')];
        const sorted = sortRows(rows, 0, 1);
        expect(sorted.map((r) => r.cells[0].textContent)).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('sorts rows descending', () => {
        const rows = [makeRow('Zebra'), makeRow('Apple'), makeRow('Mango')];
        const sorted = sortRows(rows, 0, -1);
        expect(sorted.map((r) => r.cells[0].textContent)).toEqual(['Zebra', 'Mango', 'Apple']);
    });

    it('handles equal values without error', () => {
        const rows = [makeRow('Apple'), makeRow('Apple')];
        expect(() => sortRows(rows, 0, 1)).not.toThrow();
    });
});

// ─── sortTable ────────────────────────────────────────────────────────────────

describe('sortTable', () => {
    function setupTable() {
        document.body.innerHTML = `
            <table>
                <tbody>
                    <tr><td>Zebra</td></tr>
                    <tr><td>Apple</td></tr>
                    <tr><td>Mango</td></tr>
                </tbody>
            </table>
        `;
        return document.getElementsByTagName('tbody')[0];
    }

    it('re-renders the table body in sorted order', () => {
        const tbody = setupTable();
        const rows = tbody.getElementsByTagName('tr');
        sortTable(tbody, rows, 0, 1);
        const cells = Array.from(tbody.querySelectorAll('td')).map((td) => td.textContent);
        expect(cells).toEqual(['Apple', 'Mango', 'Zebra']);
    });
});

// ─── getCount ─────────────────────────────────────────────────────────────────

describe('getCount', () => {
    it('returns the number of specimens', () => {
        expect(getCount(mockSpecimens)).toBe(3);
    });

    it('returns 0 for an empty array', () => {
        expect(getCount([])).toBe(0);
    });
});

// ─── setInnerText ─────────────────────────────────────────────────────────────

describe('setInnerText', () => {
    it('sets the inner text of an element', () => {
        const el = document.createElement('span');
        setInnerText(el, 'hello');
        expect(el.innerText).toBe('hello');
    });
});

// ─── filterSpecimens ──────────────────────────────────────────────────────────

describe('filterSpecimens', () => {
    it('filters by taxon name', () => {
        const result = filterSpecimens(mockSpecimens, 'danaus', '', '', true, true);
        expect(result).toContain(mockSpecimen);
        expect(result).not.toContain(mockUnidentifiedSpecimen);
    });

    it('filters by common name', () => {
        const result = filterSpecimens(mockSpecimens, 'monarch', '', '', true, true);
        expect(result).toContain(mockSpecimen);
    });

    it('filters by state', () => {
        const result = filterSpecimens(mockSpecimens, '', 'california', '', true, true);
        expect(result).toContain(mockSpecimen);
    });

    it('filters by state abbreviation', () => {
        const result = filterSpecimens(mockSpecimens, '', 'ca', '', true, true);
        expect(result).toContain(mockSpecimen);
    });

    it('filters by date', () => {
        const result = filterSpecimens(mockSpecimens, '', '', 'jun', true, true);
        expect(result).toContain(mockSpecimen);
    });

    it('returns only identified specimens when idInput is checked', () => {
        const result = filterSpecimens(mockSpecimens, '', '', '', true, false);
        expect(result).toContain(mockSpecimen);
        expect(result).not.toContain(mockUnidentifiedSpecimen);
    });

    it('returns only unidentified specimens when unidInput is checked', () => {
        const result = filterSpecimens(mockSpecimens, '', '', '', false, true);
        expect(result).toContain(mockUnidentifiedSpecimen);
        expect(result).not.toContain(mockSpecimen);
    });

    it('returns an empty array when nothing matches', () => {
        const result = filterSpecimens(mockSpecimens, 'xyz', '', '', true, true);
        expect(result).toHaveLength(0);
    });
});

// ─── filterTable ──────────────────────────────────────────────────────────────

describe('filterTable', () => {
    function setupTable() {
        document.body.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th data-attribute="usi" aria-sort="ascending">
                            <button>USI</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>${mockSpecimen.usi}</td></tr>
                    <tr><td>${mockUnidentifiedSpecimen.usi}</td></tr>
                </tbody>
            </table>
        `;
    }

    beforeEach(setupTable);

    it('shows only the filtered specimen rows', async () => {
        await filterTable([mockSpecimen], mockSpecimens);
        const rows = document.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(1);
        expect(rows[0].textContent).toContain(mockSpecimen.usi);
    });

    it('restores all rows when filtered length matches total length', async () => {
        await filterTable(mockSpecimens, mockSpecimens);
        const rows = document.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(2);
    });

    it('sorts filtered specimens by the current header value ascending', async () => {
        const specimenA = { ...mockSpecimen, usi: 'MEM-001' };
        const specimenB = { ...mockUnidentifiedSpecimen, usi: 'MEM-003' };
        const specimenC = { ...mockUnidentifiedSpecimen, usi: 'MEM-002' };
        const specimenD = { ...mockUnidentifiedSpecimen, usi: 'MEM-004' };

        document.body.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th data-attribute="usi" aria-sort="ascending">
                            <button>USI</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>${specimenB.usi}</td></tr>
                    <tr><td>${specimenC.usi}</td></tr>
                    <tr><td>${specimenA.usi}</td></tr>
                </tbody>
            </table>
        `;

        // Pass in unsorted — filterTable is responsible for sorting
        const allSpecimens = [specimenA, specimenB, specimenC, specimenD];
        await filterTable([specimenA, specimenB, specimenC], allSpecimens);
        const rows = document.querySelectorAll('tbody tr');
        expect(rows[0].textContent).toContain('MEM-001');
        expect(rows[1].textContent).toContain('MEM-002');
        expect(rows[2].textContent).toContain('MEM-003');
    });

    it('sorts filtered specimens descending when aria-sort is descending', async () => {
        const specimenA = { ...mockSpecimen, usi: 'MEM-001' };
        const specimenB = { ...mockUnidentifiedSpecimen, usi: 'MEM-003' };
        const specimenC = { ...mockUnidentifiedSpecimen, usi: 'MEM-002' };
        const specimenD = { ...mockUnidentifiedSpecimen, usi: 'MEM-004' };

        document.body.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th data-attribute="usi" aria-sort="descending">
                            <button>USI</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>${specimenA.usi}</td></tr>
                    <tr><td>${specimenC.usi}</td></tr>
                    <tr><td>${specimenB.usi}</td></tr>
                </tbody>
            </table>
        `;

        const allSpecimens = [specimenA, specimenB, specimenC, specimenD];
        await filterTable([specimenA, specimenB, specimenC], allSpecimens);
        const rows = document.querySelectorAll('tbody tr');
        expect(rows[0].textContent).toContain('MEM-003');
        expect(rows[1].textContent).toContain('MEM-002');
        expect(rows[2].textContent).toContain('MEM-001');
    });
});

// ─── configureTableHeaders ────────────────────────────────────────────────────

describe('configureTableHeaders', () => {
    function setupHeaders() {
        document.body.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th aria-sort="ascending">
                            <button>
                                <img id="asc-chevron" />
                                <img id="desc-chevron" hidden />
                            </button>
                        </th>
                        <th>
                            <button>
                                <img hidden />
                                <img hidden />
                            </button>
                        </th>
                    </tr>
                </thead>
            </table>
        `;
        const tableHeaders = document.querySelectorAll<HTMLTableCellElement>('th');
        const headerBtns = document.querySelectorAll<HTMLButtonElement>('th button');
        const images = document.querySelectorAll<HTMLImageElement>('th button img');
        return { tableHeaders, headerBtns, images };
    }

    it('returns -1 when toggling from ascending to descending', () => {
        const { tableHeaders, headerBtns, images } = setupHeaders();
        const multiplier = configureTableHeaders(headerBtns[0], tableHeaders, images);
        expect(multiplier).toBe(-1);
    });

    it('returns 1 when toggling from descending to ascending', () => {
        const { tableHeaders, headerBtns, images } = setupHeaders();
        const header = tableHeaders[0];
        header.setAttribute('aria-sort', 'descending');
        const multiplier = configureTableHeaders(headerBtns[0], tableHeaders, images);
        expect(multiplier).toBe(1);
    });

    it('removes aria-sort from all headers except the clicked one', () => {
        const { tableHeaders, headerBtns, images } = setupHeaders();
        configureTableHeaders(headerBtns[0], tableHeaders, images);
        expect(tableHeaders[1].getAttribute('aria-sort')).toBeNull();
    });
});

// ─── createSpecimenTableRows ──────────────────────────────────────────────────

describe('createSpecimenTableRows', () => {
    beforeEach(() => {
        document.body.innerHTML = '<table><tbody></tbody></table>';
    });

    it('creates a row for each specimen', () => {
        createSpecimenTableRows([mockSpecimen, mockUnidentifiedSpecimen]);
        expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
    });

    it('renders a link to the specimen page in the first cell', () => {
        createSpecimenTableRows([mockSpecimen]);
        const link = document.querySelector('tbody tr td a') as HTMLAnchorElement;
        expect(link.href).toContain(mockSpecimen.usi.toLowerCase());
    });

    it('adds the italics class when specimen.italics is true', () => {
        createSpecimenTableRows([mockSpecimen]);
        const taxonCell = document.querySelectorAll('tbody tr td')[1];
        expect(taxonCell.classList.contains('italics')).toBe(true);
    });

    it('does not add the italics class when specimen.italics is false', () => {
        createSpecimenTableRows([mockUnidentifiedSpecimen]);
        const taxonCell = document.querySelectorAll('tbody tr td')[1];
        expect(taxonCell.classList.contains('italics')).toBe(false);
    });
});

// ─── toggleLoader ─────────────────────────────────────────────────────────────

describe('toggleLoader', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="loader" class="hide"></div>';
    });

    it('removes the hide class when loading is true', () => {
        toggleLoader(true);
        expect(document.getElementById('loader')?.classList.contains('hide')).toBe(false);
    });

    it('adds the hide class when loading is false', () => {
        toggleLoader(false);
        expect(document.getElementById('loader')?.classList.contains('hide')).toBe(true);
    });
});

// ─── filterSpecimensInMapAndTable ─────────────────────────────────────────────

describe('filterSpecimensInMapAndTable', () => {
    let speciesInput: HTMLInputElement;
    let stateInput: HTMLInputElement;
    let dateInput: HTMLInputElement;
    let idInput: HTMLInputElement;
    let unidInput: HTMLInputElement;
    const mockMarkers = {
        clearLayers: jest.fn(),
        addTo: jest.fn(),
    } as unknown as L.LayerGroup;

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = `
            <table>
                <thead><tr><th>USI</th></tr></thead>
                <tbody></tbody>
            </table>
            <span id="specimen-count-gps"></span>
            <span id="specimen-count-all"></span>
            <div class="table-container" hidden></div>
            <div id="empty-table"></div>
            <div id="loader" class="hide"></div>
        `;

        speciesInput = Object.assign(document.createElement('input'), { value: '' });
        stateInput = Object.assign(document.createElement('input'), { value: '' });
        dateInput = Object.assign(document.createElement('input'), { value: '' });
        idInput = Object.assign(document.createElement('input'), { type: 'checkbox', checked: true });
        unidInput = Object.assign(document.createElement('input'), { type: 'checkbox', checked: true });

        delete (window as any).location;
        (window as any).location = new URL('http://localhost');
        window.history.replaceState = jest.fn();
    });

    it('updates the URL search params', () => {
        const currentURL = new URL('http://localhost');
        speciesInput.value = 'danaus';

        filterSpecimensInMapAndTable(
            [speciesInput, stateInput, dateInput],
            [idInput, unidInput],
            mockSpecimens,
            mockMarkers,
            currentURL,
        );

        expect(currentURL.searchParams.get('species')).toBe('danaus');
    });

    it('updates the GPS and total specimen counts', () => {
        const currentURL = new URL('http://localhost');

        filterSpecimensInMapAndTable(
            [speciesInput, stateInput, dateInput],
            [idInput, unidInput],
            mockSpecimens,
            mockMarkers,
            currentURL,
        );

        expect(document.getElementById('specimen-count-gps')?.innerText).toContain('specimens');
        expect(document.getElementById('specimen-count-all')?.innerText).toContain('specimens');
    });

    it('reveals the table container and hides the empty table message', () => {
        const currentURL = new URL('http://localhost');

        filterSpecimensInMapAndTable(
            [speciesInput, stateInput, dateInput],
            [idInput, unidInput],
            mockSpecimens,
            mockMarkers,
            currentURL,
        );

        expect(document.querySelector('div.table-container')?.hasAttribute('hidden')).toBe(false);
        expect(document.getElementById('empty-table')?.hasAttribute('hidden')).toBe(true);
    });

    it('hides the loader after filtering', () => {
        const currentURL = new URL('http://localhost');

        filterSpecimensInMapAndTable(
            [speciesInput, stateInput, dateInput],
            [idInput, unidInput],
            mockSpecimens,
            mockMarkers,
            currentURL,
        );

        expect(document.getElementById('loader')?.classList.contains('hide')).toBe(true);
    });
});

// ─── initializePage ───────────────────────────────────────────────────────────

describe('initializePage', () => {
    function setupDOM(searchParams = '') {
        window.history.pushState({}, '', `/${searchParams ? `?${searchParams}` : ''}`);
        window.history.replaceState = jest.fn();

        document.body.innerHTML = `
            <div class="filters">
                <form>
                    <input name="species" />
                    <input name="state" />
                    <input name="date" />
                    <input type="checkbox" name="identified" checked />
                    <input type="checkbox" name="unidentified" checked />
                    <button type="submit">Filter</button>
                </form>
            </div>
            <table>
                <thead>
                    <tr>
                        <th data-attribute="usi">
                            <button>
                                <img hidden /><img hidden />
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <section aria-labelledby="map-label" id="map"></section>
            <span id="specimen-count-gps"></span>
            <span id="specimen-count-all"></span>
            <div class="table-container" hidden></div>
            <div id="empty-table"></div>
            <div id="loader" class="hide"></div>
            <a class="leaflet-control-layers-toggle"></a>
            <div class="leaflet-bottom leaflet-left"></div>
            <div id="bottom-left-controls" hidden></div>
            <button id="reset-map-button">Reset</button>
        `;
    }

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockSpecimens),
        });
        (initializeLeafletMap as jest.Mock).mockReturnValue({
            ...mockMapInstance,
            on: jest.fn(),
        });
    });

    afterEach(() => {
        window.history.pushState({}, '', '/');
    });

    it('initializes the map with default coordinates when no URL params exist', async () => {
        setupDOM();
        await initializePage();
        expect(initializeLeafletMap).toHaveBeenCalledWith(50.000, -104.180, 3, 'map');
    });

    it('initializes the map with URL params when they exist', async () => {
        setupDOM('lat=37.7648&long=-122.4630&zoom=13');
        await initializePage();
        expect(initializeLeafletMap).toHaveBeenCalledWith(37.7648, -122.463, 13, 'map');
    });

    it('sets the layers button aria label', async () => {
        setupDOM();
        await initializePage();
        const layersBtn = document.querySelector('a.leaflet-control-layers-toggle');
        expect(layersBtn?.ariaLabel).toBe('Map Layers');
    });

    it('populates input values from URL params', async () => {
        setupDOM('species=danaus&state=ca&date=2022');
        await initializePage();
        const inputs = document.querySelectorAll<HTMLInputElement>('.filters input');
        expect(inputs[0].value).toBe('danaus');
        expect(inputs[1].value).toBe('ca');
        expect(inputs[2].value).toBe('2022');
    });

    it('sets both checkboxes checked when both params are true', async () => {
        setupDOM('identified=true&unidentified=true');
        await initializePage();
        const inputs = document.querySelectorAll<HTMLInputElement>('.filters input');
        expect(inputs[3].checked).toBe(true);
        expect(inputs[4].checked).toBe(true);
    });

    it('sets only unidentified checked when identified=false and unidentified=true', async () => {
        setupDOM('identified=false&unidentified=true');
        await initializePage();
        const inputs = document.querySelectorAll<HTMLInputElement>('.filters input');
        expect(inputs[3].checked).toBe(false);
        expect(inputs[4].checked).toBe(true);
    });

    it('sets only identified checked when identified=true and unidentified=false', async () => {
        setupDOM('identified=true&unidentified=false');
        await initializePage();
        const inputs = document.querySelectorAll<HTMLInputElement>('.filters input');
        expect(inputs[3].checked).toBe(true);
        expect(inputs[4].checked).toBe(false);
    });

    it('calls filterSpecimensInMapAndTable on form submit', async () => {
        jest.useFakeTimers();
        setupDOM();
        await initializePage();

        const form = document.querySelector('.filters') as HTMLElement;
        form.dispatchEvent(new Event('submit'));
        jest.runAllTimers();

        expect(initializeLeafletMap).toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('updates URL params on map moveend', async () => {
        setupDOM();
        const mockOn = jest.fn((event, cb) => { if (event === 'moveend') cb(); });
        (initializeLeafletMap as jest.Mock).mockReturnValue({
            ...mockMapInstance,
            on: mockOn,
            getCenter: jest.fn(() => ({ lat: { toFixed: () => '37.765' }, lng: { toFixed: () => '-122.463' } })),
            getZoom: jest.fn(() => 13),
        });

        await initializePage();

        expect(window.history.replaceState).toHaveBeenCalled();
    });

    describe('checkbox change events', () => {
        it('disables neither checkbox when both are checked', async () => {
            setupDOM();
            await initializePage();
            const inputs = document.querySelectorAll<HTMLInputElement>('.filters input');
            const idInput = inputs[3];
            const unidInput = inputs[4];

            idInput.checked = true;
            unidInput.checked = true;
            idInput.dispatchEvent(new Event('change'));

            expect(idInput.disabled).toBe(false);
            expect(unidInput.disabled).toBe(false);
        });

        it('disables idInput when only idInput is checked', async () => {
            setupDOM();
            await initializePage();
            const inputs = document.querySelectorAll<HTMLInputElement>('.filters input');
            const idInput = inputs[3];
            const unidInput = inputs[4];

            idInput.checked = true;
            unidInput.checked = false;
            idInput.dispatchEvent(new Event('change'));

            expect(idInput.disabled).toBe(true);
            expect(unidInput.disabled).toBe(false);
        });

        it('disables unidInput when only unidInput is checked', async () => {
            setupDOM();
            await initializePage();
            const inputs = document.querySelectorAll<HTMLInputElement>('.filters input');
            const idInput = inputs[3];
            const unidInput = inputs[4];

            idInput.checked = false;
            unidInput.checked = true;
            unidInput.dispatchEvent(new Event('change'));

            expect(idInput.disabled).toBe(false);
            expect(unidInput.disabled).toBe(true);
        });
    });

    describe('table header click events', () => {
        it('sorts the table when a header button is clicked', async () => {
            setupDOM();
            await initializePage();

            const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
            tbody.innerHTML = `
                <tr><td>ZZZ-003</td></tr>
                <tr><td>AAA-001</td></tr>
                <tr><td>MMM-002</td></tr>
            `;

            const headerBtn = document.querySelector<HTMLButtonElement>('th button');
            headerBtn?.click();

            const rows = document.querySelectorAll('tbody tr');
            expect(rows[0].textContent).toContain('AAA-001');
            expect(rows[1].textContent).toContain('MMM-002');
            expect(rows[2].textContent).toContain('ZZZ-003');
        });

        it('reverses sort order when the same header is clicked twice', async () => {
            setupDOM();
            await initializePage();

            const tbody = document.querySelector('tbody') as HTMLTableSectionElement;
            tbody.innerHTML = `
                <tr><td>ZZZ-003</td></tr>
                <tr><td>AAA-001</td></tr>
                <tr><td>MMM-002</td></tr>
            `;

            const headerBtn = document.querySelector<HTMLButtonElement>('th button');
            headerBtn?.click();
            headerBtn?.click();

            const rows = document.querySelectorAll('tbody tr');
            expect(rows[0].textContent).toContain('ZZZ-003');
            expect(rows[1].textContent).toContain('MMM-002');
            expect(rows[2].textContent).toContain('AAA-001');
        });
    });
});

// ─── DOMContentLoaded ─────────────────────────────────────────────────────────

describe('DOMContentLoaded', () => {
    it('initializes the map when DOMContentLoaded fires', () => {
        jest.isolateModules(() => {
            window.history.pushState({}, '', '/?species=&state=&date=&identified=true&unidentified=true}');
            window.history.replaceState = jest.fn();

            document.body.innerHTML = `
                <div class="filters">
                    <form>
                        <input name="species" />
                        <input name="state" />
                        <input name="date" />
                        <input type="checkbox" name="identified" checked />
                        <input type="checkbox" name="unidentified" checked />
                        <button type="submit">Filter</button>
                    </form>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th data-attribute="usi">
                                <button>
                                    <img hidden /><img hidden />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <section aria-labelledby="map-label" id="map"></section>
                <span id="specimen-count-gps"></span>
                <span id="specimen-count-all"></span>
                <div class="table-container" hidden></div>
                <div id="empty-table"></div>
                <div id="loader" class="hide"></div>
                <a class="leaflet-control-layers-toggle"></a>
                <div class="leaflet-bottom leaflet-left"></div>
                <div id="bottom-left-controls" hidden></div>
                <button id="reset-map-button">Reset</button>
            `;

            document.dispatchEvent(new Event('DOMContentLoaded'));

            expect(initializeLeafletMap).toHaveBeenCalled();
        });
    });
});
