/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getSubfamilies() {
    const url = `${process.env.API_BASE_URL}/nested-subfamilies/?limit=4000`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
}
