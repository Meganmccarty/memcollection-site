import { SpecimenLabel } from '../types/specimen-label';

function buildTaxon(label: SpecimenLabel): string {
    if (!label.taxon) return '';

    const { trinomial, binomial, name } = label.taxon;

    if (trinomial) return `<i>${trinomial}</i>`;
    if (binomial) return `<i>${binomial}</i>`;
    if (label.genus) return `<i>${name}</i>`;
    return name;
}

function buildDeterminer(label: SpecimenLabel): string {
    if (!label.determiner_firstname || !label.determiner_lastname) return '';
    return `${label.determiner_firstname} ${label.determiner_lastname} ${label.determined_year}`;
}

function buildLocationLine(label: SpecimenLabel): string {
    const country = label.country ? `${label.country_abbr}:` : '';
    const state = label.state ? `${label.state_abbr}:` : '';
    return `${country} ${state} ${label.county_full_name}`;
}

function buildGPS(label: SpecimenLabel): string {
    const lat = label.gps_lat ? `${label.gps_lat}` : '';
    const long = label.gps_long ? `${label.gps_long}` : '';
    return `${lat} ${long}`;
}

function buildTemperature(label: SpecimenLabel): string {
    return label.temperature ? `${label.temp_C} (${label.temp_F})` : '';
}

function buildLabel(label: SpecimenLabel): string {
    const locationLine = buildLocationLine(label);
    const gps = buildGPS(label);
    const temperature = buildTemperature(label);
    const taxon = buildTaxon(label);
    const determiner = buildDeterminer(label);

    return `<div class="single-label">
        <div class="label-locality">
            <span>${locationLine}</span>
            <span>${label.locality_range} ${label.locality_town}</span>
            <span>${label.locality}</span>
            <span>${gps} ${label.elevation_meters}</span>
            <span>${label.collected_date} ${label.collectors}</span>
            <span class="label-usi">${label.usi}</span>
        </div>
        <div class="label-notes">
            <span>${label.method}</span>
            <span>${label.weather} ${temperature} ${label.time_of_day}</span>
            <span>${label.habitat}</span>
        </div>
        <div class="label-taxonomy">
            <span>${taxon}</span>
            <span>${label.taxon ? label.taxon.authority : ''}</span>
            <span>${determiner}</span>
        </div>
    </div>`;
}

/**
 * Transforms specimen data into labels that can be printed
 */
export function transformData(data: SpecimenLabel[]) {
    const labelOutput = document.getElementById('label-output');
    if (!labelOutput || !labelOutput.previousElementSibling) return;

    // Clear out old labels
    labelOutput.innerHTML = '';

    const renderedLabels = data.map((label) => buildLabel(label));
    labelOutput.innerHTML = renderedLabels.join('');

    const countMessage = `${renderedLabels.length} labels generated for the above data`;

    // Tell the user how many labels were generated
    labelOutput.previousElementSibling.innerHTML = countMessage;
}
