module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
                    alias: {
                        '@components': './components',
                        '@services': './services'
                    }
                }
            ],
            '@babel/plugin-transform-modules-commonjs'
        ]
    };
};
