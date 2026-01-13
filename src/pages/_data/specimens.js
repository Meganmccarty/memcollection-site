/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getSpecimens() {
    // Need to set a limit when this fetch is executed in the CI; otherwise, it fails
    const limit = process.env.CI ? 20 : 10000;
    const url = `${process.env.API_BASE_URL}/specimen-records/?limit=${limit}`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
}
