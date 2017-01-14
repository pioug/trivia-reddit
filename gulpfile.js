const babelify = require('babelify');
const browserify = require('browserify');
const del = require('del');
const gulp = require('gulp');
const manifest = require('./src/manifest.json');
const replace = require('streplacify');
const source = require('vinyl-source-stream');
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
  gulp.watch('src/**/*.css', rebuild);
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
    'src/app.css',
    'src/manifest.json'
  ])
    .pipe(gulp.dest('build'))
);

gulp.task('images', () =>
  gulp.src('src/*img/*')
    .pipe(gulp.dest('build'))
);

gulp.task('bundle', ['build', 'images', 'scripts:app', 'scripts:options'], () =>
  gulp.src('build/**/*')
    .pipe(zip('trivia-for-reddit-' + manifest.version + '.zip'))
    .pipe(gulp.dest('bundle'))
);

gulp.task('clean', () => del('build'));

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
