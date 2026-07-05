/** @jest-environment jsdom */
import { expect } from '@jest/globals';

import { Rank } from './types/rank';
import {
    buildNormalizedLookup,
    buildToc,
    createCard,
    fetchSpeciesPages,
    getUniqueTaxons,
    groupAndRender,
    normalizeForParam,
    renderResults,
} from './species';

// Minimal SpeciesPage factory to keep tests readable
const makePage = (overrides: any = {}) => ({
    slug: 'battus-philenor',
    order: { name: 'Lepidoptera', common_name: 'Butterflies and Moths', authority: 'Linnaeus, 1758' },
    family: { name: 'Papilionidae', common_name: 'Swallowtails and Parnassians', authority: 'Latreille, [1802]' },
    subfamily: { name: 'Papilioninae', common_name: 'Swallowtails', authority: 'Latreille, [1802]' },
    tribe: { name: 'Troidini', common_name: null, authority: 'Talbot, 1939' },
    genus: { name: 'Battus', common_name: null, authority: 'Scopoli, 1777' },
    species: {
        binomial: 'Battus philenor',
        common_name: 'Pipevine Swallowtail',
        authority: '(Linnaeus, 1771)',
        mona: '4157.00',
        ps: '77a0001',
    },
    ...overrides,
});

describe('fetchSpeciesPages', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue([makePage()]),
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('fetches from the correct endpoint', async () => {
        await fetchSpeciesPages();
        expect(fetch).toHaveBeenCalledWith('/species-data.js');
    });

    it('returns the parsed JSON response', async () => {
        const result = await fetchSpeciesPages();
        expect(result).toEqual([makePage()]);
    });
});

describe('getUniqueTaxons', () => {
    it('returns unique orders', () => {
        const pages = [makePage(), makePage()];
        const result = getUniqueTaxons(pages, 'order');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Lepidoptera');
    });

    it('returns multiple unique orders when pages span different orders', () => {
        const pages = [
            makePage(),
            makePage({ order: { name: 'Coleoptera', common_name: 'Beetles', authority: 'Linnaeus, 1758' } }),
        ];
        const result = getUniqueTaxons(pages, 'order');
        expect(result).toHaveLength(2);
        expect(result.map((r) => r.name)).toContain('Lepidoptera');
        expect(result.map((r) => r.name)).toContain('Coleoptera');
    });

    it('returns unique families', () => {
        const pages = [makePage(), makePage()];
        const result = getUniqueTaxons(pages, 'family');
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Papilionidae');
    });

    it('returns unique genera', () => {
        const pages = [
            makePage(),
            makePage({ genus: { name: 'Papilio', common_name: null, authority: 'Linnaeus, 1758' } }),
        ];
        const result = getUniqueTaxons(pages, 'genus');
        expect(result).toHaveLength(2);
    });

    it('returns unique species using binomial', () => {
        const pages = [makePage(), makePage()];
        const result = getUniqueTaxons(pages, 'species');
        expect(result).toHaveLength(1);
        expect(result[0].binomial).toBe('Battus philenor');
    });

    it('returns multiple unique species', () => {
        const pages = [
            makePage(),
            makePage({
                species: {
                    binomial: 'Eurytides marcellus',
                    common_name: 'Zebra Swallowtail',
                    authority: '(Cramer, 1777)',
                    mona: '4184',
                    ps: '770296',
                },
            }),
        ];
        const result = getUniqueTaxons(pages, 'species');
        expect(result).toHaveLength(2);
    });

    it('returns an empty array when given no pages', () => {
        const result = getUniqueTaxons([], 'order');
        expect(result).toHaveLength(0);
    });
});

