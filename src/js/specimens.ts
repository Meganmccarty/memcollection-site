import L from 'leaflet';
import { Specimen } from './types/specimen-abbr';

/**
 * Fetches specimen data from the /specimens-data.js page
 * @returns - A JSON object containing all of the specimens
 */
export async function fetchSpecimens(): Promise<Specimen[]> {
    // Fetch and return the specimens
    const response = await fetch('/specimens-data.js');
    const data = await response.json();
    return data;
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
 * @param icon - The icon added to the map (either blue or pink)
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

        // Store the specimen's taxon information in a variable
        let { taxon } = specimen;

        // If the specimen's taxon is at genus or below, then it needs to be italicized
        if (specimen.italics) {
            taxon = `<i>${specimen.taxon}</i>`;
        }

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
    const pinkIcon: L.Icon = createMarker('/assets/uxwing/map-pin-icon-pink.svg');

    // Create some empty arrays that will hold identified and unidentified specimens
    const identified: Specimen[] = [];
    const unidentified: Specimen[] = [];

    // Now, go through the specimens with GPS data and push each one into either the identified
    // or unidentified array
    specimensWithGPS.map((specimen: Specimen) => {
        if (specimen.identified) {
            identified.push(specimen);
        } else {
            unidentified.push(specimen);
        }

        return specimen;
    });

    // Clear out all of the current map markers
    markerGroup.clearLayers();

    // Now, add the new map markers for the identified and unidentified specimens
    addSpecimenMarker(blueIcon, identified, markerGroup);
    addSpecimenMarker(pinkIcon, unidentified, markerGroup);
    // addSpecimenMarker(blue, identified, markerGroup);
    // addSpecimenMarker(pink, unidentified, markerGroup);
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

        // Create empty variables to store the cell values
        let cellAValue = '';
        let cellBValue = '';
        // Now, set the above variables to the lowercased text content of the cells (if the cells
        // have data)
        if (cellA.textContent) {
            cellAValue = cellA.textContent.toLowerCase();
        }
        if (cellB.textContent) {
            cellBValue = cellB.textContent.toLowerCase();
        }

        // Variable for holding the number that determines the sort direction
        let result = 0;

        // Switch statement for the actual sorting
        // The multiplier is used to toggle ascending/descending (is set to either 1 or -1)
        switch (true) {
            case cellAValue > cellBValue:
                result = 1 * multiplier;
                break;
            case cellAValue < cellBValue:
                result = -1 * multiplier;
                break;
            case cellAValue === cellBValue:
                result = 0;
                break;
            default:
                break;
        }

        // Return the sort number
        return result;
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
    newTableRows.forEach((newTableRow) => {
        tableBody.appendChild(newTableRow);
    });
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
    // Add text to element's inner text
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
    // Filters the specimens array based on inputs in the filters form;
    // values to filter by include taxon, state, date, and identified/unidentified state
    const filteredSpecimens = specimens.filter((specimen) => (
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
    return filteredSpecimens;
}

/**
 * Filters the specimens in the specimen table
 * @param filteredSpecimens - The array of filtered specimens
 * @param specimens - The original array of specimens
 * @param tableBodyRows - The NodeList of table rows
 */
export async function filterTable(
    filteredSpecimens: Specimen[],
    specimens: Specimen[],
    // tableBodyRows: NodeListOf<HTMLTableRowElement>,
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
        if (headerState === 'ascending') {
            multiplier = 1;
        } else if (headerState === 'descending') {
            multiplier = -1;
        }

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
    }

    // First, filter the specimens based on headerValue
    filteredSpecimens.sort((a: any, b: any): number => {
        const aValue = a[headerValue];
        const bValue = b[headerValue];
        let result = 0;
        switch (true) {
            case aValue > bValue:
                result = 1 * multiplier;
                break;
            case aValue < bValue:
                result = -1 * multiplier;
                break;
            case aValue === bValue:
                result = 0;
                break;
            default:
                break;
        }
        return result;
    });
    // Store the unique specimen identifiers in an array
    const ids = filteredSpecimens.map((specimen) => specimen.usi);
    // Create an empty array for the table rows
    const rows: any[] = [];

    // If the filteredSpecimens array is truthy, create
    if (filteredSpecimens) {
        // For each filtered specimen, find its corresponding table row and push it to the rows
        // array
        ids.forEach((id) => {
            const newTableRows = Array.from(tableBodyRows);
            const filteredTableRows = newTableRows.find((row) => (
                row.cells[0].textContent?.includes(id)));
            rows.push(filteredTableRows);
        });

        // Clear out the table body to make way for the filtered rows
        tableBody.innerHTML = '';
        // Add the filtered rows to the table body
        rows.forEach((row) => {
            tableBody.appendChild(row);
        });
    }
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

    // Create an empty variable to hold a number representing ascending (1) or descending (-1) state
    let multiplier: number;

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
        multiplier = -1;
    } else {
        header?.setAttribute('aria-sort', 'ascending');
        headerBtn.firstElementChild?.removeAttribute('hidden');
        multiplier = 1;
    }

    return multiplier;
}

