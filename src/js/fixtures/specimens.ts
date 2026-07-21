import { Specimen } from '../types/specimen-abbr';

export const mockSpecimen: Specimen = {
    usi: 'USI-001',
    taxon: 'Danaus plexippus',
    common_name: 'Monarch',
    italics: true,
    identified: true,
    country: 'USA',
    state: 'California',
    state_abbr: 'CA',
    locality: 'Golden Gate Park',
    date: '12 Jun 2022',
    full_date: '12 June 2022',
    gps: {
        lat: 37.7648,
        long: -122.4630,
        elevation: '50m',
    },
};

export const mockUnidentifiedSpecimen: Specimen = {
    ...mockSpecimen,
    usi: 'USI-002',
    taxon: 'Nymphalidae',
    common_name: '',
    italics: false,
    identified: false,
};

export const mockSpecimenNoGPS: Specimen = {
    ...mockSpecimen,
    usi: 'USI-003',
    gps: {
        lat: 0,
        long: 0,
        elevation: '',
    },
};

export const mockSpecimens: Specimen[] = [
    mockSpecimen,
    mockUnidentifiedSpecimen,
    mockSpecimenNoGPS,
];
