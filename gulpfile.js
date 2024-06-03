const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint({
      configFile: './eslint.config.js' 
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
  gulp.watch(['**/*.js', '!node_modules/**'], gulp.series('lint'));
});

gulp.task('default', gulp.series('lint', 'watch'))