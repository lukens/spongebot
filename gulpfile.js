var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', function() {
  return gulp.src(['init.js', 'spongebot.js'])
    .pipe(concat('spongebot-webtask.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});