describe('buildToc', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('creates a nav element with id "toc"', () => {
        const nav = buildToc([makePage()], 'family');
        expect(nav.tagName).toBe('NAV');
        expect(nav.id).toBe('toc');
    });

    it('includes a hidden accessible label with content = "Page"', () => {
        const nav = buildToc([makePage()], 'family');
        const label = nav.querySelector('#toc-label');
        expect(label).not.toBeNull();
        expect((label as HTMLElement).hidden).toBe(true);
        expect(label?.textContent).toBe('Page');
    });

    it('uses aria-labelledby pointing to the label', () => {
        const nav = buildToc([makePage()], 'family');
        expect(nav.getAttribute('aria-labelledby')).toBe('toc-label');
    });

    it('renders the correct rank label as text', () => {
        const nav = buildToc([makePage()], 'subfamily');
        expect(nav.textContent).toContain('Table of Contents – Subfamilies');
    });

    it('renders one link per unique taxon', () => {
        const pages = [
            makePage(),
            makePage({ subfamily: { name: 'Coliadinae', common_name: null, authority: 'Swainson, 1827' } }),
        ];
        const nav = buildToc(pages, 'subfamily');
        expect(nav.querySelectorAll('a')).toHaveLength(2);
    });

    it('generates correct href anchors from taxon names', () => {
        const nav = buildToc([makePage()], 'subfamily');
        const link = nav.querySelector('a');
        expect(link?.getAttribute('href')).toBe('#papilioninae');
    });

    it('wraps genus names in an italic element', () => {
        const nav = buildToc([makePage()], 'genus');
        const italic = nav.querySelector('a i');
        expect(italic).not.toBeNull();
        expect(italic?.textContent).toBe('Battus');
    });

    it('does not italicize non-genus taxon names', () => {
        const nav = buildToc([makePage()], 'family');
        expect(nav.querySelector('a i')).toBeNull();
    });

    it('handles incertae sedis entries without italics', () => {
        const pages = [
            makePage({ tribe: { name: 'incertae sedis (Papilioninae)', common_name: null, authority: '--' } }),
        ];
        const nav = buildToc(pages, 'tribe');
        const link = nav.querySelector('a');
        expect(link?.textContent).toBe('incertae sedis (Papilioninae)');
        expect(nav.querySelector('a i')).toBeNull();
    });
});

describe('createCard', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('returns an li element', () => {
        const card = createCard(makePage());
        expect(card.tagName).toBe('LI');
    });

    it('contains a link to the correct species page URL', () => {
        const card = createCard(makePage());
        const link = card.querySelector('a');
        expect(link?.getAttribute('href')).toBe('/lepidoptera/papilionidae/battus-philenor');
    });

    it('displays the common name when one is present', () => {
        const card = createCard(makePage());
        const commonName = card.querySelector('.common-name');
        expect(commonName).not.toBeNull();
        expect(commonName?.textContent).toBe('Pipevine Swallowtail');
    });

    it('does not display a common name element when none is present', () => {
        const page = makePage({ species: { ...makePage().species, common_name: null } });
        const card = createCard(page);
        expect(card.querySelector('.common-name')).toBeNull();
    });

    it('displays the species binomial name in italics', () => {
        const card = createCard(makePage());
        const taxonName = card.querySelector('.taxon-name i');
        expect(taxonName).not.toBeNull();
        expect(taxonName?.textContent).toBe('Battus philenor');
    });

    it('displays PS and MONA numbers when both are present', () => {
        const card = createCard(makePage());
        const taxonNumbers = card.querySelector('.taxon-numbers');
        expect(taxonNumbers).not.toBeNull();
        expect(card.querySelector('.p3')?.textContent).toBe('PS# 77a0001');
        expect(card.querySelector('.mona')?.textContent).toBe('MONA# 4157.00');
    });

    it('displays taxon numbers when only PS number is present', () => {
        const page = makePage({ species: { ...makePage().species, mona: null } });
        const card = createCard(page);
        expect(card.querySelector('.taxon-numbers')).not.toBeNull();
        expect(card.querySelector('.p3')?.textContent).toBe('PS# 77a0001');
    });

    it('displays taxon numbers when only MONA number is present', () => {
        const page = makePage({ species: { ...makePage().species, ps: null } });
        const card = createCard(page);
        expect(card.querySelector('.taxon-numbers')).not.toBeNull();
        expect(card.querySelector('.mona')?.textContent).toBe('MONA# 4157.00');
    });

    it('does not display taxon numbers when neither PS nor MONA are present', () => {
        const page = makePage({ species: { ...makePage().species, ps: null, mona: null } });
        const card = createCard(page);
        expect(card.querySelector('.taxon-numbers')).toBeNull();
    });

    it('contains a placeholder SVG image', () => {
        const card = createCard(makePage());
        expect(card.querySelector('svg')).not.toBeNull();
    });

    it('the SVG is marked as aria-hidden', () => {
        const card = createCard(makePage());
        const svg = card.querySelector('svg');
        expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });
});

