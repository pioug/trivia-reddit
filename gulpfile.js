'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const htmlreplace = require('gulp-html-replace');
const manifest = require('./src/manifest.json');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const zip = require('gulp-zip');

gulp.task('default', () => {
  const bundler = browserify({
      cache: {},
      debug: true,
      entries: 'src/app.jsx',
      packageCache: {},
      plugin: [watchify],
      transform: [babelify]
    })
    .on('update', rebundle);

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
  rebundle();

  function rebundle() {
    return bundler
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('build'))
  }
});

gulp.task('scripts', () =>
  browserify({
      entries: 'src/app.jsx',
      transform: [babelify]
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('build'))
);

gulp.task('build', () =>
  gulp.src([
      'src/index.html',
      'src/app.css',
      'src/manifest.json'
    ])
    .pipe(gulp.dest('build'))
);

gulp.task('images', () =>
  gulp.src('src/*img/*')
    .pipe(gulp.dest('build'))
);

gulp.task('bundle', ['build', 'images'], () =>
  gulp.src('build/**/*')
    .pipe(zip('trivia-for-reddit-' + manifest.version + '.zip'))
    .pipe(gulp.dest('bundle'))
);
