import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

mkdirSync("public/media", { recursive: true });
const assets = [
	["monthly.js", fileURLToPath(import.meta.resolve("@bengfarrell/monthly/dist/monthly.js"))],
	["monthly.css", fileURLToPath(import.meta.resolve("@bengfarrell/monthly/styles.css"))],
	["site.css", fileURLToPath(new URL("../client/monthly-site.css", import.meta.url))],
	...["posts.js", "media-types.js", "errors.js"].map(name => [
		`shared/${name}`,
		fileURLToPath(new URL(`../shared/${name}`, import.meta.resolve("@bengfarrell/monthly/core"))),
	]),
];
for (const [name, source] of assets) {
	const destination = `public/media/${name}`;
	const contents = readFileSync(source);
	// Avoid a watch/rebuild loop when generated assets have not changed.
	if (!existsSync(destination) || !readFileSync(destination).equals(contents)) {
		mkdirSync(dirname(destination), { recursive: true });
		writeFileSync(destination, contents);
	}
}
for (const name of ["app.js", "app.css"]) {
	const legacy = `public/media/${name}`;
	if (existsSync(legacy)) unlinkSync(legacy);
}