describe('groupAndRender', () => {
    let container;

    function setUpRendering() {
        const pages = [
            makePage(),
            makePage({
                slug: 'eurytides-marcellus',
                order: {
                    name: 'Lepidoptera',
                    common_name: 'Butterflies and Moths',
                    authority: 'Linnaeus, 1758',
                },
                family: {
                    name: 'Papilionidae',
                    common_name: 'Swallowtails and Parnassians',
                    authority: 'Latreille, [1802]',
                },
                subfamily: {
                    name: 'Papilioninae',
                    common_name: 'Swallowtails',
                    authority: 'Latreille, [1802]',
                },
                tribe: {
                    name: 'Leptocircini',
                    common_name: null,
                    authority: 'Kirby, 1896',
                },
                genus: {
                    name: 'Eurytides',
                    common_name: null,
                    authority: 'Hübner, [1821]',
                },
                species: {
                    binomial: 'Eurytides marcellus',
                    common_name: 'Zebra Swallowtail',
                    authority: '(Cramer, 1777)',
                    mona: '4184.00',
                    ps: '770296.00',
                },
            }),
        ];
        const ranks: Rank[] = ['order', 'family', 'subfamily', 'tribe', 'genus', 'species'];

        return groupAndRender({
            pages,
            headerRanks: ranks.slice(0, -1),
            rankIndex: 1,
            element: container!,
        });
    }

    beforeEach(() => {
        document.body.innerHTML = '';
        container = document.createElement('div');
        container.id = 'results';
        document.body.appendChild(container);
    });

    it('creates the correct heading structure', () => {
        setUpRendering();
        const h3 = container!.querySelectorAll('h3');
        const h4 = container!.querySelectorAll('h4');
        const h5 = container!.querySelectorAll('h5');
        const h6 = container!.querySelectorAll('h6');

        // 1 Family
        expect(h3).toHaveLength(1);
        expect(h3[0].textContent).toBe('Papilionidae Latreille, [1802] — Swallowtails and Parnassians');
        expect(h3[0].id).toBe('papilionidae');
        // 1 Subfamily
        expect(h4).toHaveLength(1);
        expect(h4[0].textContent).toBe('Papilioninae Latreille, [1802] — Swallowtails');
        expect(h4[0].id).toBe('papilioninae');
        // 2 Tribes
        expect(h5).toHaveLength(2);
        expect(h5[0].textContent).toBe('Troidini Talbot, 1939');
        expect(h5[0].id).toBe('troidini');
        expect(h5[1].textContent).toBe('Leptocircini Kirby, 1896');
        expect(h5[1].id).toBe('leptocircini');
        // 2 Genera
        expect(h6).toHaveLength(2);
        expect(h6[0].innerHTML).toBe('<i>Battus</i> Scopoli, 1777');
        expect(h6[0].id).toBe('battus');
        expect(h6[1].innerHTML).toBe('<i>Eurytides</i> Hübner, [1821]');
        expect(h6[1].id).toBe('eurytides');
    });

    it('creates a ul element for listing species pages', () => {
        setUpRendering(); // creates 2 species pages, each with diff genus
        const ul = container!.querySelectorAll('ul');
        expect(ul).toHaveLength(2); // have 2 uls, one for each genus
    });

    it('builds a card for each page', () => {
        setUpRendering();
        const li = container!.querySelectorAll('li');
        expect(li).toHaveLength(2);
    });

    it('builds a "back to top" link for each ul', () => {
        setUpRendering();
        const link = container!.querySelectorAll('.back-to-top');
        expect(link).toHaveLength(2);
        expect(link[0].href).toContain('#main');
        expect(link[1].href).toContain('#main');
        expect(link[0].textContent.trim()).toBe('Back to top');
        expect(link[1].textContent.trim()).toBe('Back to top');
    });
});

