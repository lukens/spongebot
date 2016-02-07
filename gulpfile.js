var gulp = require('gulp')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var exec = require('gulp-exec')

var srcs = ['init.js', 'src/*.js']

gulp.task('default', function() {

  return gulp.src(srcs)
    .pipe(concat('spongebot-webtask.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'))

})

gulp.task('deploy-from-local', ['default'], function() {

  return gulp.src('dist/spongebot-webtask.js')
    .pipe(exec('echo "deployed to:" `wt create <%= file.path %> -n spongebot`'))
    .pipe(exec.reporter());

})

gulp.task('deploy-from-local-watch', ['deploy-from-local'], function() {

  var watcher = gulp.watch(srcs, ['deploy-from-local'])

})
