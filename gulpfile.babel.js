import path from 'path'
import gulp from 'gulp'
import gulpSequence from 'gulp-sequence'
import gulpReplace from 'gulp-replace'
import gutil from 'gulp-util'
import inject from 'gulp-inject'
import WebpackDevServer from "webpack-dev-server"
import  HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from "webpack"
import del from 'del'
import env from 'gulp-env'
import open from 'open'

const DEV_PORT = 3000


gulp.task('serve', cb =>{
  let webpackConfig = require('./webpack.config.js')
  let myConfig = Object.create(webpackConfig)
  myConfig.entry.blog.unshift('webpack/hot/only-dev-server')
  myConfig.entry.blog.unshift('webpack-dev-server/client?http://localhost:' + DEV_PORT)
  myConfig.plugins.push( new HtmlWebpackPlugin({
      title: "DEV",
      template: path.join(__dirname, 'src/index.html'),
      inject: true
  }))
  new WebpackDevServer(webpack(myConfig), {
      noInfo: false,
      hot: true,
      inline: true,
      historyApiFallback: true,
      publicPath: myConfig.output.publicPath,
      stats: {
        colors: true
      }
  }).listen(DEV_PORT, "localhost", err => {
      if(err) throw new gutil.PluginError("webpack-dev-server", err)
      gutil.log("[webpack-dev-server]", "==> 🌎  http://localhost:" + DEV_PORT)
      open('http://localhost:' + DEV_PORT)
      cb()
  })
})
gulp.task('clean', cb => del([path.join(__dirname, 'source'), path.join(__dirname, 'layout')], cb))

// replace 'use strict' to '' for 1.blog.js
gulp.task('re', cb => {
    gulp.src('./source/1.blog.js')
    .pipe(gulpReplace(/\\"use\s+strict\\";\\n\\n/ig,''))
    .pipe(gulp.dest('./source/'))
    cb()
})
/**Abandoned using http://static.duoshuo.com/embed.js**/
gulp.task('copylib', cb => {
    gulp.src('./src/lib/duoshuo/index.js')
    .pipe(gulp.dest('./source/lib/duoshuo'))
    cb()
})

gulp.task('build', cb => {
    gulpSequence('clean', 'webpack')(() => {
        gulp.src('./src/index.pug')
        .pipe(inject(gulp.src(['./source/blog.js', './source/**/*.css'], {read: false}), {
            ignorePath: 'source',
            addRootSlash: false
        }))
        .pipe(gulp.dest('layout/'))
        cb()
    })
})
gulp.task('default', ['build'])

gulp.task('webpack', cb => {
  let webpackConfig = require('./webpack.config.js')
  let myConfig = Object.create(webpackConfig)
  webpack(myConfig, function(err, stats) {
      if(err) throw new gutil.PluginError("webpack", err)
      gutil.log("[webpack]", stats.toString({
          colors: true
      }))
      cb()
  })
})
