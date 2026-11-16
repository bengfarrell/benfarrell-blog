import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const result = await build({
	entryPoints: ["client/media.mjs"],
	bundle: true,
	minify: true,
	target: ["es2022"],
	outfile: "public/media/app.js",
	write: false,
});
mkdirSync("public/media", { recursive: true });
for (const file of result.outputFiles) {
	// Avoid a watch/rebuild loop when the generated bundle has not changed.
	if (!existsSync(file.path) || !readFileSync(file.path).equals(file.contents)) {
		writeFileSync(file.path, file.contents);
	}
}

await import("./build-media-api.mjs");