describe('renderResults', () => {
    let container;

    function setUpResults() {
        const pages = [
            makePage(),
            makePage({
                slug: 'eurytides-marcellus',
                order: {
                    name: 'Lepidoptera',
                    common_name: 'Butterflies and Moths',
                    authority: 'Linnaeus, 1758',
                },
                family: {
                    name: 'Papilionidae',
                    common_name: 'Swallowtails and Parnassians',
                    authority: 'Latreille, [1802]',
                },
                subfamily: {
                    name: 'Papilioninae',
                    common_name: 'Swallowtails',
                    authority: 'Latreille, [1802]',
                },
                tribe: {
                    name: 'Leptocircini',
                    common_name: null,
                    authority: 'Kirby, 1896',
                },
                genus: {
                    name: 'Eurytides',
                    common_name: null,
                    authority: 'Hübner, [1821]',
                },
                species: {
                    binomial: 'Eurytides marcellus',
                    common_name: 'Zebra Swallowtail',
                    authority: '(Cramer, 1777)',
                    mona: '4184.00',
                    ps: '770296.00',
                },
            }),
        ];

        return renderResults(
            pages,
            'order',
            'lepidoptera',
        );
    }

    beforeEach(() => {
        document.body.innerHTML = '';
        container = document.createElement('div');
        container.id = 'results';
        document.body.appendChild(container);
    });

    it('shows the search term in the heading', () => {
        setUpResults();
        const h2 = container!.querySelector('h2');
        expect(h2.textContent).toContain('Results for "lepidoptera"');
    });

    it('shows the number of species pages returned', () => {
        setUpResults();
        const count = container!.querySelector('.results-count');
        expect(count.textContent).toBe('2 species pages found');
    });

    it('shows the number of species pages return with correct grammar', () => {
        const pages = [makePage()];
        renderResults(pages, 'order', 'lepidoptera');
        const count = container!.querySelector('.results-count');
        expect(count.textContent).toBe('1 species page found');
    });

    it('shows a TOC when search term is tribe or above', () => {
        const pages = [makePage()];
        renderResults(pages, 'tribe', 'troidini');
        const toc = container!.querySelector('#toc');
        expect(toc).not.toBeNull();
    });

    it('does not show a TOC when search term is genus or below', () => {
        const pages = [makePage()];
        renderResults(pages, 'genus', 'battus');
        const toc = container!.querySelector('#toc');
        expect(toc).toBeNull();
    });
});

describe('buildNormalizedLookup', () => {
    it('creates entries from binomial names', () => {
        const uniques = [makePage().species];
        const lookup = buildNormalizedLookup([uniques[0]]);
        expect(lookup.get('battus-philenor')).toBe('Battus philenor');
    });

    it('creates entries from name field', () => {
        const taxon = {
            name: 'Papilionidae',
            authority: '--',
            binomial: '',
            common_name: '',
        };
        const lookup = buildNormalizedLookup([taxon]);
        expect(lookup.get('papilionidae')).toBe('Papilionidae');
    });

    it('creates entries from common_name field', () => {
        const taxon = {
            name: '',
            authority: '--',
            binomial: '',
            common_name: 'Swallowtails',
        };
        const lookup = buildNormalizedLookup([taxon]);
        expect(lookup.get('swallowtails')).toBe('Swallowtails');
    });

    it('handles entries with all three name fields populated', () => {
        const taxon = {
            name: 'philenor',
            authority: '(Linnaeus, 1771)',
            binomial: 'Battus philenor',
            common_name: 'Pipevine Swallowtail',
        };
        const lookup = buildNormalizedLookup([taxon]);
        expect(lookup.get('battus-philenor')).toBe('Battus philenor');
        expect(lookup.get('philenor')).toBe('philenor');
        expect(lookup.get('pipevine-swallowtail')).toBe('Pipevine Swallowtail');
    });

    it('handles multiple taxons', () => {
        const taxons = [
            {
 binomial: 'Battus philenor', authority: '--', name: 'philenor', common_name: 'Pipevine Swallowtail',
},
            {
 binomial: 'Eurytides marcellus', authority: '--', name: 'marcellus', common_name: 'Zebra Swallowtail',
},
        ];
        const lookup = buildNormalizedLookup(taxons);
        expect(lookup.get('battus-philenor')).toBe('Battus philenor');
        expect(lookup.get('eurytides-marcellus')).toBe('Eurytides marcellus');
        expect(lookup.get('zebra-swallowtail')).toBe('Zebra Swallowtail');
    });

    it('returns an empty map for empty input', () => {
        const lookup = buildNormalizedLookup([]);
        expect(lookup.size).toBe(0);
    });
});

describe('normalizeForParam', () => {
    it('converts to lowercase', () => {
        const string = 'Nymphalidae';
        const normalizedString = normalizeForParam(string);
        expect(normalizedString).toEqual('nymphalidae');
    });

    it('converts spaces to hyphens', () => {
        const string = 'Butterflies and Moths';
        const normalizedString = normalizeForParam(string);
        expect(normalizedString).toEqual('butterflies-and-moths');
    });

    it('strips out commas', () => {
        const string = 'Satyrs, Browns, and Wood Nymphs';
        const normalizedString = normalizeForParam(string);
        expect(normalizedString).toEqual('satyrs-browns-and-wood-nymphs');
    });

    it('strips out parentheses', () => {
        const string = 'incertae sedis (Coliadinae)';
        const normalizedString = normalizeForParam(string);
        expect(normalizedString).toEqual('incertae-sedis-coliadinae');
    });
});
