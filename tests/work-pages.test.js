const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const { test } = require("node:test");
const MarkdownIt = require("markdown-it");
const posthtml = require("posthtml");

async function readWorkPage(file) {
	const source = await readFile(file, "utf8");
	const frontMatter = source.match(/^---\n[\s\S]*?\n---\n/);
	assert.ok(frontMatter, `Missing front matter: ${file}`);
	assert.match(frontMatter[0], /^workEntries: true$/m);
	const html = new MarkdownIt({ html: true }).render(source.slice(frontMatter[0].length));
	const { tree } = await posthtml().process(html);
	return tree.filter(node => typeof node === "object");
}

for (const [file, count, dividerCount = count - 1] of [
	["content/work/adobe.md", 5],
	["content/work/installations.md", 4],
	["content/speaking-engagements.md", 28],
	["content/positions-held.md", 11, 24],
	["content/awards.md", 31],
]) {
	test(`${file} separates every entry with a shared divider`, async () => {
		const nodes = await readWorkPage(file);
		assert.equal(nodes.filter(node => node.tag === "h2").length, count);
		assert.equal(nodes.filter(node => node.tag === "hr").length, dividerCount);
		for (const [index, node] of nodes.entries()) {
			if (node.tag === "hr") assert.ok(["h2", "h3"].includes(nodes[index + 1].tag));
		}
	});
}

test("awards retain dated recognition, patent links, and project attribution", async () => {
	const nodes = await readWorkPage("content/awards.md");
	const metadata = nodes.filter(node => node.attrs?.class === "work-entry-meta");
	assert.equal(metadata.length, 31);
	const years = metadata.map(node => Number(node.content.join("").match(/\b(?:19|20)\d{2}\b/)[0]));
	assert.deepEqual(years, [...years].sort((a, b) => b - a));
	assert.equal(years[0], 2026);
	assert.equal(years.at(-1), 2004);
	const source = await readFile("content/awards.md", "utf8");
	for (const url of [
		"https://patentsgazette.uspto.gov/week26/OG/html/1547-5/US12670636-20260630.html",
		"https://www.provideocoalition.com/best-in-show-awards-at-nab-2026/",
		"https://patentsgazette.uspto.gov/week07/OG/html/1543-3/US12555281-20260217.html",
		"https://patents.google.com/patent/US10649638B2/",
		"https://www.commarts.com/project/24685/self-composed",
		"http://www.streamingmedia.com/Articles/Editorial/Featured-Articles/The-List-of-the-100-Companies-that-Matter-Most-in-Online-Video-78122.aspx",
	]) assert.ok(source.includes(`](${url})`), `Missing award or patent link: ${url}`);
	for (const name of ["Adobe", "Digitalsmiths", "360KID", "SFMOMA"]) {
		assert.ok(source.includes(name), `Missing project attribution: ${name}`);
	}
});

test("work history retains every role and the resume's current experience wording", async () => {
	const nodes = await readWorkPage("content/positions-held.md");
	assert.deepEqual(nodes.filter(node => node.tag === "h2").map(node => node.content.join("")), [
		"Adobe",
		"Adobe Design Lab",
		"General Electric",
		"Digitalsmiths",
		"360KID",
		"ReadyAbout Interactive",
		"JuniorNet",
		"Academy of Electronic Media",
		"Project Links",
		"Idea Consultants",
		"Community &amp; independent work",
	]);
	const metadata = nodes.filter(node => node.attrs?.class === "work-entry-meta");
	assert.equal(metadata.length, 25);
	assert.equal(metadata[3].content.join(""), "Senior Software Engineer | 2008-2011");

	const history = await readFile("content/positions-held.md", "utf8");
	const resume = await readFile("content/resume.md", "utf8");
	const experience = resume.split("## Experience\n")[1].split("## Capabilities\n")[0];
	const bullets = [...experience.matchAll(/^- (.+)$/gm)].map(match => match[1]);
	assert.ok(bullets.length > 0);
	for (const bullet of bullets) {
		assert.ok(history.includes(`- ${bullet}\n`), `Work history needs the current resume wording: ${bullet}`);
	}
	assert.match(history, /Contributed Objective-C application code to Note to Self/);
	assert.match(history, /\[resume\]\(\/resume\/\)/);
});

