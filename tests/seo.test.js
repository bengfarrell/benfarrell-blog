const assert = require("node:assert/strict");
const { mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const nunjucks = require("nunjucks");
const posthtml = require("posthtml");
const metadata = require("../_data/metadata.js");
const { seoMetadata, sitemapEntries } = require("../eleventy.config.seo.js");
const buildSocialImage = require("../scripts/build-social-image.js");

test("page titles are branded without duplicating the name or changing canonical URLs", () => {
	assert.equal(seoMetadata({ title: "Work history", page: { url: "/positions-held/" } }).title, "Work history | Ben Farrell");
	assert.equal(seoMetadata({ title: "Resume | Ben Farrell", page: { url: "/resume/" } }).title, "Resume | Ben Farrell");
	const second = seoMetadata({
		title: "Blog",
		description: "Writing on design and code.",
		page: { url: "/blog/page-2/" },
		pagination: { pageNumber: 1 },
	});
	assert.equal(second.title, "Blog - Page 2 | Ben Farrell");
	assert.equal(second.description, "Writing on design and code. Page 2.");
	assert.equal(second.url, "https://benfarrell.com/blog/page-2/");
	assert.equal(seoMetadata({}).url, "https://benfarrell.com/");
});

test("automatic descriptions use readable page paragraphs rather than navigation, code, or comments", () => {
	const seo = seoMetadata({
		title: "A prototype",
		content: `<header><p>Header text</p></header>
			<div class="entry-content">
				<p><img src="/example.png" alt="Not a description"></p>
				<p hidden>Hidden text</p>
				<nav><p>Navigation text</p></nav>
				<pre><p>Code example</p></pre>
				<p>Building &amp; testing <a href="/work/adobe/">creative tools</a> with <code>WebCodecs</code>.</p>
				<p>${"More about the prototype and its implementation. ".repeat(8)}</p>
			</div>
			<footer><p>Comment text</p></footer>`,
	});
	assert.match(seo.description, /^Building & testing creative tools with WebCodecs/);
	assert.ok(seo.description.length <= 160);
	assert.match(seo.description, /\.\.\.$/);
	assert.doesNotMatch(seo.description, /Header text|Hidden text|Navigation text|Code example|Comment text|Not a description|&amp;/);
	assert.equal(seoMetadata({ title: "Example", description: 'A "specific" description & explanation.' }).description,
		'A "specific" description & explanation.');
});

test("repeated article headlines get distinct search titles without altering the headline", () => {
	const seo = seoMetadata({
		title: "Codebass Radio",
		tags: ["posts"],
		page: { url: "/blog/radio/", date: new Date("2011-08-10T00:00:00Z") },
		content: "<p>Community radio for developers.</p>",
		posts: [
			{ url: "/blog/radio/", data: { title: "Codebass Radio" } },
			{ url: "/blog/radio-update/", data: { title: "Codebass Radio" } },
		],
	});
	assert.equal(seo.title, "Codebass Radio (2011-08-10) | Ben Farrell");
	assert.equal(seo.description, "Codebass Radio (2011-08-10): Community radio for developers.");
	assert.equal(JSON.parse(seo.jsonLd)["@graph"].at(-1).headline, "Codebass Radio");
});

test("profile and article structured data use verified identity and real publication dates", () => {
	const home = seoMetadata({ title: metadata.title, homepage: true, description: metadata.description });
	const graph = JSON.parse(home.jsonLd)["@graph"];
	const person = graph.find(node => node["@type"] === "Person");
	assert.equal(person.name, "Ben Farrell");
	assert.equal(person.jobTitle, "Design Engineer");
	assert.equal(person.worksFor.name, "Adobe");
	assert.deepEqual(person.sameAs, metadata.author.sameAs);
	assert.equal(graph.find(node => node["@type"] === "ProfilePage").mainEntity["@id"], person["@id"]);
	const article = seoMetadata({
		title: "A prototype",
		tags: ["posts"],
		page: { url: "/blog/a-prototype/", date: new Date("2026-03-23T00:00:00Z") },
		coverImage: "/images/work/premiere-color-mode.webp",
	});
	const post = JSON.parse(article.jsonLd)["@graph"].find(node => node["@type"] === "BlogPosting");
	assert.equal(post.datePublished, "2026-03-23T00:00:00.000Z");
	assert.equal(post.author["@id"], person["@id"]);
	assert.equal(post.mainEntityOfPage, "https://benfarrell.com/blog/a-prototype/");
	assert.equal(article.image, "https://benfarrell.com/images/work/premiere-color-mode.webp");
	assert.equal(article.type, "article");
	assert.equal(post.dateModified, undefined);
});

test("metadata is escaped for HTML and structured data cannot close its script element", async () => {
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("_includes"));
	env.addFilter("seoMetadata", seoMetadata);
	const title = 'A "quoted" title & </script><script>alert(1)</script>';
	const html = env.render("layouts/base.njk", {
		metadata,
		title: "A title",
		description: title,
		page: { url: "/example/" },
	});
	const { tree } = await posthtml().process(html, { decodeEntities: true });
	let description;
	let structured;
	tree.walk(node => {
		if (node.tag === "meta" && node.attrs?.name === "description") description = node.attrs.content;
		if (node.tag === "script" && node.attrs?.type === "application/ld+json") structured = node.content.join("");
		return node;
	});
	assert.equal(description, 'A "quoted" title &');
	assert.ok(JSON.parse(structured));
	const injected = seoMetadata({ title: "Literal &lt;/script&gt;", page: { url: "/example/" }, description: "An example" });
	assert.doesNotMatch(injected.jsonLd, /<\/script/i);
	assert.match(injected.jsonLd, /\\u003c\/script\\u003e/);
	assert.equal(JSON.parse(injected.jsonLd)["@graph"].at(-1).name, "Literal </script> | Ben Farrell");
	assert.doesNotMatch(html, /wp-json\/oembed/);
});

