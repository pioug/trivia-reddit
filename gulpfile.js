import fs from "node:fs";
import { deleteAsync } from "del";
import gulp from "gulp";
import zip from "gulp-zip";
import { rollup } from "rollup";

import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

gulp.task("scripts", async () => {
  const bundle = await rollup({
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
      nodeResolve(),
      babel({
        babelHelpers: "bundled",
      }),
      terser(),
    ],
  });
  return bundle.write({
    dir: "build",
    format: "es",
  });
});

gulp.task("build", () =>
  gulp
    .src(["src/index.html", "src/options.html", "src/manifest.json"])
    .pipe(gulp.dest("build"))
);

gulp.task("images", () => gulp.src("src/*img/*").pipe(gulp.dest("build")));

gulp.task("clean:build", () => deleteAsync(["build"]));
gulp.task("clean:bundle", () => deleteAsync(["bundle"]));

gulp.task(
  "default",
  gulp.series("build", "scripts", () => {
    gulp.watch("src/**/*.html", gulp.series("build"));
    gulp.watch("src/**/*.jsx", gulp.series("scripts"));
  })
);

const manifest = JSON.parse(fs.readFileSync("src/manifest.json", "utf8"));

gulp.task(
  "bundle",
  gulp.series("clean:bundle", "build", "images", "scripts", () =>
    gulp
      .src("build/**/*")
      .pipe(zip(`trivia-for-reddit-${manifest.version}.zip`))
      .pipe(gulp.dest("bundle"))
  )
);
