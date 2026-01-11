/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getInsectImages() {
    const url = `${process.env.API_BASE_URL}/insect-images/?limit=2000`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
};
