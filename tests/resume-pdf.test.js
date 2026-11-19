const assert = require("node:assert/strict");
const { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const MarkdownIt = require("markdown-it");
const nunjucks = require("nunjucks");
const { PDFDocument, PDFDict, PDFName, PDFString, PDFHexString } = require("pdf-lib");
const buildResumePdf = require("../scripts/build-resume-pdf.js");
const metadata = require("../_data/metadata.js");

function linkTargets(pdf) {
	const targets = new Set();
	for (const page of pdf.getPages()) {
		for (const ref of page.node.Annots()?.asArray() || []) {
			const annotation = pdf.context.lookup(ref, PDFDict);
			if (annotation.get(PDFName.of("Subtype"))?.toString() !== "/Link") continue;
			const action = annotation.lookup(PDFName.of("A"), PDFDict);
			assert.equal(action.get(PDFName.of("S")).toString(), "/URI");
			const uri = action.lookup(PDFName.of("URI"));
			assert.ok(uri instanceof PDFString || uri instanceof PDFHexString);
			targets.add(uri.decodeText());
		}
	}
	return [...targets].sort();
}

test("the built resume PDF has clickable public links and regenerates from the page", async t => {
	const output = await mkdtemp(path.join(os.tmpdir(), "resume-pdf-"));
	t.after(() => rm(output, { recursive: true }));
	await mkdir(path.join(output, "resume"));
	await mkdir(path.join(output, "css"));
	await Promise.all(["index.css", "resume.css"].map(name =>
		copyFile(path.join("public", "css", name), path.join(output, "css", name))));

	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("_includes"));
	env.addFilter("absoluteUrl", require("@11ty/eleventy-plugin-rss").absoluteUrl);
	const stripFrontMatter = source => source.replace(/^---\n[\s\S]*?\n---\n/, "");
	const source = stripFrontMatter(await readFile("content/resume.md", "utf8"));
	const content = new MarkdownIt({ html: true }).render(env.renderString(source, { metadata }));
	const context = {
		metadata,
		title: "Resume | Ben Farrell",
		pageHeading: "Ben Farrell",
		resumePage: true,
		page: { url: "/resume/" },
	};
	const page = env.renderString(stripFrontMatter(await readFile("_includes/layouts/page.njk", "utf8")),
		{ ...context, content });
	const html = env.render("layouts/base.njk", { ...context, content: page });
	const htmlPath = path.join(output, "resume", "index.html");
	await writeFile(htmlPath, html);

	const file = await buildResumePdf(output);
	assert.equal(file, path.join(output, "resume", "Ben-Farrell-Resume.pdf"));
	const pdf = await PDFDocument.load(await readFile(file));
	assert.equal(pdf.getTitle(), context.title);
	assert.ok(pdf.getPageCount() >= 1 && pdf.getPageCount() <= 2);
	assert.deepEqual(linkTargets(pdf), [
		`mailto:${metadata.author.email}`,
		new URL(metadata.url).href,
		"https://github.com/bengfarrell",
		"https://www.linkedin.com/in/bfarrellforever/",
		new URL("/work/adobe/", metadata.url).href,
		new URL("/work/installations/", metadata.url).href,
		"https://www.manning.com/books/web-components-in-action",
	].sort());

	const updated = html
		.replace("<title>Resume | Ben Farrell</title>", "<title>Updated resume</title>")
		.replace('href="https://github.com/bengfarrell"', 'href="https://github.com/updated-profile"');
	await writeFile(htmlPath, updated);
	await buildResumePdf(output);
	const regenerated = await PDFDocument.load(await readFile(file));
	assert.equal(regenerated.getTitle(), "Updated resume");
	assert.ok(linkTargets(regenerated).includes("https://github.com/updated-profile"));
	assert.ok(!linkTargets(regenerated).includes("https://github.com/bengfarrell"));
});

test("missing resume build inputs fail explicitly rather than leaving a successful export", async t => {
	const output = await mkdtemp(path.join(os.tmpdir(), "resume-pdf-missing-"));
	t.after(() => rm(output, { recursive: true }));
	await assert.rejects(buildResumePdf(output), { code: "ENOENT" });
	await assert.rejects(readFile(path.join(output, "resume", "Ben-Farrell-Resume.pdf")), { code: "ENOENT" });
});
