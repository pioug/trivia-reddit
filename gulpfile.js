const del = require("del");
const gulp = require("gulp");
const manifest = require("./src/manifest.json");
const zip = require("gulp-zip");
const rollup = require("rollup");

const { babel } = require("@rollup/plugin-babel");
const commonjs = require("@rollup/plugin-commonjs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");

gulp.task("scripts", async () => {
  const bundle = await rollup.rollup({
    input: {
      app: "src/app.jsx",
      options: "src/options.jsx",
    },
    onwarn(warning, warn) {
      if (warning.code === "UNRESOLVED_IMPORT") {
        throw new Error(warning.message);
      }
      warn(warning);
    },
    plugins: [
      commonjs(),
      nodeResolve(),
      babel({
        babelHelpers: "bundled",
      }),
      terser(),
    ],
  });
  return bundle.write({
    output: {
      dir: "build",
      format: "esm",
    },
  });
});

gulp.task("build", () =>
  gulp
    .src(["src/index.html", "src/options.html", "src/manifest.json"])
    .pipe(gulp.dest("build"))
);

gulp.task("images", () => gulp.src("src/*img/*").pipe(gulp.dest("build")));

gulp.task("clean:build", () => del(["build"]));
gulp.task("clean:bundle", () => del(["bundle"]));

gulp.task(
  "default",
  gulp.series("build", "scripts", () => {
    gulp.watch("src/**/*.html", gulp.series("build"));
    gulp.watch("src/**/*.jsx", gulp.series("scripts"));
  })
);

gulp.task(
  "bundle",
  gulp.series("clean:bundle", "build", "images", "scripts", () =>
    gulp
      .src("build/**/*")
      .pipe(zip(`trivia-for-reddit-${manifest.version}.zip`))
      .pipe(gulp.dest("bundle"))
  )
);