test("community work includes the video series and museum projects without restoring the affiliations page", async () => {
	const nodes = await readWorkPage("content/positions-held.md");
	const start = nodes.findIndex(node => node.tag === "h2" && node.content.includes("Community &amp; independent work"));
	assert.ok(start !== -1);
	const community = nodes.slice(start + 1);
	assert.deepEqual(community.filter(node => node.tag === "h3").map(node => node.content.join("")), [
		"Sun Gallery",
		"Web Components in Space",
		"de Youngsters Art Party",
		"Note to Self",
		"Manning Publications",
		"Self Composed",
		"Shark Attack Radio Show",
		"Refresh The Triangle",
		"Runtime Expectations",
		"MediaSlurp",
		"Codebass Radio",
		"Tri-ME",
		"RDAUG",
		"Mercury Charm Offensive",
		"Brookfield Public Access",
	]);
	const metadata = community.filter(node => node.attrs?.class === "work-entry-meta");
	assert.equal(metadata.length, 15);
	assert.equal(metadata[0].content.join(""), "Board Member | 2022-2024");
	assert.equal(metadata[1].content.join(""), "Creator / Producer | 2022-2024");
	assert.equal(metadata[2].content.join(""), "Technology lead | 2020-2021");
	assert.equal(metadata[3].content.join(""), "Application development | 2019");
	assert.equal(metadata[5].content.join(""), "Software development | 2016");
	const history = await readFile("content/positions-held.md", "utf8");
	const communitySource = history.split("## Community & independent work\n")[1];
	assert.match(communitySource, /Contributed Objective-C application code to \[Note to Self\]/);
	for (const url of [
		"http://webcomponents.space",
		"/blog/2020-04-27-superheroes/",
		"/blog/2019-02-01-notetoself/",
		"/blog/2016-10-16-selfcomposed/",
	]) assert.ok(communitySource.includes(`](${url})`), `Missing project link: ${url}`);
	const speaking = await readFile("content/speaking-engagements.md", "utf8");
	assert.match(speaking, /Video series \| 2022-2024/);
	assert.doesNotMatch(history, /\/affiliations\//);
	await assert.rejects(readFile("content/affiliations.md"), { code: "ENOENT" });
	await assert.rejects(readFile("content/affiliations.njk"), { code: "ENOENT" });
});

test("speaking and teaching are merged newest first without losing the VR anchor", async () => {
	const nodes = await readWorkPage("content/speaking-engagements.md");
	const headings = nodes.filter(node => node.tag === "h2");
	const titles = headings.map(node => node.content.join(""));
	const metadata = nodes.filter(node => node.attrs?.class === "work-entry-meta");
	assert.equal(metadata.length, headings.length);
	assert.deepEqual(titles.slice(0, 8), [
		"Web Components in Space",
		"TensorFlow.js Community Show and Tell",
		"Web Components in Space!",
		"Web Components in Action",
		"Prototyping for Project Aero",
		"Mixed Reality Pavilion",
		"WebVR Workshop",
		"Intro to VR",
	]);
	for (const title of [
		"Hands-on Flex Session",
		"Adobe Flex 4 for Coldfusion Developers",
		"Harvard University",
	]) assert.ok(titles.includes(title), `Missing teaching entry: ${title}`);
	assert.equal(headings.find(node => node.content.includes("Intro to VR")).attrs.id, "intro-to-vr");

	const details = metadata.map(node => node.content.join(""));
	const dated = details.filter(text => !text.includes("Undated"));
	const years = dated.map(text => Number(text.match(/\b(?:19|20)\d{2}\b/)[0]));
	assert.deepEqual(years, [...years].sort((a, b) => b - a));
	assert.equal(details.filter(text => text.includes("Undated")).length, 7);
	assert.ok(details.slice(-7).every(text => text.includes("Undated")));
	assert.ok(titles.indexOf("Creative NodeJS") < titles.indexOf("Front End vs Backend"));
});

test("the standalone teaching page is removed and navigation uses the combined label", async () => {
	await assert.rejects(readFile("content/teaching.md"), { code: "ENOENT" });
	await assert.rejects(readFile("content/teaching.njk"), { code: "ENOENT" });

	const resume = await readFile("content/resume.md", "utf8");
	assert.match(resume, /\[Speaking & teaching\]\(\/speaking-engagements\/\)/);
	assert.doesNotMatch(resume, /\]\(\/teaching\/\)/);
	const homepage = await readFile("content/index.njk", "utf8");
	assert.match(homepage, /context: "Speaking & teaching"/);
	assert.match(homepage, /moreLabel: "More speaking & teaching"/);
});
