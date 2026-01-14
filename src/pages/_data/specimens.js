/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getSpecimens() {
    let allItems = [];
    let currentOffset = 0; // what index the results start at (0 = 1)
    // Need to set a limit when this fetch is executed in the CI; otherwise, it fails
    const limit = process.env.NODE_ENV === 'ci' ? 20 : 500; // the max amount of results returned per query

    // Setting the for loop to run 15 times (15 loops x 500 result limit = 7,500 specimens)
    for (let i = currentOffset; i < 15; i += 1) {
        const url = `${process.env.API_BASE_URL}/specimen-records/?offset=${currentOffset}&limit=${limit}`;

        /* eslint-disable no-await-in-loop */
        const data = await EleventyFetch(url, {
            duration: '1d',
            type: 'json',
        });

        allItems = allItems.concat(data.items);
        currentOffset += limit;
        setTimeout(() => {}, 250);
    }

    return allItems;
}
