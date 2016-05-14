import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();

const stylesSource = './app/styles/main.scss';

const autoprefixerSettings = [
  'chrome >= 34'
];

gulp.task('styles', () => {
  return gulp.src(stylesSource)
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

gulp.task('default', ['styles']);
