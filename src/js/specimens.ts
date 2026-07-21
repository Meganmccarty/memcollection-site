import L from 'leaflet';
import { Specimen } from './types/specimen-abbr';
import { createMarker, initializeLeafletMap } from './leaflet-map';

/**
 * Fetches specimen data from the /specimens-data.js page
 * @returns - A JSON object containing all of the specimens
 */
export async function fetchSpecimens(): Promise<Specimen[]> {
    const response = await fetch('/specimens-data.js');
    return response.json();
}

/**
 * Filters an array of specimens to include only those with GPS data
 * @param specimens - The array of specimens to filter
 * @returns - The filtered array of specimens
 */
export function getSpecimensWithGPS(specimens: Specimen[]): Specimen[] {
    return specimens.filter((specimen: Specimen) => specimen.gps && specimen.gps.lat);
}

/**
 * Adds a marker on the Leaflet map representing where a specimen was collected
 * @param icon - The icon added to the map (either blue or yellow)
 * @param specimens - An array containing all of the specimens that need markers
 * @param markerGroup - The Leaflet layer group containing all of the markers
 */
 export function addSpecimenMarker(
    icon: L.Icon,
    specimens: Specimen[],
    markerGroup: L.LayerGroup,
): void {
    // Loop through the specimens array
    specimens.forEach((specimen: Specimen) => {
        // Create a marker for the specimen
        const marker: L.Marker = L.marker(
            [
                specimen.gps.lat,
                specimen.gps.long,
            ],
            {
                alt: `${specimen.usi}`,
                icon,
            },
        );

        // If the specimen's taxon is at genus or below, then it needs to be italicized
        const taxon = specimen.italics
            ? `<i>${specimen.taxon}</i>`
            : specimen.taxon;

        // Add a popup to the specimen's marker
        // Includes a specimen's taxon info, GPS coordinates, elevation, date, and unique specimen
        // identifier
        marker.bindPopup(`
            ${taxon} ${specimen.common_name ? `(${specimen.common_name})` : ''}
            <br>
            ${specimen.gps.lat} ${specimen.gps.long} ${specimen.gps.elevation}
            <br>
            ${specimen.date} <a href="/specimens/${specimen.usi.toLowerCase()}">${specimen.usi}</a>`);

        // Add the newly-created marker to the markerGroup layer
        // (Makes it easy to clear the layer whenever specimens are filtered)
        marker.addTo(markerGroup);
    });
}

/**
 * Creates a set of markers for both identified and unidentified specimens
 * @param specimens - An array containing all of the specimens that need markers
 * @param markerGroup - The Leaflet layer group containing all of the markers
 */
export function createSpecimenMarkers(
    specimensWithGPS: Specimen[],
    markerGroup: L.LayerGroup,
): void {
    // Create Leaflet icons for identified and unidentified specimens
    const blueIcon: L.Icon = createMarker('/assets/uxwing/map-pin-icon-blue.svg');
    const yellowIcon: L.Icon = createMarker('/assets/uxwing/map-pin-icon-yellow.svg');

    // Create some empty arrays that will hold identified and unidentified specimens
    const identified: Specimen[] = [];
    const unidentified: Specimen[] = [];

    // Now, go through the specimens with GPS data and push each one into either the identified
    // or unidentified array
    specimensWithGPS.forEach((specimen: Specimen) => {
        if (specimen.identified) {
            identified.push(specimen);
        } else {
            unidentified.push(specimen);
        }
    });

    // Clear out all of the current map markers
    markerGroup.clearLayers();

    // Now, add the new map markers for the identified and unidentified specimens
    addSpecimenMarker(blueIcon, identified, markerGroup);
    addSpecimenMarker(yellowIcon, unidentified, markerGroup);
}

export function sortRows(
    rows: HTMLTableRowElement[],
    index: number,
    multiplier: number,
): HTMLTableRowElement[] {
    // Execute the sort method on the table rows array
    return rows.sort((rowA: HTMLTableRowElement, rowB: HTMLTableRowElement): number => {
        // Grab the two cells to compare
        const cellA: HTMLTableCellElement = rowA.getElementsByTagName('td')[index];
        const cellB: HTMLTableCellElement = rowB.getElementsByTagName('td')[index];

        // Grab the two cells values
        const cellAValue = cellA.textContent?.toLowerCase() ?? '';
        const cellBValue = cellB.textContent?.toLowerCase() ?? '';

        if (cellAValue > cellBValue) return 1 * multiplier;
        if (cellAValue < cellBValue) return -1 * multiplier;
        return 0;
    });
}

