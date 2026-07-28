/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';
import * as testGenera from './fixtures/genera.json' with { type: 'json' };

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getGenera() {
    if (process.env.ENV === 'ci') {
        return testGenera.default.items;
    }

    const url = `${process.env.API_BASE_URL}/nested-genera/?limit=4000`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
}
