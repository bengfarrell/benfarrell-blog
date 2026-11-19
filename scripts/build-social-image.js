const { copyFile, mkdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const nunjucks = require("nunjucks");
const image = require("@11ty/eleventy-img");
const posthtml = require("posthtml");

module.exports = async function buildSocialImage(outputDirectory) {
	const [template, portrait] = await Promise.all([
		readFile("_includes/social-preview.svg.njk", "utf8"),
		readFile("public/images/benvector.svg"),
	]);
	const embedded = await posthtml([tree => tree.match({ tag: "svg" }, node => {
		node.attrs = { ...node.attrs, x: 804, y: 106, width: 300, height: 410 };
		return node;
	})]).process(portrait.toString("utf8"), { recognizeSelfClosing: true });
	const svg = nunjucks.renderString(template, { portrait: embedded.html });
	const rendered = await image(Buffer.from(svg), {
		widths: [1200],
		formats: ["png"],
		outputDir: path.join(outputDirectory, "img"),
	});
	await mkdir(path.join(outputDirectory, "images"), { recursive: true });
	await copyFile(rendered.png[0].outputPath, path.join(outputDirectory, "images", "social-preview.png"));
};