/**
 * Sorts the specimen table based on the value of one of the table's headers
 * @param tableBody - The tbody element
 * @param tableRows - An HTMLCollection of table rows within the tbody
 * @param index - A number indicating the column to sort by
 * @param multiplier - A number indicating the direction to sort (ascending/descending)
 */
export function sortTable(
    tableBody: HTMLTableSectionElement,
    tableRows: HTMLCollectionOf<HTMLTableRowElement>,
    index: number,
    multiplier: number,
): void {
    // Sort the table rows
    const tableRowsArray = Array.from(tableRows);
    const newTableRows = sortRows(tableRowsArray, index, multiplier);

    // Empty out the table body element to make space for the newly sorted table rows
    const tbody = tableBody;
    tbody.innerHTML = '';
    // Now, add the sorted table rows
    newTableRows.forEach((row) => tbody.appendChild(row));
}

/**
 * Gets the count of specimens in an array
 * @param specimens - The array of specimens that need to be counted
 * @returns - The number of specimens in the array
 */
export function getCount(specimens: Specimen[]): number {
    return specimens.length;
}

/**
 * Sets the inner text of a given element
 * @param element - The element whose inner text needs to be set
 * @param text - The text to add to the element
 * @returns - The element with the newly-added inner text
 */
export function setInnerText(element: HTMLElement, text: string): void {
    const el = element;
    el.innerText = text;
}

/**
 * Filters an array of specimens given a series of input and checkbox values
 * @param specimens - The array of specimens to filter
 * @param speciesValue - The value for the species input field
 * @param stateValue - The value for the state input field
 * @param dateValue - The value for the date input field
 * @param idInputChecked - A boolean for the identified checkbox
 * @param unidInputChecked - A boolean for the unidentified checkbox
 * @returns - The array of filtered specimens
 */
export function filterSpecimens(
    specimens: Specimen[],
    speciesValue: string,
    stateValue: string,
    dateValue: string,
    idInputChecked: boolean,
    unidInputChecked: boolean,
): Specimen[] {
    return specimens.filter((specimen) => (
        specimen.taxon.toLowerCase().includes(speciesValue)
            || specimen.common_name.toLowerCase().includes(speciesValue)
        ) && (
            specimen.state.toLowerCase() === stateValue
            || specimen.state_abbr.toLowerCase().includes(stateValue)
        ) && (
            specimen.date.toLowerCase().includes(dateValue)
            || specimen.full_date.toLowerCase().includes(dateValue)
        ) && (
            specimen.identified === idInputChecked
            || !specimen.identified === unidInputChecked
        ));
}

/**
 * Filters the specimens in the specimen table
 * @param filteredSpecimens - The array of filtered specimens
 * @param specimens - The original array of specimens
 */
export async function filterTable(
    filteredSpecimens: Specimen[],
    specimens: Specimen[],
): Promise<void> {
    // Grab the table header and body
    const tableHeaders: NodeListOf<HTMLTableCellElement> = document.querySelectorAll('table thead tr th');
    const tableBody = document.getElementsByTagName('tbody')[0];
    const tableBodyRows = tableBody?.querySelectorAll('tr');

    /**
     * Figure out how the table is currently sorted, so we can sort the filteredSpecimens array
     * by the same value. This will preserve the sort order of the table when the filtered specimens
     * are re-added to the table.
     */

    // Find the table header that is currently used to sort the table
    const header = Array.from(tableHeaders).find((tableHeader) => (
        tableHeader.getAttribute('aria-sort') !== undefined
        && tableHeader.getAttribute('aria-sort') !== null
    ));

    // Create variables to hold the header's value and its sort direction (1 = asc, -1 = desc)
    let headerValue = '';
    let multiplier = 1;

    if (header) {
        // Find the sort state of the header by its aria-sort value, then set the multiplier
        // accordingly
        const headerState = header.getAttribute('aria-sort');
        multiplier = headerState === 'descending' ? -1 : 1;

        // The .getAttribute() method returns string | null; need to ensure it's truthy before
        // saving it to the headerValue variable
        const value = header.getAttribute('data-attribute');
        if (value) {
            headerValue = value;
        }
    }

    // If the length of the filteredSpecimens array and the original specimens array is the same,
    // then no filtering has occurred; restore the table with all of the specimens
    if (filteredSpecimens.length === specimens.length) {
        tableBody.innerHTML = '';
        Array.from(tableBodyRows).forEach((row) => tableBody.appendChild(row));
        return;
    }

    // First, filter the specimens based on headerValue
    filteredSpecimens.sort((a: any, b: any): number => {
        const aValue = a[headerValue];
        const bValue = b[headerValue];
        if (aValue > bValue) return 1 * multiplier;
        if (aValue < bValue) return -1 * multiplier;
        return 0;
    });

    const ids = filteredSpecimens.map((specimen) => specimen.usi);
    const rows = ids.map((id) => (
        Array.from(tableBodyRows).find((row) => row.cells[0].textContent?.includes(id))
    )).filter((row): row is HTMLTableRowElement => row !== undefined);

    tableBody.innerHTML = '';
    rows.forEach((row) => tableBody.appendChild(row));
}

