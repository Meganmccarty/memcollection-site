export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.(ts|tsx)?$': ['ts-jest', { isolatedModules: true }],
    },
    tsconfig: 'tsconfig.json',
    verbose: true,
};
