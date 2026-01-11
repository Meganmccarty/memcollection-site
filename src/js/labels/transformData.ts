export function transformData(data: Array<object>) {
    const transformedData = data.map((label: any) => `
        <div class="single-label">
            <div class="label-locality">
                <span>
                    ${label.country ? `${label.country.abbr}:` : ''}
                    ${label.state ? `${label.state.abbr}:` : ''}
                    ${label.county ? label.county.county_abbr : ''}
                </span>
                <span>
                    ${label.locality ? label.locality.range : ''}
                    ${label.locality ? label.locality.town : ''}
                </span>
                <span>
                    ${label.locality ? label.locality.name : ''}
                </span>
                <span>
                    ${label.gps && label.gps.latitude ? `${label.gps.latitude}°N` : ''}
                    ${label.gps && label.gps.longitude ? `${Math.abs(label.gps.longitude)}°W` : ''}
                    ${label.gps && label.gps.elevation ? `${label.gps.elevation}m` : ''}
                </span>
                <span>
                    ${label.collected_date} ${label.display_collectors}
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
                    ${label.weather} ${label.temp_C} ${label.temp_F ? `(${label.temp_F})` : ''}
                    ${label.time_of_day}
                </span>
                <span>
                    ${label.habitat}
                </span>
            </div>
            <div class="label-taxonomy">
                ${label.taxon.name
                    ? `
                        <span>
                            ${label.genus
                                ? `<i>${label.taxon.name}</i>`
                                : label.taxon.name}
                        </span>
                        <span>
                            ${label.taxon.authority}
                        </span>
                    `
                    : ''}
                ${label.display_determiner
                    ? `<span>${label.display_determiner} ${label.determined_year}</span>`
                    : ''}
            </div>
        </div>
    `);

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