/**
 * Configures a table's headers when a header button is clicked. This includes setting aria-sort
 * on the clicked header, as well as revealing the correct sort chevron and setting the sort
 * multiplier
 * @param headerBtn - The button in the table header that was clicked
 * @param tableHeaders - A NodeList of all of the table headers
 * @param tableHeaderBtnImages - A NodeList of all of the chevron icons within each header button
 * @returns - A number representing the sort multiplier
 */
export function configureTableHeaders(
    headerBtn: HTMLButtonElement,
    tableHeaders: NodeListOf<HTMLTableCellElement>,
    tableHeaderBtnImages: NodeListOf<HTMLImageElement>,
): number {
    // On the clicked header button, get the actual header and its aria-sort state ('ascending' or
    // 'descending')
    const header: HTMLElement | null = headerBtn.parentElement;
    const state: string | null | undefined = header?.getAttribute('aria-sort');

    // Remove the aria-sort attribute from all of the table headers
    tableHeaders.forEach((tableHeader: HTMLTableCellElement) => tableHeader.removeAttribute('aria-sort'));
    // Hide all of the table header chevrons that indicate sort direction
    tableHeaderBtnImages.forEach((image: HTMLImageElement) => image.setAttribute('hidden', ''));

    // If the state is truthy (not undefined or null), then re-add the state as the value of the
    // aria-sort attribute
    if (state) {
        header?.setAttribute('aria-sort', state);
    }

    // Based on the value of aria-sort ('ascending' or 'descending'), then switch it to the
    // opposite value, while also revealing the correct chevron icon and setting the sort multiplier
    if (header?.getAttribute('aria-sort') === 'ascending') {
        header.setAttribute('aria-sort', 'descending');
        headerBtn.lastElementChild?.removeAttribute('hidden');
        return -1;
    }
        header?.setAttribute('aria-sort', 'ascending');
        headerBtn.firstElementChild?.removeAttribute('hidden');
        return 1;
}

export function createSpecimenTableRows(filteredSpecimens: Specimen[]): void {
    const tableBody = document.querySelector('table tbody');

    filteredSpecimens.forEach((specimen: Specimen) => {
        const tableRow = document.createElement('tr');

        const cells: [string, string, boolean?][] = [
            [`<a href="/specimens/${specimen.usi.toLowerCase()}">${specimen.usi}</a>`, 'innerHTML'],
            [specimen.taxon, 'innerText', specimen.italics],
            [specimen.common_name, 'innerText'],
            [specimen.country, 'innerText'],
            [specimen.state, 'innerText'],
            [specimen.locality, 'innerText'],
            [specimen.date, 'innerText'],
        ];

        cells.forEach(([value, method, italics]) => {
            const td = document.createElement('td');
            if (method === 'innerHTML') {
                td.innerHTML = value;
            } else {
                td.innerText = value;
            }

            if (italics) {
                td.classList.add('italics');
            }
            tableRow.appendChild(td);
        });

        tableBody?.appendChild(tableRow);
    });
}

export function toggleLoader(loading: boolean) {
    const loader = document.getElementById('loader');
    loader?.classList.toggle('hide', !loading);
}

