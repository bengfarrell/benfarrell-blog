import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import { validateMonth } from "@bengfarrell/monthly/core";

const source = readFileSync("public/js/notes-feed.js", "utf8").replace(/^import .*;\n/gm, "");

function setup(search = "", hash = "") {
	let Feed;
	const status = { hidden: true };
	const events = new Map();
	const logs = [];
	class MonthlyFeed {
		connectedCallback() {}
		disconnectedCallback() {}
		getAttribute() { return "https://cdn.example.com/uploads/"; }
		querySelectorAll() { return this.articles ?? []; }
	}
	class PostFeed {
		constructor(options) {
			this.options = options;
			this.state = { posts: [], loaded: false, loading: true, errors: [] };
		}
		destroy() { this.destroyed = true; }
	}
	class MemoViewer {
		enhance() {}
		destroy() { this.destroyed = true; }
	}
	const window = {
		location: { href: `https://example.com/memos/${search}${hash}`, hash },
		addEventListener: (name, callback) => events.set(name, callback),
		removeEventListener: name => events.delete(name),
	};
	vm.runInNewContext(source, {
		MonthlyFeed, PostFeed, MemoViewer, validateMonth, Date, URL, window,
		document: { querySelector: () => status },
		console: { error: (...args) => logs.push(args), warn: (...args) => logs.push(args) },
		customElements: { define: (_, component) => { Feed = component; } },
	});
	const feed = new Feed();
	feed.connectedCallback();
	return { feed, status, window, events, logs };
}

test("linked months load independently of the current month, with invalid input reported", () => {
	const older = setup("?month=2025-01");
	assert.equal(older.feed.model.options.now().toISOString(), "2025-01-01T00:00:00.000Z");
	const invalid = setup("?month=2025-13");
	assert.equal(invalid.status.hidden, false);
	assert.match(invalid.status.textContent, /invalid month/);
	assert.equal(invalid.logs.length, 1);
	assert.equal(invalid.feed.model.options.now().toISOString().slice(0, 7), new Date().toISOString().slice(0, 7));
});

test("rendered posts receive stable anchors and linked posts focus only after loading", () => {
	const ui = setup("?month=2025-01", "#note-first");
	const target = {
		focus: options => { target.focused = options; },
		scrollIntoView: options => { target.scrolled = options; },
	};
	ui.feed.articles = [target, {}];
	ui.feed.model.state.posts = [{ id: "first", media: [] }, { id: "second", media: [] }];
	ui.feed.updated();
	assert.equal(target.id, "note-first");
	assert.equal(target.tabIndex, -1);
	assert.equal(target.focused, undefined);
	ui.feed.model.state.loaded = true;
	ui.feed.model.state.loading = false;
	ui.feed.updated();
	assert.equal(target.focused.preventScroll, true);
	assert.equal(target.scrolled.block, "start");
	target.focused = false;
	ui.feed.updated();
	assert.equal(target.focused, false);
	ui.events.get("hashchange")();
	assert.equal(target.focused.preventScroll, true);
	ui.feed.disconnectedCallback();
	assert.equal(ui.feed.model.destroyed, true);
	assert.equal(ui.feed.viewer.destroyed, true);
	assert.equal(ui.events.size, 0);
});

test("missing and failed linked posts are visibly reported after loading", () => {
	for (const errors of [[], [new Error("Offline")]]) {
		const ui = setup("?month=2025-01", "#note-missing");
		ui.feed.model.state = { posts: [], loaded: true, loading: false, errors };
		ui.feed.updated();
		assert.equal(ui.status.hidden, false);
		assert.match(ui.status.textContent, errors.length ? /could not be loaded/ : /no longer available/);
		assert.equal(ui.logs.length, 1);
	}
});
