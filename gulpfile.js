var gulp = require('gulp');

var cleanCss = require('gulp-clean-css');
var concat = require("gulp-concat");
var concatCss = require('gulp-concat-css');
var uglify = require('gulp-uglify');

gulp.task('minify-css', function () {
    return gulp.src('src/*.css')
            .pipe(concatCss('dist/jouele.min.css'))
            .pipe(cleanCss({compatibility: 'ie8'}))
            .pipe(gulp.dest('./'))
});
gulp.task('uglify-js', function() {
    return gulp.src(['node_modules/howler/src/howler.core.js', 'src/jouele.js'])
            .pipe(concat('jouele.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist'))
});
gulp.task('default', gulp.parallel('minify-css', 'uglify-js'));
