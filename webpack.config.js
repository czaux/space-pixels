var webpack = require("webpack");
var path = require("path");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
let ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');


'use strict';

function isExternal2(module) {
  var userRequest = module.userRequest;

  if (typeof userRequest !== 'string') {
    return false;
  }

  return userRequest.indexOf('bower_components') >= 0 ||
         userRequest.indexOf('node_modules') >= 0 ||
         userRequest.indexOf('libraries') >= 0;
}

module.exports = {
    entry: {
        app: './src/index.ts'
    },
    output: {
        path: __dirname + '/bin/debug',
        filename: '[name].js',
        sourceMapFilename: '[name].map',
    },
    externals: [
        'canvas', 'jsdom'
    ],
    devServer: {
        noInfo: false,
        historyApiFallback: true,
        inline: true,
        stats: {
            // Add asset Information
            assets: true,
            // Add information about cached (not built) modules
            cached: true,
            // Add children information
            children: false,
            // Add chunk information (setting this to `false` allows for a less verbose output)
            chunks: false,
            // Add built modules information to chunk information
            chunkModules: false,
            // Add the origins of chunks and chunk merging info
            chunkOrigins: false,
            // Add errors
            errors: true,
            // Add details to errors (like resolving log)
            errorDetails: true,
            // Add the hash of the compilation
            hash: false,
            // Add built modules information
            modules: false,
            // Add public path information
            publicPath: true,
            // Add information about the reasons why modules are included
            reasons: true,
            // Add the source code of modules
            source: false,
            // Add timing information
            timings: true,
            // Add webpack version information
            version: true,
            // Add warnings
            warnings: false
        }
    },
    devtool: 'source-map',
	resolve: {
		extensions: ['.ts', '.js', '.vue'],
        modules: ['./src', 'node_modules'],
        alias: {
            'vue': 'vue/dist/vue.common.js'
        }
	},
    vue : {
        loader: {js: 'vue-ts-loader'},
        esModule: true
    },
    module: {
        rules: [
            { test: /\.css$/, use: ExtractTextPlugin.extract({fallbackLoader: "style-loader", loader: "css-loader"})},
            //{ test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
            { test: /\.ts$/, exclude: /node_modules|vue\/src/, loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } },
            { test: /\.vue$/, loader: 'vue-loader', options: { esModule: true, transformToRequire: true } }
        ]
    },
    
    plugins: [
        new HtmlWebpackPlugin({
            minify: {
                collapseWhitespace: true,
                preserveLineBreaks: true,
            },
            inject: false,
            cache: false,
            title: 'Space Pixels',
            cssfile: 'styles.css',
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
        new ExtractTextPlugin('styles.css'),
        new CommonsChunkPlugin({
            name: "vendor",

            minChunks: function(module) {
                return isExternal2(module);
            }
        })
    ]
    
};