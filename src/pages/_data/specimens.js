/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getSpecimens() {
    const sleep = (ms) => (
        /* eslint-disable-next-line no-promise-executor-return */
        new Promise((resolve) => setTimeout(resolve, ms))
    );

    async function fetchWithRetry(url, options, retries = 3) {
        try {
            /* eslint-disable @typescript-eslint/return-await */
            return await EleventyFetch(url, options);
        } catch (err) {
            if (retries <= 0) {
                throw err;
            }

            await sleep(500 * (4 - retries)); // exponential-ish backoff
            return fetchWithRetry(url, options, retries - 1);
        }
    }

    let allItems = [];
    let currentOffset = 0; // what index the results start at (0 = 1)
    // Need to set a limit when this fetch is executed in the CI; otherwise, it fails
    const limit = process.env.NODE_ENV === 'ci' ? 20 : 500; // the max amount of results returned per query

    // Setting the for loop to run 15 times (15 loops x 500 result limit = 7,500 specimens)
    for (let i = currentOffset; i < 15; i += 1) {
        const url = `${process.env.API_BASE_URL}/specimen-records/?offset=${currentOffset}&limit=${limit}`;

        /* eslint-disable no-await-in-loop */
        const data = await fetchWithRetry(url, {
            duration: '1d',
            type: 'json',
        });

        allItems = allItems.concat(data.items);
        currentOffset += limit;

        await sleep(250);
    }

    return allItems;
}
