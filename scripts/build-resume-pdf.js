const { readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");
const posthtml = require("posthtml");
const metadata = require("../_data/metadata.js");

module.exports = async function buildResumePdf(outputDirectory) {
	const [html, sharedStyles, resumeStyles] = await Promise.all([
		readFile(path.join(outputDirectory, "resume", "index.html"), "utf8"),
		readFile(path.join(outputDirectory, "css", "index.css"), "utf8"),
		readFile(path.join(outputDirectory, "css", "resume.css"), "utf8"),
	]);
	const rendered = await posthtml([tree => {
		tree.match({ tag: "script" }, () => "");
		tree.match({ tag: "link", attrs: { rel: "stylesheet" } }, () => "");
		tree.match({ tag: "head" }, node => {
			node.content = [
				{ tag: "base", attrs: { href: metadata.url } },
				...(node.content || []),
				{ tag: "style", content: [sharedStyles, resumeStyles] },
			];
			return node;
		});
		return tree;
	}]).process(html);

	const { default: puppeteer } = await import("puppeteer");
	const browser = await puppeteer.launch({
		channel: process.platform === "darwin" ? "chrome" : undefined,
		// Netlify's build container cannot provide Chrome's OS sandbox.
		args: process.env.NETLIFY ? ["--no-sandbox"] : [],
	});
	try {
		const page = await browser.newPage();
		await page.setJavaScriptEnabled(false);
		await page.setRequestInterception(true);
		page.on("request", request => request.abort());
		await page.emulateMediaType("print");
		await page.setContent(rendered.html, { waitUntil: "load" });
		await page.evaluate(() => document.fonts.ready);
		const pdf = await page.pdf({
			format: "Letter",
			displayHeaderFooter: false,
			printBackground: false,
			tagged: true,
		});
		const output = path.join(outputDirectory, "resume", "Ben-Farrell-Resume.pdf");
		await writeFile(output, pdf);
		console.log(`[resume] Generated ${output}`);
		return output;
	} finally {
		await browser.close();
	}
};
