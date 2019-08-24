const babelify = require('babelify');
const browserify = require('browserify');
const del = require('del');
const gulp = require('gulp');
const manifest = require('./src/manifest.json');
const replace = require('streplacify');
const source = require('vinyl-source-stream');
const zip = require('gulp-zip');

const env = {
  development: {},
  production: {}
};

gulp.task('default', () => {
  gulp.watch('src/**/*.html', rebuild);
  gulp.watch('src/**/*.jsx', rebundle);
  rebuild();
  rebundle();

  function rebuild() {
    gulp.start('build');
  }

  function rebundle() {
    gulp.start('scripts:app');
    gulp.start('scripts:options');
  }
});

gulp.task('scripts:app', () =>
  browserifyInit({ entry: 'app' }).pipe(gulp.dest('build'))
);

gulp.task('scripts:options', () =>
  browserifyInit({ entry: 'options' }).pipe(gulp.dest('build'))
);

gulp.task('build', () =>
  gulp.src([
    'src/index.html',
    'src/options.html',
    'src/manifest.json'
  ])
    .pipe(gulp.dest('build'))
);

gulp.task('images', () =>
  gulp.src('src/*img/*')
    .pipe(gulp.dest('build'))
);

gulp.task('bundle', ['clean:bundle', 'build', 'images', 'scripts:app', 'scripts:options'], () =>
  gulp.src('build/**/*')
    .pipe(zip('trivia-for-reddit-' + manifest.version + '.zip'))
    .pipe(gulp.dest('bundle'))
);

gulp.task('clean:build', () => del(['build']));
gulp.task('clean:bundle', () => del(['bundle']));

function browserifyInit(params) {
  return browserify(Object.assign({
    cache: {},
    entries: `src/${params.entry}.jsx`,
    packageCache: {},
    debug: process.env.NODE_ENV === 'development'
  }, params))
    .transform(babelify, { global: true })
    .transform(replace, {
      replace: getStringsToReplace(env[process.env.NODE_ENV || 'development'])
    })
    .bundle()
    .pipe(source(params.entry + '.js'));
}

function getStringsToReplace(opt) {
  return Object.keys(opt).map(key => ({ from: `@@${key}`, to: opt[key] }));
}
