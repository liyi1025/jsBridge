var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var autoprefixer = require('autoprefixer')

function getConfig(type) {
    var SERVERMODE = type === "SERVER"
    return config = {
        context: path.join(__dirname, 'app'),
        entry: {},
        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name].js',
            publicPath: '/dist/',
        },
        devtool: 'source-map',
        externals: {
            'react': 'window.React',
            'react-dom': 'window.ReactDOM',
        },
        module: {
            loaders: [
                {
                    test: /\.js?$/,
                    exclude: /node_modules/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015', 'es2016', 'stage-2', 'react']
                    }
                },
                // CSS
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    loader: SERVERMODE
                        ? 'style!css'
                        : ExtractTextPlugin.extract("style-loader", "css-loader")
                },
                // LESS
                {
                    test: /\.less$/,
                    exclude: /node_modules/,
                    loader: SERVERMODE
                        ? 'style!css?sourceMap!less?sourceMap'
                        : ExtractTextPlugin.extract("style-loader", "css!less")
                },
                {
                    test: /\.(jpg|png)$/,
                    loader: "url?limit=11000&name=images/[hash:8].[name].[ext]"
                },
                {
                    test: /\.ttf$/,
                    loader: "url-loader?limit=10000&mimetype=application/octet-stream"
                },
            ]
        },
        plugins: SERVERMODE ?
            [
                new webpack.optimize.OccurenceOrderPlugin(),
                new webpack.HotModuleReplacementPlugin(),
                new webpack.NoErrorsPlugin(),
                new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': JSON.stringify('production')
                    }
                }),
            ]
            :
            [
                new webpack.optimize.OccurenceOrderPlugin(),
                new webpack.HotModuleReplacementPlugin(),
                new webpack.NoErrorsPlugin(),
                new ExtractTextPlugin("[name].min.css"),
                new webpack.DefinePlugin({
                    'process.env': {
                        'NODE_ENV': JSON.stringify('production')
                    }
                }),
            ]
    }
}
module.exports = getConfig;