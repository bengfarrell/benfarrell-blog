const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { test } = require("node:test");
const vm = require("node:vm");
const nunjucks = require("nunjucks");

const filters = new Map();
require("../eleventy.config.js")(new Proxy({}, {
	get: (_, name) => name === "watchIgnores" ? new Set() : name === "addFilter"
		? (key, filter) => filters.set(key, filter)
		: () => {},
}));
const normalize = filters.get("blueskyPostUrl");
const source = readFileSync("public/js/bluesky-comments.js", "utf8");
const threadType = "app.bsky.feed.defs#threadViewPost";

class Node {
	constructor(tag = "", text = "") {
		this.tag = tag;
		this.textContent = text;
		this.children = [];
		this.attributes = {};
	}
	append(...nodes) { this.children.push(...nodes); }
	replaceChildren(...nodes) { this.children = nodes; }
	setAttribute(name, value) { this.attributes[name] = value; }
	addEventListener(name, callback) { this[name] = callback; }
}

function allNodes(node) {
	return [node, ...node.children.flatMap(allNodes)];
}

function setup(responses, url = "https://bsky.app/profile/example.bsky.social/post/root") {
	const button = new Node("button");
	button.hidden = true;
	const status = new Node("p");
	const list = new Node("div");
	const elements = {
		"[data-comments-load]": button,
		"[data-comments-status]": status,
		"[data-comments-list]": list,
	};
	const calls = [];
	const errors = [];
	const document = {
		querySelectorAll: () => [{
			dataset: { blueskyComments: url },
			querySelector: selector => elements[selector],
		}],
		createElement: tag => new Node(tag),
		createTextNode: text => new Node("", text),
	};
	vm.runInNewContext(source, {
		document, URL, URLSearchParams, AbortSignal,
		console: { error: (...args) => errors.push(args) },
		fetch: async (requestUrl, options) => {
			calls.push({ url: requestUrl, options });
			const response = responses.shift();
			if (response instanceof Error) throw response;
			if (!response) throw new Error("Unexpected request");
			return { ok: true, json: async () => response, ...response };
		},
	});
	return { button, status, list, calls, errors };
}

function reply(id, text = id, createdAt = "2026-11-01T12:00:00Z", replies = []) {
	return {
		$type: threadType,
		post: {
			uri: `at://did:plc:example/app.bsky.feed.post/${id}`,
			author: { did: "did:plc:example", handle: "example.bsky.social", displayName: "Example" },
			record: { text, createdAt },
		},
		replies,
	};
}

test("validates and canonicalizes front matter URLs", () => {
	assert.equal(normalize("https://bsky.app/profile/example.bsky.social/post/abc/?ref=x"), "https://bsky.app/profile/example.bsky.social/post/abc");
	assert.equal(normalize("https://bsky.app/profile/did:plc:example/post/abc"), "https://bsky.app/profile/did:plc:example/post/abc");
	for (const value of [true, {}, "bad", "http://bsky.app/profile/x/post/a", "https://evil.example/profile/x/post/a", "https://user@bsky.app/profile/x/post/a", "https://bsky.app/profile/x"]) {
		assert.throws(() => normalize(value), /blueskyComments must be/);
	}
});

test("templates opt in per article and preserve the fallback", () => {
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("_includes"));
	env.addFilter("absoluteUrl", require("@11ty/eleventy-plugin-rss").absoluteUrl);
	env.addFilter("seoMetadata", require("../eleventy.config.seo.js").seoMetadata);
	for (const [name, filter] of filters) env.addFilter(name, filter);
	const data = { page: { date: new Date() }, tags: [], categories: [], content: "<p>Article</p>" };
	const disabled = env.render("layouts/post.njk", data);
	assert.match(disabled, /Normally on a blog/);
	assert.doesNotMatch(disabled, /data-bluesky-comments|bluesky-comments\.js/);
	const enabled = env.render("layouts/post.njk", { ...data, blueskyComments: "https://bsky.app/profile/example.bsky.social/post/root" });
	assert.match(enabled, /data-pagefind-ignore/);
	assert.match(enabled, /data-comments-load hidden/);
	assert.match(enabled, /bluesky-comments\.js/);
	assert.doesNotMatch(enabled, /Normally on a blog/);
	const base = env.render("layouts/base.njk", { ...data, metadata: {}, blueskyComments: "enabled" });
	assert.match(base, /bluesky-comments\.css/);
});

