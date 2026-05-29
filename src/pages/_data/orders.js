/* eslint-disable @typescript-eslint/no-var-requires */
import EleventyFetch from '@11ty/eleventy-fetch';
import { config } from 'dotenv';
import * as testOrders from './fixtures/orders.json' with { type: 'json' };

config({ path: `.env.${process.env.NODE_ENV}` });

export default async function getOrders() {
    if (process.env.ENV === 'ci') {
        return testOrders.default.items;
    }

    const url = `${process.env.API_BASE_URL}/orders/?limit=100`;

    const data = await EleventyFetch(url, {
        duration: '1d',
        type: 'json',
    });

    return data.items;
}
