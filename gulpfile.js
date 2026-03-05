import fs, { promises as fsPromises } from "node:fs";
import gulp from "gulp";
import zip from "gulp-zip";
import { rolldown } from "rolldown";

gulp.task("scripts", async () => {
  const bundle = await rolldown({
    input: {
      app: "src/app.jsx",
      options: "src/options.jsx",
    },
    resolve: {
      alias: {
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
        "react/jsx-runtime": "preact/jsx-runtime",
      },
    },
  });
  return bundle.write({
    dir: "build",
    minify: true,
  });
});

gulp.task("build", () =>
  gulp
    .src(["src/index.html", "src/options.html", "src/manifest.json"])
    .pipe(gulp.dest("build")),
);

gulp.task("images", () =>
  gulp.src("src/*img/*", { encoding: false }).pipe(gulp.dest("build")),
);

gulp.task("clean:build", () =>
  fsPromises.rm("build", { force: true, recursive: true }),
);
gulp.task("clean:bundle", () =>
  fsPromises.rm("bundle", { force: true, recursive: true }),
);

gulp.task(
  "default",
  gulp.series("build", "scripts", () => {
    gulp.watch("src/**/*.html", gulp.series("build"));
    gulp.watch("src/**/*.jsx", gulp.series("scripts"));
  }),
);

const manifest = JSON.parse(fs.readFileSync("src/manifest.json", "utf8"));

gulp.task(
  "bundle",
  gulp.series("clean:bundle", "build", "images", "scripts", () =>
    gulp
      .src("build/**/*", { encoding: false })
      .pipe(zip(`trivia-for-reddit-${manifest.version}.zip`))
      .pipe(gulp.dest("bundle")),
  ),
);