test("utility pages opt out of indexing and sitemap entries exclude non-pages and duplicates", async () => {
	const seo = seoMetadata({ title: "Search", noindex: true, page: { url: "/search/" } });
	assert.equal(seo.robots, "noindex, follow");
	assert.equal(seo.jsonLd, "");
	for (const file of ["content/search.md", "content/404.md"]) {
		assert.match(await readFile(file, "utf8"), /^noindex: true$/m);
		assert.match(await readFile(file, "utf8"), /^eleventyExcludeFromCollections: true$/m);
	}
	assert.deepEqual(sitemapEntries([
		{ url: "/", data: {} },
		{ url: "/resume/", data: {} },
		{ url: "/resume/", data: {} },
		{ url: "/blog/page-2/", data: {} },
		{ url: "/search/", data: { noindex: true } },
		{ url: "/404.html", data: { noindex: true } },
		{ url: "/private/", data: { sitemap: false } },
		{ url: "/feed/feed.xml", data: {} },
	]), ["/", "/blog/page-2/", "/resume/"]);
	const env = new nunjucks.Environment();
	env.addFilter("sitemapEntries", sitemapEntries);
	env.addFilter("absoluteUrl", require("@11ty/eleventy-plugin-rss").absoluteUrl);
	const strip = source => source.replace(/^---\n[\s\S]*?\n---\n/, "");
	const sitemap = env.renderString(strip(await readFile("content/sitemap.njk", "utf8")), {
		metadata,
		collections: { all: [{ url: "/", data: {} }, { url: "/blog/a&b/", data: {} }] },
	});
	assert.match(sitemap, /<loc>https:\/\/benfarrell.com\/<\/loc>/);
	assert.match(sitemap, /a&amp;b/);
	const robots = env.renderString(strip(await readFile("content/robots.njk", "utf8")), { metadata });
	assert.match(robots, /User-agent: \*\nAllow: \//);
	assert.match(robots, /Sitemap: https:\/\/benfarrell.com\/sitemap.xml/);
});

test("the default social card is generated as a 1200 by 630 PNG", async t => {
	const output = await mkdtemp(path.join(os.tmpdir(), "blog-social-image-"));
	t.after(() => rm(output, { recursive: true }));
	await buildSocialImage(output);
	const png = await readFile(path.join(output, "images", "social-preview.png"));
	assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
	assert.equal(png.readUInt32BE(16), 1200);
	assert.equal(png.readUInt32BE(20), 630);
	await writeFile(path.join(output, "images", "social-preview.png"), "Outdated preview");
	await buildSocialImage(output);
	assert.deepEqual(await readFile(path.join(output, "images", "social-preview.png")), png);
	const seo = seoMetadata({ title: "Example", coverImage: "/images/benvector.svg" });
	assert.equal(seo.image, "https://benfarrell.com/images/social-preview.png");
	assert.equal(seo.defaultImage, true);
});
