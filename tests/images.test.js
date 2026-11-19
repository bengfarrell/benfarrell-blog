const assert = require("node:assert/strict");
const { mkdtemp, readFile, rm, stat } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const imagePlugin = require("../eleventy.config.images.js");

async function assertLocalImage(src) {
	assert.ok(src.startsWith("/images/work/"), `Expected a local work image: ${src}`);
	const info = await stat(path.join("public", src));
	assert.ok(info.isFile() && info.size > 0, `Missing image asset: ${src}`);
}

test("homepage featured images use local assets", async () => {
	const homepage = await readFile("content/index.njk", "utf8");
	const images = [...homepage.matchAll(/^\s+image: "([^"]+)"/gm)];
	assert.equal(images.length, 3);
	for (const [, src] of images) await assertLocalImage(src);
});

for (const [pageName, minimum] of [["adobe", 5], ["installations", 4]]) {
	test(`every ${pageName} example includes a local project image`, async () => {
		const page = await readFile(`content/work/${pageName}.md`, "utf8");
		const projects = page.split(/^## /m).slice(1);
		assert.ok(projects.length >= minimum);
		for (const project of projects) {
			const images = [...project.matchAll(/!\[[^\]]+\]\(([^)]+)\)/g)];
			assert.ok(images.length > 0, `Missing image for ${project.split("\n")[0]}`);
			for (const [, src] of images) await assertLocalImage(src);
		}
	});
}

test("image shortcode handles public URLs and content-relative image paths", async () => {
	const output = await mkdtemp(path.join(os.tmpdir(), "blog-images-"));
	let imageShortcode;
	imagePlugin({
		dir: { output },
		addAsyncShortcode(name, shortcode) {
			assert.equal(name, "image");
			imageShortcode = shortcode;
		},
	});

	try {
		for (const src of [
			"/images/work/intro-to-vr.webp",
			"../../public/images/work/intro-to-vr.webp",
		]) {
			const html = await imageShortcode.call(
				{ page: { inputPath: "content/blog/example.md" } },
				src,
				"Ben presenting",
				[120],
			);
			assert.equal(typeof html, "string");
			assert.match(html, /width="120"/);
			assert.match(html, /height="120"/);
			assert.match(html, /alt="Ben presenting"/);
			assert.doesNotMatch(html, /https?:\/\//);
		}
	} finally {
		await rm(output, { recursive: true });
	}
});
