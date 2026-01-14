/* eslint-disable @typescript-eslint/no-var-requires */
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

export default {
    // generate a random string for service worker versioning, such as '36f4-1234-8c7a'

    random() {
        // eslint-disable-next-line no-bitwise
        const segment = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

        return `${segment()}-${segment()}-${segment()}`;
    },

    getApiUrl() {
        const API_URL = process.env.API_URL || 'http://localhost:8000/api/v2';

        return API_URL;
    },
};
