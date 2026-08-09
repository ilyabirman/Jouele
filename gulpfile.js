var gulp = require('gulp');
var Transform = require('stream').Transform;

var cleanCss = require('gulp-clean-css');
var concat = require("gulp-concat");
var concatCss = require('gulp-concat-css');
var uglify = require('gulp-uglify');

function patchHowler() {
    return new Transform({
        objectMode: true,
        transform: function(file, encoding, callback) {
            if (file.isBuffer() && file.basename === 'howler.core.js') {
                var content = file.contents.toString('utf8');
                var patchedContent = content.replace('([0-6].)', '(\\d+)');

                if (content === patchedContent && content.indexOf('(\\d+)') === -1) {
                    return callback(new Error('Howler.js Opera patch could not be applied'));
                }

                file.contents = Buffer.from(patchedContent, 'utf8');
            }

            callback(null, file);
        }
    });
}

gulp.task('minify-css', function () {
    return gulp.src('src/*.css')
            .pipe(concatCss('dist/jouele.min.css'))
            .pipe(cleanCss({compatibility: 'ie8'}))
            .pipe(gulp.dest('./'))
});
gulp.task('uglify-js', function() {
    return gulp.src(['node_modules/howler/src/howler.core.js', 'src/jouele.js'])
            .pipe(patchHowler())
            .pipe(concat('jouele.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist'))
});
gulp.task('default', gulp.parallel('minify-css', 'uglify-js'));
