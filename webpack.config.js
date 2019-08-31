const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = (env, argv) => ({
    entry: {
        './popup': path.resolve(__dirname, 'src') + '/popup/popup.js',
        './background': path.resolve(__dirname, 'src') + '/background/background.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    mode: argv.mode || 'development',
    devtool: argv.mode === 'production' ? '' : 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        "plugins": [
                            ["@babel/transform-runtime"]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader', 
                    'css-loader'
                ],
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.(jpe?g|png|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/, 
                loader: 'url-loader?limit=100000'
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: './src/manifest.json', to: './' },
            { from: './src/assets/icon.png', to: './assets' },
            { from: './src/popup/popup.html', to: './' },
        ]),
    ],
    optimization: {
        minimizer: argv.mode === 'production' ? [
             new TerserPlugin({
                terserOptions: {
                    // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                    extractComments: 'all',
                    compress: {
                        drop_console: true,
                    },
                }
             }),
        ] : []
    }
});