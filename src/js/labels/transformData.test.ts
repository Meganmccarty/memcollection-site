/** @jest-environment jsdom */
import { expect } from '@jest/globals';

import { transformData } from './transformData';
import { SpecimenLabel } from '../types/specimen-label';

const mockSpecimen: SpecimenLabel = {
    order: 'Lepidoptera',
    family: 'Nymphalidae',
    subfamily: '',
    tribe: '',
    genus: 'Danaus',
    species: 'plexippus',
    subspecies: '',
    taxon: {
        name: 'Danaus',
        binomial: 'Danaus plexippus',
        common_name: 'Monarch',
        authority: 'Linnaeus',
    },
    determiner_firstname: 'Jane',
    determiner_lastname: 'Doe',
    determined_year: 2022,
    usi: 'USI-001',
    preparer_firstname: '',
    preparer_lastname: '',
    preparation: '',
    preparation_date: '',
    sex: 'Female',
    stage: 'Adult',
    labels_printed: false,
    labeled: false,
    photographed: false,
    identified: true,
    country: 'USA',
    country_abbr: 'US',
    state: 'California',
    state_abbr: 'CA',
    county: 'San Francisco',
    county_abbr: 'SF',
    county_full_name: 'San Francisco County',
    locality: 'Golden Gate Park',
    locality_range: '',
    locality_town: 'San Francisco',
    gps_lat: '37.7648',
    gps_long: '-122.4630',
    elevation: '50',
    elevation_meters: '50m',
    collecting_trip: '',
    day: 12,
    month: 'June',
    year: 2022,
    collected_date: '12-Jun-2022',
    collector_firstname: 'John',
    collector_lastname: 'Smith',
    collectors: 'John Smith',
    method: 'Net',
    weather: 'Sunny',
    temperature: '72',
    temp_F: '72°F',
    temp_C: '22°C',
    time_of_day: 'Morning',
    habitat: 'Meadow',
    notes: '',
};

function setupDOM() {
    document.body.innerHTML = `
        <p id="label-count"></p>
        <div id="label-output"></div>
    `;
}

