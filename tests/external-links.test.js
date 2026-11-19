const assert = require("node:assert/strict");
const { test } = require("node:test");
const posthtml = require("posthtml");
const linksPlugin = require("../eleventy.config.links.js");

let transform;
linksPlugin({
	addTransform(name, callback) {
		assert.equal(name, "external-links");
		transform = callback;
	},
});

async function links(html) {
	const result = await transform.call({ outputPath: "_site/index.html" }, html);
	const anchors = [];
	await posthtml([tree => tree.match({ tag: "a" }, node => {
		anchors.push(node.attrs);
		return node;
	})]).process(result);
	return anchors;
}

test("external web links open a new tab and preserve existing rel tokens", async () => {
	const anchors = await links(`
		<a href="https://adobe.com/work">Adobe</a>
		<a href="//github.com/example" target="_self" rel="me nofollow">GitHub</a>
		<a href="HTTP://example.com" rel="noopener noreferrer">Example</a>
		<a href="https://benfarrell.com.example.org">Different site</a>
	`);
	for (const anchor of anchors) {
		assert.equal(anchor.target, "_blank");
		assert.ok(anchor.rel.split(/\s+/).includes("noopener"));
	}
	assert.equal(anchors[1].rel, "me nofollow noopener");
	assert.equal(anchors[2].rel, "noopener noreferrer");
});

test("internal navigation, anchors, and non-web links stay unchanged", async () => {
	const hrefs = [
		"/work/adobe/", "../resume/", "#about", "https://benfarrell.com/blog/",
		"http://www.benfarrell.com/", "//benfarrell.com/", "mailto:ben@example.com",
		"tel:+15555550123", "data:text/plain,example",
	];
	const anchors = await links(hrefs.map(href => `<a href="${href}">Link</a>`).join(""));
	assert.deepEqual(anchors.map(anchor => anchor.href), hrefs);
	assert.ok(anchors.every(anchor => !anchor.target && !anchor.rel));
	const [existing] = await links('<a href="/blog/" target="_blank" rel="bookmark">Blog</a>');
	assert.equal(existing.target, "_blank");
	assert.equal(existing.rel, "bookmark");
});

test("HTML processing preserves scripts, escaped code, and repeated transforms", async () => {
	const html = `<script>const text = '<a href="https://example.com">';</script>
		<pre><code>&lt;a href="https://example.com"&gt;</code></pre>
		<a href="https://example.com">Actual link</a>`;
	const once = await transform.call({ outputPath: "_site/index.html" }, html);
	const twice = await transform.call({ outputPath: "_site/index.html" }, once);
	assert.equal(once, twice);
	assert.match(once, /<script>const text = '<a href="https:\/\/example.com">';<\/script>/);
	assert.match(once, /&lt;a href="https:\/\/example.com"&gt;/);
	assert.equal((await links(once)).length, 1);
});

test("feeds and other non-HTML output are not rewritten", async () => {
	const feed = '<a href="https://example.com">Feed content</a>';
	for (const outputPath of ["_site/feed/feed.xml", "_site/feed/feed.json", undefined]) {
		assert.equal(await transform.call({ outputPath }, feed), feed);
	}
});
