import { SpecimenLabel } from '../types/specimen-label';

/**
 * Transforms specimen data into labels that can be printed
 */
export function transformData(data: SpecimenLabel[]) {
    const labelOutput = document.getElementById('label-output');
    if (!labelOutput || !labelOutput.previousElementSibling) return;

    // Clear out old labels
    labelOutput.innerHTML = '';

    const labels = data;

    const transformedData = labels.map((label: any) => {
        const country = label.country ? `${label.country_abbr}:` : '';
        const state = label.state ? `${label.state_abbr}:` : '';
        const county = label.county_full_name;

        const gpsLatitude = label.gps_lat ? `${label.gps_lat}°N` : '';
        const gpsLongitude = label.gps_long ? `${Math.abs(label.gps_long)}°W` : '';

        const temperature = label.temperature ? `${label.temp_C} (${label.temp_F})` : '';

        let taxon;

        if (label.taxon) {
            if (label.taxon.trinomial) {
                taxon = `<i>${label.taxon.trinomial}</i>`;
            } else if (label.taxon.binomial) {
                taxon = `<i>${label.taxon.binomial}</i>`;
            } else if (label.genus) {
                taxon = `<i>${label.taxon.name}</i>`;
            } else {
                taxon = label.taxon.name;
            }
        } else {
            taxon = '';
        }

        const determiner = label.determiner_firstname && label.determiner_lastname
            ? `<span>${label.determiner_firstname} ${label.determiner_lastname} ${label.determined_year}</span>`
            : '';

        return `<div class="single-label">
            <div class="label-locality">
                <span>
                    ${country}
                    ${state}
                    ${county}
                </span>
                <span>
                    ${label.locality_range}
                    ${label.locality_town}
                </span>
                <span>
                    ${label.locality}
                </span>
                <span>
                    ${gpsLatitude}
                    ${gpsLongitude}
                    ${label.elevation_meters}
                </span>
                <span>
                    ${label.collected_date} ${label.collectors}
                </span>
                <span class="label-usi">
                    ${label.usi}
                </span>
            </div>
            <div class="label-notes">
                <span>
                    ${label.method}
                </span>
                <span>
                    ${label.weather} ${temperature}
                    ${label.time_of_day}
                </span>
                <span>
                    ${label.habitat}
                </span>
            </div>
            <div class="label-taxonomy">
                <span>
                    ${taxon}
                </span>
                <span>
                    ${label.taxon ? label.taxon.authority : ''}
                </span>
                ${determiner}
            </div>
        </div>`;
    });

    labelOutput.innerHTML = transformedData.join('');

    // Tell the user how many labels were generated
    labelOutput.previousElementSibling.innerHTML = `${transformedData.length} labels generated for the above data`;
}
