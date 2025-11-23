var gulp = require('gulp');
var fs = require('fs');
var path = require('path');

var cleanCss = require('gulp-clean-css');
var concat = require("gulp-concat");
var concatCss = require('gulp-concat-css');
var uglify = require('gulp-uglify');

gulp.task('patch-howler', function (done) {
    var howlerPath = path.join(__dirname, 'node_modules/howler/src/howler.core.js');
    var content = fs.readFileSync(howlerPath, 'utf8');
    
    // Patch Opera browser version regex: /OPR\/([0-6].)/ → /OPR\/(\d+)/
    // Simple string replacement - replace ([0-6].) with (\d+)
    var patchedContent = content.replace('([0-6].)', '(\\d+)');
    
    if (content === patchedContent) {
        console.warn('Warning: Howler.js patch was not applied. The file may have already been patched or the pattern changed.');
    }
    
    fs.writeFileSync(howlerPath, patchedContent, 'utf8');
    done();
});

gulp.task('minify-css', function () {
    return gulp.src('src/*.css')
            .pipe(concatCss('dist/jouele.min.css'))
            .pipe(cleanCss({compatibility: 'ie8'}))
            .pipe(gulp.dest('./'))
});
gulp.task('uglify-js', gulp.series('patch-howler', function() {
    return gulp.src(['node_modules/howler/src/howler.core.js', 'src/jouele.js'])
            .pipe(concat('jouele.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist'))
}));
gulp.task('default', gulp.parallel('minify-css', 'uglify-js'));
