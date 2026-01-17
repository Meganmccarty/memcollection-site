/**
 * Type Specimen (pun 100% intended ;) ).
 * This is a more abbreviated interface for a Specimen object, it's used on the
 * specimen page (map + table).
*/
export interface Specimen {
    usi: string,
    taxon: string,
    italics: boolean,
    identified: boolean,
    common_name: string,
    country: string,
    state: string,
    state_abbr: string,
    locality: string,
    gps: {
        lat: number,
        long: number,
        elevation: string
    }
    date: string,
    full_date: string
}