/**
 * Filters the specimens in both the Leaflet map and in the table
 * @param inputFields - An array containing all of the input text fields in the filters form
 * @param inputCheckboxes - An array containing all of the input checkboxes in the filters form
 * @param specimens - An array containing all of the specimens
 * @param markers - A Leaflet layerGroup for all of the specimen markers
 */
export function filterSpecimensInMapAndTable(
    inputFields: HTMLInputElement[],
    inputCheckboxes: HTMLInputElement[],
    specimens: Specimen[],
    markers: L.LayerGroup,
    currentURL: URL,
) {
    // Destructure the arrays containing the input fields and input checkboxes
    const [speciesInput, stateInput, dateInput]: HTMLInputElement[] = inputFields;
    const [idInput, unidInput]: HTMLInputElement[] = inputCheckboxes;

    // Save the values from the input elements
    const speciesValue = speciesInput.value.toLowerCase();
    const stateValue = stateInput.value.toLowerCase();
    const dateValue = dateInput.value.toString().toLowerCase();
    const idInputChecked = !!idInput.checked;
    const unidInputChecked = !!unidInput.checked;

    currentURL.searchParams.set('species', speciesValue);
    currentURL.searchParams.set('state', stateValue);
    currentURL.searchParams.set('date', dateValue);
    currentURL.searchParams.set('identified', idInputChecked.toString());
    currentURL.searchParams.set('unidentified', unidInputChecked.toString());

    window.history.replaceState({}, '', currentURL);

    // Create an array of filtered specimens based on the values from the filter form inputs
    const filteredSpecimens = filterSpecimens(
        specimens,
        speciesValue,
        stateValue,
        dateValue,
        idInputChecked,
        unidInputChecked,
    );

    // Grab specimens with GPS data
    const specimensWithGPS = getSpecimensWithGPS(filteredSpecimens);

    // Get counts for all specimens and only specimens with GPS data
    // const GPSCount = getCount(specimensWithGPS).toString();
    // const allCount = getCount(filteredSpecimens).toString();
    const GPSCountSpan = document.getElementById('specimen-count-gps');
    const allCountSpan = document.getElementById('specimen-count-all');

    if (GPSCountSpan) {
        GPSCountSpan.innerText = `${getCount(specimensWithGPS)} specimens`;
    }
    if (allCountSpan) {
        allCountSpan.innerText = `${getCount(filteredSpecimens)} specimens`;
    }

    // Create markers on the Leaflet map for the filtered specimens
    createSpecimenMarkers(specimensWithGPS, markers);
    // Create rows in the table for the filtered specimens
    createSpecimenTableRows(filteredSpecimens);

    // Filter the specimen table
    // filterTable(filteredSpecimens, specimens, tableBodyRows);
    filterTable(filteredSpecimens, specimens);

    const tableContainer = document.querySelector('div.table-container');
    const emptyTable = document.getElementById('empty-table');
    if (tableContainer && emptyTable) {
        tableContainer.removeAttribute('hidden');
        emptyTable.setAttribute('hidden', '');
    }
    toggleLoader(false);
}

