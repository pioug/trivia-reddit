import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import { rolldown } from "rolldown";

const src = "src";
const build = "build";
const bundle = "bundle";

await fs.rm(build, { force: true, recursive: true });
await fs.mkdir(build, { recursive: true });

await Promise.all([
  copyHtml("index.html"),
  copyHtml("options.html"),
  fs.copyFile(`${src}/manifest.json`, `${build}/manifest.json`),
  fs.cp(`${src}/img`, `${build}/img`, { recursive: true }),
  bundleScript("app", true),
  bundleScript("options"),
]);

if (process.argv.includes("--bundle")) {
  const manifest = JSON.parse(
    await fs.readFile(`${src}/manifest.json`, "utf8"),
  );
  await fs.rm(bundle, { force: true, recursive: true });
  await fs.mkdir(bundle, { recursive: true });
  execFileSync("zip", ["-qr", `../bundle/trivia-for-reddit-${manifest.version}.zip`, "."], {
    cwd: build,
    stdio: "inherit",
  });
}

async function copyHtml(file) {
  const html = await fs.readFile(`${src}/${file}`, "utf8");
  await fs.writeFile(
    `${build}/${file}`,
    html.replaceAll(' type="module"', ""),
  );
}

async function bundleScript(name, topLevelVar = false) {
  const result = await rolldown({
    input: {
      [name]: `${src}/${name}.js`,
    },
  });

  await result.write({
    dir: build,
    legalComments: "none",
    minify: true,
    topLevelVar,
  });
}
