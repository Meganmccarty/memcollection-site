/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';
import * as testFamilies from './fixtures/families.json' with { type: 'json' };

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getFamilies() {
    if (process.env.ENV === 'ci') {
        return testFamilies.default.items;
    }

    const url = `${process.env.API_BASE_URL}/nested-families/?limit=2000`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
}
