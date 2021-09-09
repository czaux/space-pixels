var webpack = require("webpack");
var path = require("path");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
let ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');


'use strict';

module.exports = {
    entry: {
        app: './src/index.ts'
    },
    output: {
        path: __dirname + '/bin/release',
        filename: '[name].js',
        sourceMapFilename: '[name].map'
    },
    externals: [
        'canvas', 'jsdom'
    ],
    devtool: false,
	resolve: {
		extensions: ['.ts', '.js'],
        modules: ['./src', 'node_modules'],
        alias: {
            'vue': 'vue/dist/vue.common.js'
        }
	},
    /* Start of hacky workaround to make pre-compiled fabric.js file work */
    externals: [
        'canvas', 'jsdom'
    ],
    /* End of hack */
    stats: {
        assetsSort: "size",
        chunksSort: "size",
        modulesSort: "size",
        modules:true,
        children: true,
        chunks: true,
        chunkModules: true,
        chunkOrigins: true,
    },
    module: {
        rules: [
            { test: /\.css$/, use: ExtractTextPlugin.extract({fallbackLoader: "style-loader", loader: "css-loader"})},
            { test: /\.ts$/, exclude: /node_modules|vue\/src/, loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } },
            { test: /\.vue$/, loader: 'vue-loader', options: { esModule: true } }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            minify: {
                collapseWhitespace: true,
                preserveLineBreaks: true,
            },
            inject: false,
            cssfile: 'styles.css',
            title: 'Space Pixels',
            template: './index.ejs',
            mobile: false,
            meta: [
                {
                    name: 'description',
                    content: 'A better default template for html-webpack-plugin.'
                }
            ],
            links: [
                'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
                'https://fonts.googleapis.com/css?family=Roboto'
            ],
        }),
        new ExtractTextPlugin("styles.css"),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            },
            output: {
                comments: false
            },
            sourceMap: false
        })
    ]
};