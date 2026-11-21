import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("site assets come from the installed Monthly release rather than the legacy client", () => {
	execFileSync(process.execPath, ["scripts/build-media.mjs"], { stdio: "pipe" });
	for (const [filename, specifier] of [
		["monthly.js", "@bengfarrell/monthly/dist/monthly.js"],
		["monthly.css", "@bengfarrell/monthly/styles.css"],
	]) {
		assert.ok(readFileSync(`public/media/${filename}`).equals(readFileSync(new URL(import.meta.resolve(specifier)))));
	}
	for (const name of ["posts.js", "media-types.js", "errors.js"]) {
		assert.ok(readFileSync(`public/media/shared/${name}`).equals(
			readFileSync(new URL(`../shared/${name}`, import.meta.resolve("@bengfarrell/monthly/core"))),
		));
	}
	assert.ok(readFileSync("public/media/site.css").equals(readFileSync("client/monthly-site.css")));
	const viewer = readFileSync(new URL("../components/post-viewer.js", import.meta.resolve("@bengfarrell/monthly/core")), "utf8");
	assert.match(viewer, /monthly-post-viewer-media-multiple/);
	assert.match(viewer, /Previous asset/);
	assert.match(viewer, /Next asset/);
	const feed = readFileSync(new URL("../components/feed.js", import.meta.resolve("@bengfarrell/monthly/core")), "utf8");
	assert.doesNotMatch(feed, /monthly-post-expand/);
	assert.match(feed, /Expand \$\{label\}/);
	const styles = readFileSync("public/media/monthly.css", "utf8");
	assert.match(styles, /monthly-post-media-multiple/);
	assert.match(styles, /monthly-post-viewer-media-focused/);
	assert.equal(existsSync("public/media/app.js"), false);
	assert.equal(existsSync("public/media/app.css"), false);
	assert.equal(existsSync("dist/media-lambda.zip"), false);
	assert.equal(existsSync("dist/media-lambda/handler.mjs"), false);
	const uploader = readFileSync(new URL("./uploader.js", import.meta.resolve("@bengfarrell/monthly/core")), "utf8");
	assert.doesNotMatch(uploader, /setThumbnails|metadataAbort|metadataErrors/);
	const api = readFileSync(new URL("./api.js", import.meta.resolve("@bengfarrell/monthly/core")), "utf8");
	assert.doesNotMatch(api, /setThumbnails|["']\/thumbnails["']/);
});
