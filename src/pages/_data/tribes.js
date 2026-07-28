/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';
import * as testTribes from './fixtures/tribes.json' with { type: 'json' };

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getTribes() {
    if (process.env.ENV === 'ci') {
        return testTribes.default.items;
    }

    const url = `${process.env.API_BASE_URL}/nested-tribes/?limit=4000`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
}
