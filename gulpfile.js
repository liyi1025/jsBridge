var gulp = require('gulp')
var del = require('del')
var webpack = require('webpack')
var getConfig = require('./webpack.config')
var fs = require('fs')
var express = require('express')
var webpackDevMiddleware = require("webpack-dev-middleware")
var webpackHotMiddleware = require("webpack-hot-middleware")
var webpack = require('webpack')
var path = require('path')
var app = express()
var ip = require('ip')
var open = require('open')

var sourcePath = 'src'
var distPath = 'dist'

//生成如右的entry ./src/pages/PickUp/index.js
function makeEntry(page_list, task_type) {
    var entries = {}
    page_list.forEach(function(page){
        var entry = '../src/pages/' + page + '/index.js'
        if(task_type === "PACK"){
            entries[page] = entry
        }else if(task_type === "SERVER") {
            entries[page] =  [
                'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=200000',
                entry]
        }
    })
    return entries
}
//监听每个页面的变化
function listen(page_list){
    page_list.forEach(function(page){
        var page_url = '/'+page

        app.get(page_url, function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*')

            // res.send('<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black"><title></title></head><body><div id="app"></div><script src=\'' + page_url +'.min.js\'></script></style></body>')

            res.sendfile('./dist/'+page+'.html')
        })
    })
}

gulp.task('default', function () {
})

gulp.task('clean', function (cb) {
    del([distPath], cb)
})

gulp.task('copy', function() {
    return gulp.src([
        path.join(sourcePath, '..', 'html', '*.*')
    ]).pipe(gulp.dest(distPath))
})

gulp.task('pack', ['copy'], function (cb) {

    //获取所有 pages 路径下的文件名称数组
    var pages = fs.readdirSync(path.join(sourcePath, 'pages'))
    var entries = makeEntry(pages, "PACK")
    var webpack_config = getConfig()
    webpack_config.plugins.push(
        //压缩，会加长打包时间
       /* new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })*/
    )
    var config = Object.assign(webpack_config,{
        entry: entries,
        devtool: undefined,
        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name].min.js',
            publicPath: '/dist/',
        }
    })
    webpack(config, cb)
})

gulp.task('server', function (cb) {

    var pages = fs.readdirSync(path.join(sourcePath, 'pages'))
    var entries = makeEntry(pages, "SERVER")
    var webpack_config = getConfig("SERVER")
    var config = Object.assign(webpack_config,{
        type: "SERVER",
        entry: entries,
        devtool: undefined,
        output: {
            path: path.join(__dirname),
            filename: '[name].min.js',
            publicPath: '/',
        },
    })
    var compiler = webpack(config)

    app.use(webpackDevMiddleware(compiler, {
        hot: true,
        filename: '[name].min.js',
        publicPath: '/',
        stats: {
            colors: true,
        },
        historyApiFallback: true,
    }))

    app.use(webpackHotMiddleware(compiler, {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000,
    }))

    listen(pages)

    var server = app.listen(3001, function () {
        var host = ip.address() || server.address().address
        var port = server.address().port
        console.log('Example app listening at http://%s:%s', ip.address(), port)
        var url  = "http://" + host + ":" + port + "/test"
      //  open(url)
    })
    cb()
})