/**
 * Sets up the Leaflet map that will display the specimen markers
 * @returns - The newly-created Leaflet map
 */
export function initializeLeafletMap(lat: number, long: number, zoom: number): L.Map {
    // Create the Leaflet map and set its default position and zoom
    const map = L.map(
        'map',
        {
            preferCanvas: true,
            scrollWheelZoom: true,
        },
    ).setView([lat, long], zoom);
    // ).setView([50.000, -104.180], 3);

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
    const satelliteGroup = L.layerGroup([satelliteView, satelliteViewLabels, satelliteViewRoads]);

    // Set up the baseMap object with the streetView and satelliteGroup tile layers
    const baseMaps = {
        'Street View': streetView,
        'Satellite View': satelliteGroup,
    };

    // Add the baseMaps to the Leaflet map
    L.control.layers(baseMaps).addTo(map);

    // Create and add a reset button to the Leaflet map
    const resetMapBtn = document.getElementById('reset-map-button');
    resetMapBtn?.addEventListener('click', () => {
        map.setView([lat, long], zoom);
    });

    const bottomLeftControls = document.getElementById('bottom-left-controls');
    const bottomLeft = document.querySelector('div.leaflet-bottom.leaflet-left');

    if (bottomLeft && bottomLeftControls) {
        bottomLeftControls.removeAttribute('hidden');
        bottomLeft.append(bottomLeftControls);
    }

    return map;
}

export function createSpecimenTableRows(filteredSpecimens: Specimen[]): void {
    const tableBody = document.querySelector('table tbody');

    filteredSpecimens.forEach((specimen: Specimen) => {
        const tableRow = document.createElement('tr');
        const tableDataUsi = document.createElement('td');
        const tableDataTaxon = document.createElement('td');
        const tableDataCommonName = document.createElement('td');
        const tableDataCountry = document.createElement('td');
        const tableDataState = document.createElement('td');
        const tableDataLocality = document.createElement('td');
        const tableDataDate = document.createElement('td');

        tableDataUsi.innerHTML = `<a href="/specimens/${specimen.usi.toLowerCase()}">${specimen.usi}</a>`;
        tableDataTaxon.innerText = specimen.taxon;
        if (specimen.italics) {
            tableDataTaxon.classList.add('italics');
        }
        tableDataCommonName.innerText = specimen.common_name;
        tableDataCountry.innerText = specimen.country;
        tableDataState.innerText = specimen.state;
        tableDataLocality.innerText = specimen.locality;
        tableDataDate.innerText = specimen.date;

        tableRow.appendChild(tableDataUsi);
        tableRow.appendChild(tableDataTaxon);
        tableRow.appendChild(tableDataCommonName);
        tableRow.appendChild(tableDataCountry);
        tableRow.appendChild(tableDataState);
        tableRow.appendChild(tableDataLocality);
        tableRow.appendChild(tableDataDate);

        tableBody?.appendChild(tableRow);
    });
}

export function toggleLoader(loading: boolean) {
    const loader = document.getElementById('loader');

    if (loader) {
        if (loading) {
            loader.classList.remove('hide');
        } else {
            loader.classList.add('hide');
        }
    }
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
) {
    // Destructure the arrays containing the input fields and input checkboxes
    const [speciesInput, stateInput, dateInput]: HTMLInputElement[] = inputFields;
    const [idInput, unidInput]: HTMLInputElement[] = inputCheckboxes;

    // Save the values from the input elements
    const speciesValue = speciesInput.value.toLowerCase();
    const stateValue = stateInput.value.toLowerCase();
    const dateValue = dateInput.value.toString().toLowerCase();
    const idInputChecked = idInput.checked;
    const unidInputChecked = unidInput.checked;

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
    const GPSCount = getCount(specimensWithGPS).toString();
    const allCount = getCount(filteredSpecimens).toString();
    const GPSCountSpan = document.getElementById('specimen-count-gps');
    const allCountSpan = document.getElementById('specimen-count-all');

    if (GPSCountSpan) {
        setInnerText(GPSCountSpan, GPSCount);
        GPSCountSpan.innerText += ' specimens';
    }
    if (allCountSpan) {
        setInnerText(allCountSpan, allCount);
        allCountSpan.innerText += ' specimens';
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

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize a Leaflet map
    const map = initializeLeafletMap(50.000, -104.180, 3);
    // Create a layerGroup for the markers (so that they can be cleared when filters are applied)
    const markers = L.layerGroup().addTo(map);

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
    if (speciesInput.value !== '' || stateInput.value !== '' || dateInput.value !== '') {
        filterSpecimensInMapAndTable(
            [speciesInput, stateInput, dateInput],
            [idInput, unidInput],
            specimens,
            markers,
        );
    } else {
        toggleLoader(false);
    }

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
});