describe('transformData', () => {
    beforeEach(setupDOM);

    describe('label generation', () => {
        it('renders the correct number of labels', () => {
            transformData([mockSpecimen, mockSpecimen]);
            const labels = document.querySelectorAll('.single-label');
            expect(labels).toHaveLength(2);
        });

        it('displays the label count message', () => {
            transformData([mockSpecimen]);
            const countEl = document.getElementById('label-output')?.previousElementSibling;
            expect(countEl?.innerHTML).toBe('1 labels generated for the above data');
        });

        it('clears previous labels before rendering new ones', () => {
            transformData([mockSpecimen]);
            transformData([]);
            const labels = document.querySelectorAll('.single-label');
            expect(labels).toHaveLength(0);
        });

        it('returns early and does not throw when label-output is missing', () => {
            document.body.innerHTML = '';
            expect(() => transformData([mockSpecimen])).not.toThrow();
        });
    });

    describe('taxonomy label generation', () => {
        it('renders the binomial taxon name in italics', () => {
            transformData([mockSpecimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).toContain('<i>Danaus plexippus</i>');
        });

        it('prefers trinomial over binomial when both are present', () => {
            const specimen = {
                ...mockSpecimen,
                taxon: { ...mockSpecimen.taxon, trinomial: 'Danaus plexippus plexippus' },
            };
            transformData([specimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).toContain('<i>Danaus plexippus plexippus</i>');
        });

        it('renders genus name in italics when no binomial or trinomial', () => {
            const specimen = {
                ...mockSpecimen,
                taxon: { name: 'Danaus', common_name: 'Monarch', authority: 'Linnaeus' },
            };
            transformData([specimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).toContain('<i>Danaus</i>');
        });

        it('renders the taxon name without italics when no genus, binomial, or trinomial', () => {
            const specimen = {
                ...mockSpecimen,
                genus: '',
                species: '',
                taxon: {
                    name: 'Nymphalidae',
                    binomial: '',
                    common_name: 'Brush-footed Butterflies',
                    authority: 'Linnaeus',
                },
            };
            transformData([specimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).toContain('Nymphalidae');
        });

        it('renders no taxon name or authority if either are missing', () => {
            const specimen = {
                ...mockSpecimen,
                order: '',
                family: '',
                genus: '',
                species: '',
                taxon: {},
            } as SpecimenLabel;
            transformData([specimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).not.toContain('<i>Danaus plexippus</i>');
            expect(taxonomy?.innerHTML).not.toContain('Linnaeus');
        });

        it('renders the taxon authority', () => {
            transformData([mockSpecimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).toContain('Linnaeus');
        });

        it('renders the determiner when both first and last name are present', () => {
            transformData([mockSpecimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).toContain('Jane Doe 2022');
        });

        it('renders no determiner if either determiner first or last name missing', () => {
            const specimen = {
                ...mockSpecimen,
                determiner_firstname: '',
                determiner_lastname: '',
            };
            transformData([specimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).not.toContain('Jane Doe 2022');
        });

        it('omits the determiner when firstname is missing', () => {
            const specimen = { ...mockSpecimen, determiner_firstname: '' };
            transformData([specimen]);
            const taxonomy = document.querySelector('.label-taxonomy');
            expect(taxonomy?.innerHTML).not.toContain('Doe');
        });
    });

    describe('locality label generation', () => {
        it('renders an empty string if no country or state', () => {
            const specimen = {
                ...mockSpecimen,
                country: '',
                state: '',
                county: '',
            };
            transformData([specimen]);
            const locality = document.querySelector('.label-locality');
            expect(locality?.innerHTML).not.toContain('US:');
            expect(locality?.innerHTML).not.toContain('CA:');
        });

        it('renders GPS coordinates with the minus sign', () => {
            transformData([mockSpecimen]);
            const locality = document.querySelector('.label-locality');
            expect(locality?.innerHTML).toContain('37.7648');
            expect(locality?.innerHTML).toContain('-122.4630');
        });

        it('renders an empty string if no GPS coordinates', () => {
            const specimen = {
                ...mockSpecimen,
                gps_lat: '',
                gps_long: '',
            };
            transformData([specimen]);
            const locality = document.querySelector('.label-locality');
            expect(locality?.innerHTML).not.toContain('37.7648');
            expect(locality?.innerHTML).not.toContain('-122.4630');
        });

        it('renders the collected date', () => {
            transformData([mockSpecimen]);
            const date = document.querySelector('.label-locality');
            expect(date?.innerHTML).toContain('12-Jun-2022');
            expect(date?.innerHTML).not.toContain('ecl');
        });

        it('renders the collected date with "ecl" if specimen was reared', () => {
            const specimen = {
                ...mockSpecimen,
                habitat: 'Ex larva on unknown plant',
            };
            transformData([specimen]);
            const date = document.querySelector('.label-locality');
            expect(date?.innerHTML).toContain('ecl 12-Jun-2022');
        });

        it('renders the collected date with "ecl" if specimen eclosed', () => {
            const specimen = {
                ...mockSpecimen,
                habitat: 'Eclosed from Black Swallowtail pupa',
            };
            transformData([specimen]);
            const date = document.querySelector('.label-locality');
            expect(date?.innerHTML).toContain('ecl 12-Jun-2022');
        });

        it('renders the collected date with "ecl" if specimen ordered as pupa', () => {
            const specimen = {
                ...mockSpecimen,
                habitat: 'Ordered as pupa from Jane Doe',
            };
            transformData([specimen]);
            const date = document.querySelector('.label-locality');
            expect(date?.innerHTML).toContain('ecl 12-Jun-2022');
        });

        it('renders the USI in the label-usi span', () => {
            transformData([mockSpecimen]);
            const usi = document.querySelector('.label-usi');
            expect(usi?.innerHTML).toContain('USI-001');
        });
    });

    describe('notes label generation', () => {
        it('renders temperature in both C and F', () => {
            transformData([mockSpecimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('22°C (72°F)');
        });

        it('omits temperature when not present', () => {
            const specimen = { ...mockSpecimen, temperature: '' };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).not.toContain('°C');
        });

        it('renders a period at the end of time if time present', () => {
            transformData([mockSpecimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Sunny 22°C (72°F) Morning.');
        });

        it('renders a period at the end of temperature if time not present', () => {
            const specimen = {
                ...mockSpecimen,
                time_of_day: '',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Sunny 22°C (72°F).');
        });

        it('renders a period at the end of weather if time and temperature not present', () => {
            const specimen = {
                ...mockSpecimen,
                temperature: '',
                time_of_day: '',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Sunny.');
        });

        it('renders no period for weather/temp/time sentence if weather, temperature, and time not present', () => {
            const specimen = {
                ...mockSpecimen,
                weather: '',
                temperature: '',
                time_of_day: '',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Net. Meadow');
        });

        it('renders no period after method if nothing else comes after it', () => {
            const specimen = {
                ...mockSpecimen,
                weather: '',
                temperature: '',
                time_of_day: '',
                habitat: '',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Net');
        });

        it('renders no period for method if method empty but label has other data', () => {
            const specimen = {
                ...mockSpecimen,
                method: '',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Sunny 22°C (72°F) Morning. Meadow');
            expect(notes?.innerHTML).not.toContain('Net');
        });

        it('renders period after method if more data comes after it', () => {
            transformData([mockSpecimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Net. Sunny 22°C (72°F) Morning. Meadow');
        });

        it('strips out "&nbsp;" from habitat', () => {
            const specimen = {
                ...mockSpecimen,
                habitat: 'Found in&nbsp;forest',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Found in forest');
            expect(notes?.innerHTML).not.toContain('&nbsp;');
        });

        it('strips out "data-block-key" p element from habitat', () => {
            const specimen = {
                ...mockSpecimen,
                habitat: '<p data-block-key="12345">Found in forest</p>',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Found in forest');
            expect(notes?.innerHTML).not.toContain('data-block-key');
        });

        it('strips out p element from habitat', () => {
            const specimen = {
                ...mockSpecimen,
                habitat: '<p>Found in forest</p>',
            };
            transformData([specimen]);
            const notes = document.querySelector('.label-notes');
            expect(notes?.innerHTML).toContain('Found in forest');
            expect(notes?.innerHTML).not.toContain('<p>Found in forest</p>');
        });
    });
});
