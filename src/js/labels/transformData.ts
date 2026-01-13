export function transformData(data: any) {
    const labels = data.items;
    const transformedData = labels.map((label: any) => {
        const country = label.country ? `${label.country.abbr}:` : '';
        const state = label.state ? `${label.state.abbr}:` : '';
        const county = label.county ? label.county.full_name : '';

        const range = label.locality && label.locality.range ? label.locality.range : '';
        const town = label.locality && label.locality.town ? label.locality.town : '';

        const locality = label.locality && label.locality.name ? label.locality.name : '';

        const gpsLatitude = label.gps && label.gps.latitude ? `${label.gps.latitude}°N` : '';
        const gpsLongitude = label.gps && label.gps.longitude ? `${Math.abs(label.gps.longitude)}°W` : '';
        const elevation = label.gps && label.gps.elevation ? `${label.gps.elevation}m` : '';

        const temperature = label.temperature ? `${label.temp_C} (${label.temp_F})` : '';

        let taxon;

        if (label.taxon) {
            if (label.taxon.trinomial) {
                taxon = `<i>${label.taxon.trinomial}</i>`;
            } else if (label.taxon.binomial) {
                taxon = `<i>${label.taxon.binomial}</i>`;
            } else if (label.genus && label.genus.name) {
                taxon = `<i>${label.taxon.name}</i>`;
            } else {
                taxon = label.taxon.name;
            }
        } else {
            taxon = '';
        }

        const authority = label.taxon && label.taxon.authority ? label.taxon.authority : '';
        const determiner = label.determiner
            ? `<span>${label.determiner.first_name} ${label.determiner.last_name} ${label.determined_year}</span>`
            : '';

        return `<div class="single-label">
            <div class="label-locality">
                <span>
                    ${country}
                    ${state}
                    ${county}
                </span>
                <span>
                    ${range}
                    ${town}
                </span>
                <span>
                    ${locality}
                </span>
                <span>
                    ${gpsLatitude}
                    ${gpsLongitude}
                    ${elevation}
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
                    ${authority}
                </span>
                ${determiner}
            </div>
        </div>`;
    });

    const labelOutput = document.getElementById('label-output');
    if (labelOutput && labelOutput.previousElementSibling) {
        // Clear out old labels
        labelOutput.innerHTML = '';

        // Update number of labels generated
        labelOutput.previousElementSibling.innerHTML = `${transformedData.length} labels generated for the above data`;

        // Add each label to the output element
        transformedData.forEach((label: any) => {
            labelOutput.innerHTML += label;
        });
    }
}
