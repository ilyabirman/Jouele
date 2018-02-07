var gulp = require('gulp');

var concat = require("gulp-concat");
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var concatCss = require('gulp-concat-css');

gulp.task('concat-css', function () {
    gulp.src(['src/jouele.css', 'src/jouele.skin.css'])
        .pipe(concatCss('dist/jouele.css', {rebaseUrls: false}))
        .pipe(gulp.dest('./'))
});
gulp.task('copy-js', function () {
    gulp.src(['src/jouele.js'])
        .pipe(gulp.dest('dist'))
});
gulp.task('minify-css', function () {
    gulp.src(['src/jouele.css', 'src/jouele.skin.css'])
        .pipe(concatCss('jouele/jouele.min.css', {rebaseUrls: false}))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./'))
});
gulp.task('uglify-js', function() {
    gulp.src(['howler-fork/howler.core.js', 'src/jouele.js'])
        .pipe(concat('jouele.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('jouele'))
});

gulp.task('default', ['minify-css', 'uglify-js']);
gulp.task('npm', ['concat-css', 'copy-js']);
