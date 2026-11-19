const posthtml = require("posthtml");
const metadata = require("./_data/metadata.js");

function rawText(nodes = []) {
	return nodes.map(node => {
		if (typeof node === "string") return node.startsWith("<!--") ? "" : node;
		if (["script", "style", "pre", "nav", "footer", "aside"].includes(node.tag) ||
			node.attrs?.hidden !== undefined || node.attrs?.["aria-hidden"] === "true") return "";
		if (node.tag === "br") return " ";
		return rawText(node.content);
	}).join("");
}

function text(nodes) {
	return rawText(nodes).replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

function plainText(html) {
	return text(posthtml().process(html, { sync: true, decodeEntities: true }).tree);
}

function excerpt(html) {
	let content;
	const { tree } = posthtml([tree => {
		tree.walk(node => {
			if (!content && node.attrs?.class?.split(/\s+/).includes("entry-content")) content = node.content;
			return node;
		});
		return tree;
	}]).process(html, { sync: true, decodeEntities: true });
	const paragraphs = [];
	function collect(nodes) {
		for (const node of nodes) {
			if (typeof node === "string") continue;
			if (["script", "style", "pre", "nav", "footer", "aside"].includes(node.tag) ||
				node.attrs?.hidden !== undefined || node.attrs?.["aria-hidden"] === "true") continue;
			if (node.tag === "p") paragraphs.push(text(node.content));
			else if (node.content) collect(node.content);
		}
	}
	collect(content || tree);
	return paragraphs.filter(Boolean).join(" ");
}

function summarize(value) {
	if (value.length <= 160) return value;
	const prefix = value.slice(0, 157);
	const boundary = prefix.lastIndexOf(" ");
	return `${(boundary > 80 ? prefix.slice(0, boundary) : prefix).replace(/[ ,;:.-]+$/, "")}...`;
}

function seoMetadata(data) {
	const url = new URL(data.page?.url || "/", metadata.url).href;
	const home = data.homepage || url === new URL("/", metadata.url).href;
	const article = Array.isArray(data.tags) && data.tags.includes("posts");
	const headline = plainText(data.title || metadata.title);
	const published = article ? new Date(data.page.date).toISOString() : undefined;
	const repeatedHeadline = article && data.posts?.some(post =>
		post.url !== data.page.url && post.data.title === data.title);
	const pageNumber = data.pagination?.pageNumber || 0;
	let title = headline;
	if (repeatedHeadline) title += ` (${published.slice(0, 10)})`;
	if (pageNumber > 0) title += ` - Page ${pageNumber + 1}`;
	if (!title.includes(metadata.author.name)) title += ` | ${metadata.author.name}`;
	let description;
	if (data.description) description = plainText(data.description);
	else {
		const body = excerpt(data.content || "") || `${headline}. ${metadata.description}`;
		description = summarize(repeatedHeadline ? `${headline} (${published.slice(0, 10)}): ${body}` : body);
	}
	if (pageNumber > 0) description += ` Page ${pageNumber + 1}.`;
	let image = new URL(data.coverImage || metadata.image, metadata.url).href;
	if (new URL(image).pathname.toLowerCase().endsWith(".svg")) image = new URL(metadata.image, metadata.url).href;
	const defaultImage = image === new URL(metadata.image, metadata.url).href;
	const personId = new URL("/#person", metadata.url).href;
	const websiteId = new URL("/#website", metadata.url).href;
	const person = {
		"@type": "Person",
		"@id": personId,
		name: metadata.author.name,
		url: new URL("/", metadata.url).href,
		jobTitle: metadata.author.jobTitle,
		worksFor: { "@type": "Organization", name: "Adobe", url: "https://www.adobe.com/" },
		sameAs: metadata.author.sameAs,
	};
	const page = {
		"@type": home ? "ProfilePage" : article ? "BlogPosting" : "WebPage",
		"@id": `${url}${article ? "#article" : "#webpage"}`,
		url,
		name: title,
		description,
		inLanguage: "en-US",
		isPartOf: { "@id": websiteId },
	};
	if (home) page.mainEntity = { "@id": personId };
	else if (!article) page.about = { "@id": personId };
	if (article) {
		page.headline = headline;
		page.author = { "@id": personId, "@type": "Person", name: metadata.author.name, url: person.url };
		page.datePublished = published;
		page.mainEntityOfPage = url;
		page.image = [image];
	}
	const graph = {
		"@context": "https://schema.org",
		"@graph": [
			person,
			{
				"@type": "WebSite",
				"@id": websiteId,
				name: metadata.author.name,
				url: person.url,
				inLanguage: "en-US",
			},
			page,
		],
	};
	const escapes = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" };
	return {
		title,
		description,
		url,
		image,
		imageAlt: defaultImage ? metadata.imageAlt : headline,
		defaultImage,
		type: article ? "article" : "website",
		robots: data.noindex ? "noindex, follow" : "max-image-preview:large",
		published: article ? page.datePublished : undefined,
		jsonLd: data.noindex ? "" : JSON.stringify(graph).replace(/[<>&\u2028\u2029]/g, character => escapes[character]),
	};
}

function sitemapEntries(items) {
	return [...new Set(items
		.filter(item => !item.data.noindex && item.data.sitemap !== false)
		.map(item => item.url)
		.filter(url => url && (url.endsWith("/") || url.endsWith(".html"))))]
		.sort();
}

module.exports = function(eleventyConfig) {
	eleventyConfig.addFilter("seoMetadata", seoMetadata);
	eleventyConfig.addFilter("sitemapEntries", sitemapEntries);
};
module.exports.seoMetadata = seoMetadata;
module.exports.sitemapEntries = sitemapEntries;
