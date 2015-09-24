var gulp = require('gulp');

var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');

gulp.task('uglify', function () {
    gulp.src(['src/jouele.js'])
        //.pipe(uglify())
        .pipe(gulp.dest('dist'))
});
gulp.task('cssmin', function () {
    gulp.src(['src/jouele.css'])
        .pipe(cssmin())
        .pipe(gulp.dest('dist'))
});

gulp.task('default', ['uglify', 'cssmin']);