test("loads only on click, resolves the handle, and renders safe nested replies oldest first", async () => {
	const root = reply("root", "Root should not display", undefined, [
		reply("later", "Later", "2026-11-02T12:00:00Z"),
		reply("earlier", "<script>alert(1)</script>", undefined, [reply("nested")]),
	]);
	const ui = setup([{ did: "did:plc:example" }, { thread: root }]);
	assert.equal(ui.calls.length, 0);
	assert.equal(ui.button.hidden, false);
	await ui.button.click();
	assert.equal(ui.calls[0].url.searchParams.get("actor"), "example.bsky.social");
	assert.equal(ui.calls[1].url.searchParams.get("uri"), "at://did:plc:example/app.bsky.feed.post/root");
	assert.equal(ui.calls[1].url.searchParams.get("depth"), "6");
	assert.equal(ui.calls[1].url.searchParams.get("parentHeight"), "0");
	assert.equal(ui.calls[0].options.credentials, "omit");
	assert.equal(ui.calls[0].options.referrerPolicy, "no-referrer");
	const nodes = allNodes(ui.list);
	assert.deepEqual(nodes.filter(node => node.className === "bluesky-comment-text").map(node => node.textContent),
		["<script>alert(1)</script>", "nested", "Later"]);
	assert.equal(nodes.some(node => node.tag === "script"), false);
	for (const node of nodes.filter(node => node.tag === "a")) {
		assert.equal(node.target, "_blank");
		assert.equal(node.rel, "noopener noreferrer");
	}
	assert.equal(nodes.filter(node => node.tag === "ul").length, 2);
	assert.equal(ui.button.textContent, "Refresh comments");
	assert.equal(ui.list.attributes["aria-busy"], "false");
});

test("DID URLs skip profile lookup and empty threads have an explicit state", async () => {
	const ui = setup([{ thread: reply("root") }], "https://bsky.app/profile/did:plc:example/post/root");
	await ui.button.click();
	assert.equal(ui.calls.length, 1);
	assert.match(ui.status.textContent, /No replies yet/);
});

test("hides moderation-labeled, blocked and deleted replies and their descendants", async () => {
	const labeled = reply("labeled", "Hidden text", undefined, [reply("child", "Hidden child")]);
	labeled.post.labels = [{ val: "spam" }];
	const authorLabeled = reply("author", "Hidden author");
	authorLabeled.post.author.labels = [{ val: "porn" }];
	const ui = setup([{ did: "did:plc:example" }, {
		thread: reply("root", "", undefined, [labeled, authorLabeled,
			{ $type: "app.bsky.feed.defs#blockedPost" },
			{ $type: "app.bsky.feed.defs#notFoundPost" }]),
	}]);
	await ui.button.click();
	const nodes = allNodes(ui.list);
	assert.equal(nodes.filter(node => node.tag === "li").length, 4);
	assert.equal(nodes.some(node => node.textContent.startsWith("Hidden")), false);
});

test("bounds rendering to 200 entries and six levels", async () => {
	const ui = setup([{ did: "did:plc:example" }, {
		thread: reply("root", "", undefined, Array.from({ length: 205 }, (_, i) => reply(`r${i}`))),
	}]);
	await ui.button.click();
	assert.equal(allNodes(ui.list).filter(node => node.tag === "li").length, 200);
	let nested = reply("last");
	for (let i = 0; i < 10; i++) nested = reply(`depth${i}`, "", undefined, [nested]);
	const deep = setup([{ did: "did:plc:example" }, { thread: reply("root", "", undefined, [nested]) }]);
	await deep.button.click();
	assert.equal(allNodes(deep.list).filter(node => node.tag === "li").length, 6);
});

test("errors are visible, controls recover, and retry works", async () => {
	for (const response of [new Error("Offline"), { ok: false, status: 429 },
		{ thread: { $type: "app.bsky.feed.defs#notFoundPost" } },
		{ thread: { $type: threadType, post: {}, replies: {} } }]) {
		const ui = setup([response, { thread: reply("root") }], "https://bsky.app/profile/did:plc:example/post/root");
		await ui.button.click();
		assert.match(ui.status.textContent, /Couldn't load comments/);
		assert.equal(ui.errors.length, 1);
		assert.equal(ui.button.disabled, false);
		assert.equal(ui.list.attributes["aria-busy"], "false");
		await ui.button.click();
		assert.match(ui.status.textContent, /No replies yet/);
	}
});

test("refresh clears stale replies if a conversation becomes unavailable", async () => {
	const ui = setup([
		{ thread: reply("root", "", undefined, [reply("first")]) },
		{ thread: { $type: "app.bsky.feed.defs#notFoundPost" } },
	], "https://bsky.app/profile/did:plc:example/post/root");
	await ui.button.click();
	assert.equal(allNodes(ui.list).filter(node => node.tag === "li").length, 1);
	await ui.button.click();
	assert.equal(ui.list.children.length, 0);
	assert.match(ui.status.textContent, /Couldn't load comments/);
});
