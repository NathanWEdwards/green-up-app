module.exports = function (api) {
    api.cache(true);
    const isDetox = process.env.APP_ENV === 'detox';
    
    const alias = {
        '@components': './components',
        '@services': './services'
    };

    if (isDetox) {
        alias['@react-native-firebase/auth'] = './e2e/mocks/firebase-auth.js';
        alias['@react-native-firebase/firestore'] = './e2e/mocks/firebase-firestore.js';
        alias['@react-native-firebase/functions'] = './e2e/mocks/firebase-functions.js';
        alias['@react-native-firebase/app'] = './e2e/mocks/firebase-app.js';
        alias['@/components/scroll-indicator'] = './e2e/mocks/scroll-indicator.js';
        alias['@/components/mini-map'] = './e2e/mocks/mini-map.js';
    }

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
                    alias
                }
            ],
            '@babel/plugin-transform-modules-commonjs'
        ]
    };
};
