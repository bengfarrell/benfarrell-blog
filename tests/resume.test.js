const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");
const MarkdownIt = require("markdown-it");
const nunjucks = require("nunjucks");
const posthtml = require("posthtml");
const metadata = require("../_data/metadata.js");

const source = readFileSync("public/js/resume.js", "utf8");

test("the print control is progressively enhanced and opens the print dialog", () => {
	let click;
	let printed = 0;
	const button = {
		hidden: true,
		addEventListener(event, callback) {
			assert.equal(event, "click");
			click = callback;
		},
	};
	vm.runInNewContext(source, {
		document: {
			querySelector(selector) {
				assert.equal(selector, "[data-resume-print]");
				return button;
			},
		},
		window: { print() { printed++; } },
	});
	assert.equal(button.hidden, false);
	assert.equal(printed, 0);
	click();
	assert.equal(printed, 1);
});

test("the print script is harmless without a print control", () => {
	vm.runInNewContext(source, { document: { querySelector: () => null } });
});

test("resume assets and body class are opt-in", () => {
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("_includes"));
	env.addFilter("absoluteUrl", require("@11ty/eleventy-plugin-rss").absoluteUrl);
	const template = readFileSync("_includes/layouts/base.njk", "utf8");
	const context = { metadata, title: "Resume | Ben Farrell", page: { url: "/resume/" } };
	const resume = env.renderString(template, { ...context, resumePage: true });
	assert.match(resume, /href="\/css\/resume\.css"/);
	assert.match(resume, /src="\/js\/resume\.js" defer/);
	assert.match(resume, /<body class="[^"]*\bresume-page\b/);
	const regular = env.renderString(template, context);
	assert.doesNotMatch(regular, /\/css\/resume\.css|\/js\/resume\.js|\bresume-page\b/);
});

test("the page heading can differ from the browser title without changing other pages", () => {
	const env = new nunjucks.Environment();
	const template = readFileSync("_includes/layouts/page.njk", "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
	assert.match(env.renderString(template, {
		title: "Resume | Ben Farrell",
		pageHeading: "Ben Farrell",
	}), /<h1 class="entry-title">Ben Farrell<\/h1>/);
	assert.match(env.renderString(template, { title: "Museum installations" }),
		/<h1 class="entry-title">Museum installations<\/h1>/);
});

test("the resume is self-contained and corrected dates agree with the work archive", () => {
	const resume = readFileSync("content/resume.md", "utf8");
	assert.match(resume, /^resumePage: true$/m);
	for (const section of ["Experience", "Capabilities", "Recognition & contributions"]) {
		assert.ok(resume.includes(`## ${section}`));
	}
	for (const employer of ["Adobe", "General Electric", "Digitalsmiths", "360KID"]) {
		assert.ok(resume.includes(`### ${employer}`));
	}
	assert.match(resume, /Helped prototype Premiere Color Mode/);
	assert.match(resume, /Prototyped motion and agentic motion for Firefly Design/);
	assert.match(resume, /Senior Software Engineer <span>2008-2011<\/span>/);
	assert.match(resume, /href="mailto:{{ metadata.author.email }}"/);
	assert.match(resume, /data-resume-print hidden/);
	assert.doesNotMatch(resume, /\]\(\/portfolio\/\)/);
	const history = readFileSync("content/positions-held.md", "utf8");
	assert.match(history, /## Digitalsmiths\n\n<p class="work-entry-meta">Senior Software Engineer \| 2008-2011<\/p>/);
});

test("PDF links use public URLs and archive navigation is grouped separately", async () => {
	const env = new nunjucks.Environment();
	env.addFilter("absoluteUrl", require("@11ty/eleventy-plugin-rss").absoluteUrl);
	const resume = readFileSync("content/resume.md", "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
	const html = new MarkdownIt({ html: true }).render(env.renderString(resume, { metadata }));
	const { tree } = await posthtml().process(html);
	const links = [];
	function collect(nodes, archive = false) {
		for (const node of nodes) {
			if (typeof node !== "object") continue;
			const isArchive = archive || ["resume-archive-links", "resume-tools"].includes(node.attrs?.class);
			if (node.tag === "a") links.push({ href: node.attrs.href, archive: isArchive });
			if (node.content) collect(node.content, isArchive);
		}
	}
	collect(tree);
	assert.deepEqual(links.filter(link => !link.archive).map(link => link.href), [
		`mailto:${metadata.author.email}`,
		metadata.url,
		"https://github.com/bengfarrell",
		"https://www.linkedin.com/in/bfarrellforever/",
		new URL("/work/adobe/", metadata.url).href,
		new URL("/work/installations/", metadata.url).href,
		"https://www.manning.com/books/web-components-in-action",
	]);
	assert.deepEqual(links.filter(link => link.archive).map(link => link.href), [
		"/resume/Ben-Farrell-Resume.pdf",
		"/positions-held/",
		"/awards/",
		"/speaking-engagements/",
	]);
});

test("the PDF downloads directly without JavaScript and printing is a separate action", () => {
	const resume = readFileSync("content/resume.md", "utf8");
	assert.match(resume, /<a class="resume-download" href="\/resume\/Ben-Farrell-Resume\.pdf" download="Ben-Farrell-Resume\.pdf" type="application\/pdf">Download PDF<\/a>/);
	assert.match(resume, /<button[^>]+data-resume-print hidden>Print<\/button>/);
});

test("the retired skills inventory is removed without a redirect or directory link", () => {
	assert.throws(() => readFileSync("content/skills.md"), { code: "ENOENT" });
	assert.throws(() => readFileSync("content/skills.njk"), { code: "ENOENT" });
	const resume = readFileSync("content/resume.md", "utf8");
	assert.match(resume, /^## Capabilities$/m);
	assert.doesNotMatch(resume, /\/skills\/|Full skills background/);
});
