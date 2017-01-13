'use strict';

const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const del = require('del');
const gulp = require('gulp');
const manifest = require('./src/manifest.json');
const replace = require('streplacify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const zip = require('gulp-zip');

const env = {
  development: {
    heap: 64976935
  },
  production: {
    heap: 973980036
  }
};

gulp.task('default', () => {
  const bundler = browserifyInit({
    debug: true,
    plugin: [watchify]
  })
    .on('update', rebundle);

  browserSync.init({
    server: {
      baseDir: ['src', 'build'],
      routes: {
        '/node_modules': 'node_modules'
      },
      middleware: [require('connect-history-api-fallback')()]
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
  browserifyInit()
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

gulp.task('bundle', ['build', 'images', 'scripts'], () =>
  gulp.src('build/**/*')
    .pipe(zip('trivia-for-reddit-' + manifest.version + '.zip'))
    .pipe(gulp.dest('bundle'))
);

gulp.task('clean', (done) => del('build'));

function browserifyInit(params = { debug: false }) {
  process.NODE_ENV = params.debug ? 'development' : 'production';
  return browserify(Object.assign({
    cache: {},
    entries: 'src/app.jsx',
    packageCache: {}
  }, params))
    .transform(babelify)
    .transform(replace, {
      replace: getStringsToReplace(env[process.NODE_ENV])
    });
}

function getStringsToReplace(opt) {
  return Object.keys(opt).map(key => ({ from: `@@${key}`, to: opt[key] }));
}
