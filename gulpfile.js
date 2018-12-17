var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var rename = require('gulp-rename');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(cleanCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', ['sass'], function() {
  gulp.watch(paths.sass, ['sass']);
});

var replace = require('replace');
var replaceFiles = ['./www/js/app.js'];

gulp.task('add-proxy', function () {
  return replace({
    regex: "http://cors.api.com/api",
    replacement: "http://localhost:8100/api",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});

gulp.task('remove-proxy', function () {
  return replace({
    regex: "http://localhost:8100/api",
    replacement: "http://cors.api.com/api",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});
