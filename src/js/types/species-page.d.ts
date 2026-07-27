/**
 * This is a more abbreviated interface for a SpeciesPage object. It's used
 * on the species search page.
*/
export interface SpeciesPage {
    title: string,
    slug: string,
    order: {
        name: string,
        common_name: string,
        authority: string,
    },
    family: {
        name: string,
        common_name: string,
        authority: string,
    },
    subfamily: {
        name: string,
        common_name: string,
        authority: string,
    },
    tribe: {
        name: string,
        common_name: string,
        authority: string,
    },
    genus: {
        name: string,
        common_name: string,
        authority: string,
    },
    species: {
        name: string,
        binomial: string,
        common_name: string,
        authority: string,
        mona?: string,
        p3?: string,
        ps?: string
    },
    subspecies: {
        name: string,
        trinomial: string,
        common_name: string,
        authority: string,
        mona?: string,
        p3?: string,
        ps?: string
    }[]
}
