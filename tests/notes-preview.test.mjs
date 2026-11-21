import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import { postUrl, readPosts, firstThumbnail, mediaType } from "@bengfarrell/monthly/core";

const source = readFileSync("public/js/notes-preview.js", "utf8")
	.replace(/^import .*;\n/gm, "");

class Node {
	constructor(tag) {
		this.tag = tag;
		this.children = [];
		this.textContent = "";
	}
	append(...nodes) { this.children.push(...nodes); }
	addEventListener(name, callback) { this[name] = callback; }
}

function copy(item) {
	return item.children[0].children.find(node => node.className === "home-note-copy");
}

async function preview(value, status = 200, now = "2026-11-19T12:00:00Z") {
	const list = new Node("ul");
	const month = new Node("span");
	const section = {
		hidden: true,
		dataset: { feedUrl: "https://cdn.example.com/uploads/" },
		querySelector: selector => selector === "[data-notes-list]" ? list : month,
	};
	const calls = [];
	const errors = [];
	const warnings = [];
	class Clock extends Date {
		constructor(...args) { super(...(args.length ? args : [now])); }
	}
	const context = vm.createContext({
		Date: Clock, URL, AbortSignal, postUrl, readPosts, firstThumbnail, mediaType,
		window: { location: { href: "https://benfarrell.com/" } },
		console: {
			error: (...args) => errors.push(args),
			warn: (...args) => warnings.push(args),
		},
		document: {
			querySelectorAll: () => [],
			createElement: tag => new Node(tag),
		},
		fetch: async (url, options) => {
			calls.push({ url, options });
			if (value instanceof Error) throw value;
			return { status, ok: status >= 200 && status < 300, json: async () => value };
		},
	});
	vm.runInContext(source, context);
	await context.loadPreview(section);
	return { section, list, month, calls, errors, warnings };
}

function post(text, day, media = []) {
	return {
		id: "6e809217-28d0-41bd-b722-4fc7b5524860",
		text, tags: [], media, created: `2026-11-${day}T00:00:00.000Z`,
	};
}

test("preview fetches only the current UTC month and shows two newest entries safely", async () => {
	const ui = await preview([
		post("Old", "01"), post("  Newest\n  update  ", "19"),
		post("<script>alert(1)</script>", "18"), post("Future", "20"),
	]);
	assert.equal(ui.calls.length, 1);
	assert.equal(ui.calls[0].url.href, "https://cdn.example.com/uploads/2026/11/posts.json");
	assert.equal(ui.calls[0].options.credentials, "omit");
	assert.equal(ui.calls[0].options.referrerPolicy, "no-referrer");
	assert.equal(ui.calls[0].options.cache, "no-cache");
	assert.ok(ui.calls[0].options.signal instanceof AbortSignal);
	assert.equal(ui.section.hidden, false);
	assert.equal(ui.month.textContent, " \u00b7 November");
	assert.equal(ui.list.children.length, 2);
	assert.equal(copy(ui.list.children[0]).children[1].textContent, "Newest update");
	assert.equal(copy(ui.list.children[1]).children[1].textContent, "<script>alert(1)</script>");
	assert.equal(copy(ui.list.children[0]).children[0].dateTime, "2026-11-19T00:00:00.000Z");
	assert.equal(copy(ui.list.children[0]).children[0].textContent, "Nov 19");
	assert.equal(ui.list.children[0].children[0].href,
		"https://benfarrell.com/memos/?month=2026-11#note-6e809217-28d0-41bd-b722-4fc7b5524860");
});

test("excerpts are at most 140 Unicode characters and media-only posts have a label", async () => {
	const ui = await preview([
		post("🎵".repeat(200), "19"),
		post("", "18", [{ key: "photo.jpg", size: 10, url: "https://cdn.example.com/photo.jpg" }]),
	]);
	const excerpt = copy(ui.list.children[0]).children[1].textContent;
	assert.equal(Array.from(excerpt).length, 140);
	assert.ok(excerpt.endsWith("\u2026"));
	assert.equal(copy(ui.list.children[1]).children[1].textContent, "New media shared on Memos.");
});

test("image attachments get one tiny lazy thumbnail, preferring an image over other assets", async () => {
	const ui = await preview([post("Mixed media", "19", [
		{ key: "movie.mp4", size: 10, url: "https://cdn.example.com/movie.mp4" },
		{ key: "photo.JPG", size: 10, url: "https://cdn.example.com/photo.JPG" },
		{ key: "other.png", size: 10, url: "https://cdn.example.com/other.png" },
	])]);
	const children = ui.list.children[0].children[0].children;
	const image = children[0];
	assert.equal(image.tag, "img");
	assert.equal(image.src, "https://cdn.example.com/photo.JPG");
	assert.equal(image.width, 44);
	assert.equal(image.height, 44);
	assert.equal(image.loading, "lazy");
	assert.equal(image.referrerPolicy, "no-referrer");
	assert.equal(image.alt, "");
	assert.equal(children.filter(node => node.tag === "img").length, 1);
	image.error();
	assert.equal(image.hidden, true);
	assert.equal(ui.warnings.length, 1);
});

