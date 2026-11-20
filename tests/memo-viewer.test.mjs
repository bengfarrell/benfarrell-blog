import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import { firstThumbnail } from "@bengfarrell/monthly/core";

const source = readFileSync("public/js/memo-viewer.js", "utf8")
	.replace(/^import .*;\n/gm, "").replace("export class", "class");

class Element extends EventTarget {
	constructor(tag) {
		super();
		this.tagName = tag.toUpperCase();
		this.children = [];
		this.attributes = {};
		this.classes = new Set();
		this.classList = {
			add: name => this.classes.add(name),
			remove: name => this.classes.delete(name),
		};
		this.isConnected = true;
		this.paused = true;
		this.currentTime = 0;
		this.duration = 120;
		this.readyState = 1;
	}
	append(...children) {
		this.children.push(...children);
		for (const child of children) child.parent = this;
	}
	replaceChildren(...children) { this.children = []; this.append(...children); }
	after(child) {
		this.parent.children.splice(this.parent.children.indexOf(this) + 1, 0, child);
		child.parent = this.parent;
	}
	remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); }
	setAttribute(name, value) { this.attributes[name] = value; }
	getAttribute(name) { return this.attributes[name]; }
	removeAttribute(name) { delete this.attributes[name]; }
	focus(options) { this.focused = options; }
	pause() { this.paused = true; }
	load() { this.loaded = true; }
	showModal() { this.open = true; }
	close() { this.open = false; this.dispatchEvent(new Event("close")); }
	getBoundingClientRect() { return { left: 10, right: 100, top: 10, bottom: 100 }; }
}

function setup(tags = ["img", "video", "audio"]) {
	const dialog = new Element("dialog");
	const parts = Object.fromEntries(["content", "title", "original", "error"].map(name =>
		[`[data-viewer-${name}]`, new Element("div")]));
	dialog.querySelector = selector => parts[selector];
	const root = new Element("html");
	const logs = [];
	const context = vm.createContext({
		AbortController, firstThumbnail,
		console: { error: (...args) => logs.push(args) },
		document: {
			documentElement: root,
			createElement: tag => new Element(tag),
			createTextNode: text => ({ textContent: text }),
		},
	});
	vm.runInContext(`${source}\nglobalThis.Viewer = MemoViewer;`, context);
	const viewer = new context.Viewer(dialog);
	const assets = tags.map(tag => {
		const asset = new Element(tag);
		asset.src = `https://cdn.example.com/asset.${tag}`;
		asset.alt = "Fixture image";
		asset.setAttribute(tag === "img" ? "alt" : "aria-label", `Fixture ${tag}`);
		return asset;
	});
	const parent = new Element("div");
	parent.append(...assets);
	const feed = { querySelectorAll: () => assets };
	const media = assets.map(asset => ({ url: asset.src }));
	viewer.enhance(feed, media);
	return { viewer, dialog, assets, parent, feed, media, parts, root, logs };
}

test("every asset gets one keyboard-accessible expand button, without modifying native controls", () => {
	const ui = setup();
	ui.viewer.enhance(ui.feed, ui.media);
	assert.equal(ui.parent.children.length, 6);
	for (const asset of ui.assets) {
		const button = ui.viewer.previews.get(asset);
		assert.equal(button.tagName, "BUTTON");
		assert.equal(button.type, "button");
		assert.equal(button.getAttribute("aria-haspopup"), "dialog");
		assert.match(button.getAttribute("aria-label"), /^Expand (image|video|audio): Fixture/);
		assert.equal(asset.children.length, 0);
	}
	assert.ok(ui.assets[0].classes.has("memo-expandable-image"));
});

test("clicking an image opens the viewer, with a safe original link and restored focus on close", () => {
	const ui = setup(["img"]);
	ui.assets[0].dispatchEvent(new Event("click"));
	assert.equal(ui.dialog.open, true);
	assert.equal(ui.viewer.asset.tagName, "IMG");
	assert.equal(ui.viewer.asset.src, ui.assets[0].src);
	assert.equal(ui.viewer.asset.referrerPolicy, "no-referrer");
	assert.equal(ui.parts["[data-viewer-title]"].textContent, "Fixture img");
	assert.equal(ui.parts["[data-viewer-original]"].href, ui.assets[0].src);
	assert.ok(ui.root.classes.has("memo-viewer-open"));
	const button = ui.viewer.opener;
	ui.dialog.close();
	assert.equal(ui.parts["[data-viewer-content]"].children.length, 0);
	assert.equal(button.focused.preventScroll, true);
	assert.equal(ui.root.classes.has("memo-viewer-open"), false);
});