export async function initializePage() {
    const currentURL = new URL(window.location.href);

    const latParam = currentURL.searchParams.get('lat');
    const longParam = currentURL.searchParams.get('long');
    const zoomParam = currentURL.searchParams.get('zoom');

    // Initialize a Leaflet map
    let map;

    if (latParam && longParam && zoomParam) {
        map = initializeLeafletMap(
            parseFloat(latParam),
            parseFloat(longParam),
            parseInt(zoomParam, 10),
            'map',
        );
    } else {
        map = initializeLeafletMap(50.000, -104.180, 3, 'map');
        currentURL.searchParams.set('lat', '50.000');
        currentURL.searchParams.set('long', '-104.180');
        currentURL.searchParams.set('zoom', '3');
        window.history.replaceState({}, '', currentURL);
    }

    // Create a layerGroup for the markers (so that they can be cleared when filters are applied)
    const markers = L.layerGroup().addTo(map);

    // Fix missing accessible name for leaflet layers "button"
    const layersButton = document.querySelector('a.leaflet-control-layers-toggle');

    if (layersButton) {
        layersButton.ariaLabel = 'Map Layers';
    }

    // Fetch the specimens
    const specimens: Specimen[] = await fetchSpecimens();

    // Grab filter elements and save them to variables
    const filters = document.getElementsByClassName('filters')[0];
    const speciesInput: HTMLInputElement = filters.getElementsByTagName('input')[0];
    const stateInput: HTMLInputElement = filters.getElementsByTagName('input')[1];
    const dateInput: HTMLInputElement = filters.getElementsByTagName('input')[2];
    const idInput: HTMLInputElement = filters.getElementsByTagName('input')[3];
    const unidInput: HTMLInputElement = filters.getElementsByTagName('input')[4];

    // Grab certain table elements and save them to variables
    const tableHeaders: NodeListOf<HTMLTableCellElement> = document.querySelectorAll('table thead tr th');
    const tableHeaderBtns: NodeListOf<HTMLButtonElement> = document.querySelectorAll('table thead tr th button');
    const tableHeaderBtnImages: NodeListOf<HTMLImageElement> = document.querySelectorAll('table thead tr th button img');

    // Initially filter the Leaflet map and table based on the empty filters form
    const speciesParam = currentURL.searchParams.get('species');
    const stateParam = currentURL.searchParams.get('state');
    const dateParam = currentURL.searchParams.get('date');
    const identifiedParam = currentURL.searchParams.get('identified');
    const unidentifiedParam = currentURL.searchParams.get('unidentified');

    speciesInput.value = speciesParam ?? '';
    stateInput.value = stateParam ?? '';
    dateInput.value = dateParam ?? '';

    if (
        (identifiedParam === 'false' && unidentifiedParam === 'false')
        || (identifiedParam === 'true' && unidentifiedParam === 'true')
    ) {
        idInput.checked = true;
        unidInput.checked = true;
        idInput.disabled = false;
        unidInput.disabled = false;
    } else if (identifiedParam === 'false' && unidentifiedParam === 'true') {
        idInput.checked = false;
        unidInput.checked = true;
        idInput.disabled = false;
        unidInput.disabled = true;
    } else if (identifiedParam === 'true' && unidentifiedParam === 'false') {
        idInput.checked = true;
        unidInput.checked = false;
        idInput.disabled = true;
        unidInput.disabled = false;
    }

    filterSpecimensInMapAndTable(
        [speciesInput, stateInput, dateInput],
        [idInput, unidInput],
        specimens,
        markers,
        currentURL,
    );

    [idInput, unidInput].forEach((input) => {
        input.addEventListener('change', () => {
            if (idInput.checked && unidInput.checked) {
                idInput.disabled = false;
                unidInput.disabled = false;
            } else if (idInput.checked && !unidInput.checked) {
                idInput.disabled = true;
                unidInput.disabled = false;
            } else if (!idInput.checked && unidInput.checked) {
                idInput.disabled = false;
                unidInput.disabled = true;
            }
        });
    });

    // Add event listener on the filters form so that the map and table are filtered when submitted
    filters.addEventListener('submit', (e) => {
        e.preventDefault();
        toggleLoader(true);
        // Set a timeout here before filtering the specimens
        // Otherwise, the loader won't appear for some unknown reason
        setTimeout(() => {
            filterSpecimensInMapAndTable(
                [speciesInput, stateInput, dateInput],
                [idInput, unidInput],
                specimens,
                markers,
                currentURL,
            );
        }, 100);
    });

    // Add event listeners to each button in each table header
    tableHeaderBtns.forEach((headerBtn: HTMLButtonElement, index: number) => {
        headerBtn.addEventListener('click', () => {
            // Configure the table's headers (aria-sort state, sort chevron icon, and sort
            // multiplier)
            const multiplier: number = configureTableHeaders(
                headerBtn,
                tableHeaders,
                tableHeaderBtnImages,
            );

            // Grab the table's body and rows within the body
            const tableBody: HTMLTableSectionElement = document.getElementsByTagName('tbody')[0];
            const tableRows: HTMLCollectionOf<HTMLTableRowElement> = tableBody.getElementsByTagName('tr');

            // Sort the table by the value in the clicked header
            sortTable(tableBody, tableRows, index, multiplier);
        });
    });

    map.on('moveend', () => {
        const lat = map.getCenter().lat.toFixed(3);
        const long = map.getCenter().lng.toFixed(3);
        const zoom = map.getZoom();

        currentURL.searchParams.set('lat', lat);
        currentURL.searchParams.set('long', long);
        currentURL.searchParams.set('zoom', zoom.toString());
        window.history.replaceState({}, '', currentURL);
    });
}

document.addEventListener('DOMContentLoaded', async () => initializePage);