test("audio and video attachments use local icons and never create players or load media", async () => {
	for (const [extension, kind] of [["MOV", "video"], ["mp3", "audio"], ["m4a", "audio"]]) {
		const url = `https://cdn.example.com/clip.${extension}`;
		const ui = await preview([post("Clip", "19", [{ key: `clip.${extension}`, size: 10, url }])]);
		const children = ui.list.children[0].children[0].children;
		assert.equal(children[0].tag, "img");
		assert.equal(children[0].src, `/images/note-${kind}.svg`);
		assert.match(children[0].className, /home-note-icon/);
		assert.equal(children.some(node => node.src === url || ["video", "audio"].includes(node.tag)), false);
		assert.equal(ui.calls.length, 1);
	}
});

test("homepage image previews use the first generated thumbnail instead of the original", async () => {
	const ui = await preview([post("Image", "19", [{
		key: "photo.jpg", size: 2000000, url: "https://cdn.example.com/photo.jpg",
		thumbnails: {
			"960x540": { key: "photo.jpg.thumb-960x540.jpg", size: 100, url: "https://cdn.example.com/first.jpg" },
			"320x180": { key: "photo.jpg.thumb-320x180.jpg", size: 50, url: "https://cdn.example.com/second.jpg" },
		},
	}])]);
	assert.equal(ui.list.children[0].children[0].children[0].src, "https://cdn.example.com/first.jpg");
});

test("homepage video previews remain icons even with new thumbnails or legacy posters", async () => {
	for (const extra of [
		{ thumbnails: { "960x540": { key: "movie.mp4.thumb-960x540.jpg", size: 100, url: "https://cdn.example.com/thumb.jpg" } } },
		{ poster: { key: "movie.mp4.poster.jpg", size: 100, url: "https://cdn.example.com/poster.jpg" } },
	]) {
		const ui = await preview([post("Video", "19", [{
			key: "movie.mp4", size: 10, url: "https://cdn.example.com/movie.mp4", ...extra,
		}])]);
		assert.equal(ui.list.children[0].children[0].children[0].src, "/images/note-video.svg");
	}
});

test("empty months and future-only entries leave the preview hidden", async () => {
	for (const entries of [[], [post("Future", "20")]]) {
		const ui = await preview(entries);
		assert.equal(ui.section.hidden, true);
		assert.equal(ui.list.children.length, 0);
		assert.equal(ui.errors.length, 0);
	}
});

test("missing files are logged and other HTTP, network, or invalid-data failures stay hidden", async () => {
	const missing = await preview(null, 404);
	assert.equal(missing.section.hidden, true);
	assert.equal(missing.warnings.length, 1);
	for (const [value, status] of [
		[null, 500], [new Error("Offline"), 200],
		[{}, 200], [[post("Wrong month", "01")], 200],
		[[{ ...post("Invalid", "19"), created: "invalid" }], 200],
	]) {
		const ui = await preview(value, status, value?.[0]?.text === "Wrong month"
			? "2026-12-01T00:00:00Z" : undefined);
		assert.equal(ui.section.hidden, true);
		assert.equal(ui.errors.length, 1);
	}
});

test("year rollover selects January without fetching previous months", async () => {
	const ui = await preview([], 200, "2027-01-01T00:00:00Z");
	assert.equal(ui.calls[0].url.href, "https://cdn.example.com/uploads/2027/01/posts.json");
});

test("homepage preview, Memos links, and legacy redirects are wired consistently", () => {
	const home = readFileSync("content/index.njk", "utf8");
	assert.match(home, /data-notes-preview[^>]*data-feed-url="{{ media.feedUrl }}"[^>]*data-pagefind-ignore hidden/);
	assert.match(home, /href="\/memos\/">All memos/);
	assert.match(home, /type="module" src="\/js\/notes-preview.js"/);
	assert.doesNotMatch(home, /monthlyAssets|monthly-feed|monthly\.js/);
	assert.ok(home.indexOf('class="home-notes"') > home.indexOf('class="home-writing"'));
	assert.ok(home.indexOf('class="home-notes"') > home.indexOf('class="home-index"'));
	for (const route of ["lowdown", "notes"]) {
		const page = readFileSync(`content/${route}.njk`, "utf8");
		assert.match(page, /layout: layouts\/memos-redirect.njk/);
		assert.ok(page.includes(`permalink: /${route}/`));
		assert.match(page, /eleventyExcludeFromCollections: true/);
	}
	const redirect = readFileSync("_includes/layouts/memos-redirect.njk", "utf8");
	assert.match(redirect, /http-equiv="refresh" content="0; url=\/memos\/"/);
	assert.match(redirect, /noindex, follow/);
	assert.match(redirect, /href="{{ metadata.url }}\/memos\/"/);
	assert.match(redirect, /href="\/memos\/"/);
	assert.match(redirect, /window.location.search \+ window.location.hash/);
	let destination;
	vm.runInNewContext(redirect.match(/<script>(.*?)<\/script>/)[1], {
		window: { location: {
			search: "?month=2025-01",
			hash: "#note-existing",
			replace: url => { destination = url; },
		} },
	});
	assert.equal(destination, "/memos/?month=2025-01#note-existing");
	assert.match(readFileSync("_includes/layouts/media.njk", "utf8"), /href="\/memos\/">View Memos/);
});
