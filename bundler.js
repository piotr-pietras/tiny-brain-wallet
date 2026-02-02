import esbuild from "esbuild";
import { execSync } from "node:child_process";

const esbuildConfig = {
  entryPoints: ["src/renderer/index.tsx"],
  bundle: true,
  outfile: "src/renderer/out/bundle.js",
  jsx: "automatic",
  loader: {
    ".png": "file",
    ".svg": "file",
  },
  assetNames: "assets/[name]-[hash]",
  minify: false,
  sourcemap: false,
};

async function bundleRenderer({ watch = false } = {}) {
  if (!watch) {
    await esbuild.build(esbuildConfig);
    return;
  }

  const ctx = await esbuild.context(esbuildConfig);
  await ctx.watch();
}

const args = process.argv.slice(2);
const start = args.includes("--start");
const watch = args.includes("--watch");

console.info("🏗️  Rebundling...");
execSync("npx tsc -p ./src/main --outDir ./src/main/out"); // bundle main
await bundleRenderer({ watch });
execSync("cp src/renderer/public/* src/renderer/out/ -r");

if (start) {
  console.info("⚙️  Starting the app...");
  if (watch) {
    console.info(
      "🔥 Hot reloading mode for renderer files...\n👀 To see changes use Ctrl+Shift+R"
    );
  }
  execSync("npx electron .", { stdio: "inherit" });
}
