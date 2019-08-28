const { src, dest, parallel } = require('gulp');
const pug = require('gulp-pug');
const less = require('gulp-less');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const babel = require('gulp-babel');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const uglifyJS = require('gulp-uglify');
const minifyHTML = require('gulp-htmlmin');
const rename = require('gulp-rename');

function html() {
    return src('pug/*.pug')
        .pipe(pug())
        .pipe(minifyHTML({removeComments: true, collapseWhitespace: true}))
        .pipe(dest('build/'))
}

function css() {
    return src('less/*.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(dest('build/css'))
}

function js() {
    return src(['javascript/*.js', '!javascript/config.js'])
        .pipe(babel({
            presets: ['@babel/env'],
            plugins: ['@babel/transform-runtime']
        }))
        .pipe(named())
        .pipe(webpack({mode: 'production'}))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglifyJS())
        .pipe(rename(function(path){
            path.basename += ".min";
            path.extname = ".js";
        }))
        .pipe(dest('build/js'))
}

exports.js = js;
exports.css = css;
exports.html = html;
exports.default = parallel(html, css, js);
