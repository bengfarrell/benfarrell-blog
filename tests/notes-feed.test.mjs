import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { PostFeed, postUrl } from "@bengfarrell/monthly/core";

test("Memos opts into Monthly's native viewer while preserving the site's route, labels and anchors", () => {
	const page = readFileSync("content/memos.njk", "utf8");
	assert.match(page, /<monthly-feed base-url="{{ media\.feedUrl }}" post-viewer post-prefix="note-" post-label="Memo"><\/monthly-feed>/);
	assert.match(page, /type="module" src="\/media\/monthly\.js"/);
	assert.doesNotMatch(page, /site-notes-feed|<dialog|data-note-status/);
	assert.equal(existsSync("public/js/notes-feed.js"), false);
	assert.equal(existsSync("public/js/memo-viewer.js"), false);
	const viewer = readFileSync(new URL("../components/post-viewer.js", import.meta.resolve("@bengfarrell/monthly/core")), "utf8");
	assert.doesNotMatch(viewer, /post-viewer-permalink|this\.permalink/);
	const styles = readFileSync("client/monthly-site.css", "utf8");
	assert.match(styles, /--monthly-viewer-background: #14171a/);
	assert.doesNotMatch(styles, /site-notes-feed|memo-viewer|grid-template-columns|html\./);
});

test("the installed Monthly release provides canonical memo links and independent historical loading", async () => {
	const post = {
		id: "bb3ff98b-df57-4bcb-81af-88ab6de0e3a8", created: "2025-03-01T00:00:00.000Z",
		text: "Old memo", tags: ["memo"], media: [],
	};
	assert.equal(postUrl(post, "https://benfarrell.com/memos/", "note-").href,
		`https://benfarrell.com/memos/?month=2025-03#note-${post.id}`);
	const requests = [];
	const feed = new PostFeed({
		baseUrl: "https://cdn.example.com/uploads/", now: () => new Date("2026-11-20T00:00:00Z"),
		fetch: async url => {
			requests.push(String(url));
			return Response.json([post]);
		},
	});
	try {
		const state = feed.state;
		assert.deepEqual(await feed.loadPost(post.id, "2025-03"), post);
		assert.deepEqual(requests, ["https://cdn.example.com/uploads/2025/03/posts.json"]);
		assert.equal(feed.state, state);
	} finally {
		feed.destroy();
	}
});
