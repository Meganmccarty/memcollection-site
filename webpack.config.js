/* eslint-disable @typescript-eslint/no-var-requires */
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// return any files matching the directory (non-recursively)
const getEntryPoints = (directory) => fs.readdirSync(path.join(__dirname, directory))
    .filter((file) => !fs.statSync(path.join(directory, file)).isDirectory())
    .reduce((entries, file) => ({
        ...entries,
        [file.split('.')[0]]: `./${directory}/${file}`,
    }), {});

export default {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: () => getEntryPoints('src/js'),
    module: {
        rules: [
            {
                test: /\.(j|t)s$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [
            '.ts',
            '.js',
        ],
    },
    output: {
        filename: '[name].legacy.js',
        path: path.resolve(__dirname, 'dist/js'),
    },
};
