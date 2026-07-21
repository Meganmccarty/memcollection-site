/** @jest-environment jsdom */
import { expect } from '@jest/globals';

import { addChangeEvent, handleSubmit, resetForm } from './formData';
import { transformData } from './transformData';
import { SpecimenLabel } from '../types/specimen-label';

jest.mock('../labels/transformData', () => ({
    transformData: jest.fn(),
}));

jest.useFakeTimers();

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
    collected_date: '12 June 2022',
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

describe('addChangeEvent', () => {
    it('updates formData when an input value changes', () => {
        const input = document.createElement('input');
        input.name = 'species';
        const inputs = [input] as unknown as NodeListOf<HTMLInputElement>;

        addChangeEvent(inputs);

        input.value = 'plexippus';
        input.dispatchEvent(new Event('change'));

        // formData is internal, so we verify indirectly via handleSubmit/transformData
        handleSubmit({ preventDefault: jest.fn() } as unknown as SubmitEvent, [mockSpecimen]);
        jest.runAllTimers();

        expect(transformData).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ species: 'plexippus' }),
            ]),
        );
    });

    it('attaches listeners to select elements', () => {
        const select = document.createElement('select');
        select.name = 'country';
        const option = document.createElement('option');
        option.value = 'USA';
        select.appendChild(option);
        const selects = [select] as unknown as NodeListOf<HTMLSelectElement>;

        addChangeEvent(selects);

        select.value = 'USA';
        select.dispatchEvent(new Event('change'));

        handleSubmit({ preventDefault: jest.fn() } as unknown as SubmitEvent, [mockSpecimen]);
        jest.runAllTimers();

        expect(transformData).toHaveBeenCalled();
    });
});

describe('handleSubmit', () => {
    beforeEach(() => {
        resetForm();
        jest.clearAllMocks();
    });

    it('prevents the default form submission', () => {
        const preventDefault = jest.fn();
        handleSubmit({ preventDefault } as unknown as SubmitEvent, [mockSpecimen]);
        expect(preventDefault).toHaveBeenCalled();
    });

    it('calls transformData with all specimens when form is empty', () => {
        handleSubmit({ preventDefault: jest.fn() } as unknown as SubmitEvent, [mockSpecimen]);
        jest.runAllTimers();
        expect(transformData).toHaveBeenCalledWith([mockSpecimen]);
    });

    it('filters specimens based on entered form values', () => {
        const input = document.createElement('input');
        input.name = 'species';
        addChangeEvent([input] as unknown as NodeListOf<HTMLInputElement>);
        input.value = 'plexippus';
        input.dispatchEvent(new Event('change'));

        const nonMatchingSpecimen = { ...mockSpecimen, species: 'archippus' };

        handleSubmit(
            { preventDefault: jest.fn() } as unknown as SubmitEvent,
            [mockSpecimen, nonMatchingSpecimen],
        );
        jest.runAllTimers();

        expect(transformData).toHaveBeenCalledWith([mockSpecimen]);
    });

    it('filters case-insensitively', () => {
        const input = document.createElement('input');
        input.name = 'species';
        addChangeEvent([input] as unknown as NodeListOf<HTMLInputElement>);
        input.value = 'PLEXIPPUS';
        input.dispatchEvent(new Event('change'));

        handleSubmit({ preventDefault: jest.fn() } as unknown as SubmitEvent, [mockSpecimen]);
        jest.runAllTimers();

        expect(transformData).toHaveBeenCalledWith([mockSpecimen]);
    });

    it('debounces rapid submissions', () => {
        const preventDefault = jest.fn();
        handleSubmit({ preventDefault } as unknown as SubmitEvent, [mockSpecimen]);
        handleSubmit({ preventDefault } as unknown as SubmitEvent, [mockSpecimen]);
        handleSubmit({ preventDefault } as unknown as SubmitEvent, [mockSpecimen]);

        jest.runAllTimers();

        expect(transformData).toHaveBeenCalledTimes(1);
    });
});

describe('resetForm', () => {
    it('clears formData so all specimens are returned after reset', () => {
        const input = document.createElement('input');
        input.name = 'species';
        addChangeEvent([input] as unknown as NodeListOf<HTMLInputElement>);
        input.value = 'plexippus';
        input.dispatchEvent(new Event('change'));

        resetForm();

        handleSubmit({ preventDefault: jest.fn() } as unknown as SubmitEvent, [mockSpecimen]);
        jest.runAllTimers();

        expect(transformData).toHaveBeenCalledWith([mockSpecimen]);
    });
});
