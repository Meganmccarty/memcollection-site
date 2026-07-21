/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';
import * as testSpeciesPages from './fixtures/species-pages.json' with { type: 'json' };

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getSpeciesPages() {
    if (process.env.ENV === 'ci') {
        return testSpeciesPages.default.items;
    }

    const url = `${process.env.API_BASE_URL}/species-pages/?limit=20000`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
}
