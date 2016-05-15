import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import del from 'del';

const $ = gulpLoadPlugins();

const stylesSource = [
  './app/styles/*',
  './app/styles/**/*'
];

const autoprefixerSettings = [
  'chrome >= 34'
];

// Clean output directory
// Remove logs, compiled front-end resources (css, js, html), email styles
gulp.task('clean', cb => del([
  './app/dist/*',
  './dist/*',
], { dot: true }));

gulp.task('bower', () => {
  return $.bower();
});

gulp.task('styles', () => {
  return gulp.src('./app/styles/main.scss')
    .pipe($.sass({
      precision: 10
    })
    .on('error', $.sass.logError))
    .pipe($.autoprefixer(autoprefixerSettings))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({ title: 'styles' }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('dev', () => {
  gulp.watch([stylesSource], ['styles']);
});

gulp.task('default', ['clean'], cb => {
  runSequence(
    'clean',
    'bower',
    'styles',
    cb
  );
});
