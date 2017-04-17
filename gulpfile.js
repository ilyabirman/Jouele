var gulp = require('gulp');

var concat = require("gulp-concat");
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var concatCss = require('gulp-concat-css');

gulp.task('concatJs', function() {
    gulp.src(['src/howlerjs/howler.js', 'src/jouele.js'])
        .pipe(concat('jouele.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
});
gulp.task('concatCss', function () {
    gulp.src(['src/jouele.css', 'src/jouele.skin.css'])
        .pipe(concatCss('dist/jouele.css', {rebaseUrls: false}))
        .pipe(gulp.dest('./'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./'))
});
gulp.task('copy', function () {
    gulp.src(['src/jouele.skin.css'])
        .pipe(gulp.dest('dist'))
});

gulp.task('default', ['concatJs', 'concatCss', 'copy']);
