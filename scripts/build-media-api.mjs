import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { zipSync } from "fflate";

const result = await build({
	entryPoints: ["infrastructure/media/handler.mjs"],
	bundle: true,
	minify: true,
	platform: "node",
	target: ["node22"],
	format: "esm",
	// Bundled CommonJS dependencies still need Node's require for built-in modules.
	banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
	outfile: "handler.mjs",
	write: false,
});
const archive = zipSync(
	{ "handler.mjs": result.outputFiles[0].contents },
	{ level: 9, mtime: new Date(1980, 0, 1) },
);
mkdirSync("dist", { recursive: true });
writeFileSync("dist/media-lambda.zip", archive);
console.log("Lambda deployment ZIP: dist/media-lambda.zip (handler: handler.handler)");