test("expanded audio/video do not autoplay and transfer playback positions in both directions", () => {
	for (const tag of ["video", "audio"]) {
		const ui = setup([tag]);
		const preview = ui.assets[0];
		preview.paused = false;
		preview.currentTime = 15;
		const button = ui.viewer.previews.get(preview);
		button.dispatchEvent(new Event("click"));
		const asset = ui.viewer.asset;
		assert.equal(preview.paused, true);
		assert.equal(asset.controls, true);
		assert.equal(asset.autoplay, undefined);
		assert.equal(asset.paused, true);
		asset.dispatchEvent(new Event("loadedmetadata"));
		assert.equal(asset.currentTime, 15);
		asset.currentTime = 22;
		ui.dialog.close();
		assert.equal(preview.currentTime, 22);
		assert.equal(preview.paused, true);
		assert.equal(asset.paused, true);
		assert.equal(asset.loaded, true);
	}
});

test("expanded images and original links use full media URLs, even when inline sources are thumbnails", () => {
	const ui = setup(["img"]);
	ui.assets[0].src = "https://cdn.example.com/thumbnail.jpg";
	ui.assets[0].dispatchEvent(new Event("click"));
	assert.equal(ui.viewer.asset.src, ui.media[0].url);
	assert.equal(ui.parts["[data-viewer-original]"].href, ui.media[0].url);
	assert.notEqual(ui.viewer.asset.src, ui.assets[0].src);
});

test("expanded videos keep thumbnail posters and legacy posters without autoplay", () => {
	for (const extra of [
		{ thumbnails: { "960x540": { url: "https://cdn.example.com/thumb.jpg" } } },
		{ poster: { url: "https://cdn.example.com/poster.jpg" } },
	]) {
		const ui = setup(["video"]);
		Object.assign(ui.media[0], extra);
		ui.viewer.previews.get(ui.assets[0]).dispatchEvent(new Event("click"));
		assert.equal(ui.viewer.asset.poster, firstThumbnail(ui.media[0]).url);
		assert.equal(ui.viewer.asset.src, ui.media[0].url);
		assert.equal(ui.viewer.asset.autoplay, undefined);
	}
});

test("rerendering updates original sources without duplicating expand buttons", () => {
	const ui = setup(["img"]);
	ui.media[0] = { url: "https://cdn.example.com/replacement.jpg" };
	ui.viewer.enhance(ui.feed, ui.media);
	ui.assets[0].dispatchEvent(new Event("click"));
	assert.equal(ui.parent.children.length, 2);
	assert.equal(ui.viewer.asset.src, ui.media[0].url);
});

test("mismatched rendered media is explicitly rejected", () => {
	const ui = setup(["img"]);
	assert.throws(() => ui.viewer.enhance(ui.feed, []), /does not match/);
});
test("media errors are visible and logged; stale errors do not affect a closed viewer", () => {
	const ui = setup(["img"]);
	ui.assets[0].dispatchEvent(new Event("click"));
	const asset = ui.viewer.asset;
	asset.dispatchEvent(new Event("error"));
	assert.equal(ui.parts["[data-viewer-error]"].hidden, false);
	assert.match(ui.parts["[data-viewer-error]"].textContent, /opening the original/);
	assert.equal(ui.logs.length, 1);
	ui.dialog.close();
	asset.dispatchEvent(new Event("error"));
	assert.equal(ui.logs.length, 1);
});

test("a queued close event cannot clear an immediately reopened viewer", () => {
	const ui = setup(["img", "video"]);
	ui.assets[0].dispatchEvent(new Event("click"));
	ui.dialog.open = false;
	ui.viewer.previews.get(ui.assets[1]).dispatchEvent(new Event("click"));
	ui.dialog.dispatchEvent(new Event("close"));
	assert.equal(ui.dialog.open, true);
	assert.equal(ui.viewer.asset.tagName, "VIDEO");
	assert.equal(ui.parts["[data-viewer-content]"].children.length, 1);
});

test("backdrop click closes the viewer and destroying it removes enhancements and listeners", () => {
	const ui = setup(["img"]);
	const image = ui.assets[0];
	image.dispatchEvent(new Event("click"));
	const event = new Event("click");
	Object.assign(event, { clientX: 0, clientY: 0 });
	ui.dialog.dispatchEvent(event);
	assert.equal(ui.dialog.open, false);
	image.dispatchEvent(new Event("click"));
	ui.viewer.destroy();
	assert.equal(ui.dialog.open, false);
	assert.equal(ui.viewer.previews.size, 0);
	assert.equal(ui.parent.children.length, 1);
	assert.equal(image.classes.has("memo-expandable-image"), false);
	image.dispatchEvent(new Event("click"));
	assert.equal(ui.dialog.open, false);
});
