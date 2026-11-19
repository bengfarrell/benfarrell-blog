const posthtml = require("posthtml");
const metadata = require("./_data/metadata.js");

const hostname = new URL(metadata.url).hostname.replace(/^www\./, "");
const internalHosts = new Set([hostname, `www.${hostname}`]);

module.exports = function(eleventyConfig) {
	eleventyConfig.addTransform("external-links", async function(content) {
		if (!this.outputPath?.endsWith(".html")) return content;

		const result = await posthtml([tree => tree.match({ tag: "a" }, node => {
			const href = node.attrs?.href;
			if (!href || !/^(?:https?:)?\/\//i.test(href)) return node;
			if (!URL.canParse(href, metadata.url)) {
				console.warn(`Invalid external link in ${this.outputPath}: ${href}`);
				return node;
			}
			if (internalHosts.has(new URL(href, metadata.url).hostname)) return node;

			node.attrs.target = "_blank";
			const rel = new Set((node.attrs.rel || "").split(/\s+/).filter(Boolean));
			rel.add("noopener");
			node.attrs.rel = [...rel].join(" ");
			return node;
		})]).process(content);

		return result.html;
	});
};
