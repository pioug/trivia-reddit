const gulp = require('gulp');
const htmlreplace = require('gulp-html-replace');
const zip = require('gulp-zip');
const browserSync = require('browser-sync').create();
const manifest = require('./src/manifest.json');

gulp.task('default', function() {
  browserSync.init({
    server: {
      baseDir: ['src', 'build'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch('build/**/*', browserSync.reload);
  gulp.watch('src/**/*.html', browserSync.reload);
  gulp.watch('src/**/*.css', browserSync.reload);
});

gulp.task('build', function() {
  return gulp.src([
      'node_modules/react/dist/react.js',
      'node_modules/react-dom/dist/react-dom.js',
      'src/index.html',
      'src/app.css',
      'src/manifest.json'
    ])
    .pipe(htmlreplace({
      react: [
        'react.js',
        'react-dom.js'
      ]
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('images', function() {
  return gulp.src('src/*img/*')
    .pipe(gulp.dest('build'));
})

gulp.task('bundle', ['build', 'images'], function () {
  return gulp.src('build/**/*')
    .pipe(zip('trivia-for-reddit-' + manifest.version + '.zip'))
    .pipe(gulp.dest('bundle'));
});
