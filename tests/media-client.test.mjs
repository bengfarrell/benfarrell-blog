import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { MediaAuth, validateConnection, mediaType, validateFile, MAX_FILE_SIZE, formatBytes, MEDIA_TYPES, PostFeed, feedMonths } from "@bengfarrell/monthly/core";

const require = createRequire(import.meta.url);
const configData = require("../_data/media.js");

test("media type inference handles phone filename variants and rejects executable formats", () => {
	assert.equal(mediaType("movie.MOV"), "video/quicktime");
	assert.equal(mediaType("photo.heic"), "image/heic");
	assert.equal(mediaType("movie.m4v"), "video/mp4");
	assert.equal(mediaType("photo.svg"), null);
	for (const size of [1, MAX_FILE_SIZE]) validateFile({ name: "video.mp4", size });
	for (const size of [0, -1, 1.5, MAX_FILE_SIZE + 1]) {
		assert.throws(() => validateFile({ name: "video.mp4", size }));
	}
	assert.throws(() => validateFile({ name: "index.html", size: 123 }));
	assert.equal(formatBytes(1024), "1.0 KiB");
});

test("all shared audio extensions pass browser validation and use canonical MIME types", () => {
	for (const [type, extensions] of MEDIA_TYPES) {
		for (const extension of extensions) {
			const name = `recording.${extension.toUpperCase()}`;
			assert.equal(mediaType(name), type);
			validateFile({ name, size: 123 });
		}
	}
	for (const name of ["file.mid", "file.pdf", "file.zip", "mp3", ".mp3", "file.__proto__"]) {
		assert.throws(() => validateFile({ name, size: 123 }), /Unsupported file extension/);
	}
});

test("login encodes UTF-8 credentials as Basic authorization held only in memory", () => {
	const auth = new MediaAuth();
	assert.throws(() => auth.authorization, /Sign in/);
	auth.login("propriétaire", "fixture:pässword:音楽");
	assert.equal(Buffer.from(auth.authorization.slice(6), "base64").toString("utf8"), "propriétaire:fixture:pässword:音楽");
	assert.match(auth.authorization, /^Basic /);
	assert.throws(() => new MediaAuth().authorization, /Sign in/);
	auth.clear();
	assert.throws(() => auth.authorization, /Sign in/);
	const authSource = new URL("./auth.js", import.meta.resolve("@bengfarrell/monthly/core"));
	assert.doesNotMatch(readFileSync(authSource, "utf8"), /sessionStorage|localStorage|document\.cookie/);
});

test("invalid sign-in fields are rejected without retaining credentials", () => {
	const auth = new MediaAuth();
	for (const [username, password] of [
		["", "fixture"], ["owner", ""], ["owner:other", "fixture"],
		["owner", "line\nbreak"], [null, "fixture"], ["owner", null],
		["x".repeat(129), "fixture"], ["owner", "x".repeat(1025)],
	]) {
		assert.throws(() => auth.login(username, password), /Enter a username/);
		assert.throws(() => auth.authorization, /Sign in/);
	}
});

test("site connection settings require an HTTPS origin and plain bucket name", () => {
	assert.deepEqual(validateConnection(" https://api.example.com/ ", "example-bucket"), {
		apiUrl: "https://api.example.com", bucket: "example-bucket",
	});
	for (const url of [
		"", "not a URL", null, "http://localhost:8080", "https://api.example.com/path",
		"https://api.example.com?token=fixture", "https://api.example.com#fragment",
		"https://username:password@api.example.com",
	]) {
		assert.throws(() => validateConnection(url, "example-bucket"), /HTTPS/);
	}
	for (const bucket of ["", null, "s3://example-bucket", "example-bucket/media/", "../bucket", "EXAMPLE-BUCKET"]) {
		assert.throws(() => validateConnection("https://api.example.com", bucket), /S3 bucket name/);
	}
});

test("static site connection ignores environment overrides and never emits Lambda credentials", async () => {
	const names = ["MEDIA_API_URL", "MEDIA_BUCKET", "MEDIA_USERNAME", "MEDIA_PASSWORD", "MEDIA_BUCKETS"];
	const previous = names.map(name => process.env[name]);
	try {
		process.env.MEDIA_API_URL = "http://untrusted.example.com";
		process.env.MEDIA_BUCKET = "other-bucket";
		process.env.MEDIA_USERNAME = "fixture-owner";
		process.env.MEDIA_PASSWORD = "fixture-only-password-not-real";
		process.env.MEDIA_BUCKETS = '{"other-private-bucket":{"prefix":"media/"}}';
		const data = await configData();
		assert.deepEqual(JSON.parse(data.configJson), {
			configured: true,
			apiUrl: "https://n3rnxs3qyh.execute-api.us-east-1.amazonaws.com",
			bucket: "wp-uploads-bf",
		});
		assert.equal(data.apiUrl, "https://n3rnxs3qyh.execute-api.us-east-1.amazonaws.com");
		assert.equal(data.bucket, "wp-uploads-bf");
		assert.equal(data.feedUrl, "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/");
		assert.doesNotMatch(JSON.stringify(data), /fixture-owner|fixture-only-password|other-private-bucket/);
	} finally {
		names.forEach((name, index) => {
			if (previous[index] === undefined) delete process.env[name];
			else process.env[name] = previous[index];
		});
	}
});

test("the private page embeds Monthly without analytics or the legacy client", () => {
	const layout = readFileSync("_includes/layouts/media.njk", "utf8");
	assert.match(layout, /noindex, nofollow/);
	assert.match(layout, /no-referrer/);
	assert.doesNotMatch(layout, /googletagmanager|gtag|shaders/);
	const page = readFileSync("content/media/index.njk", "utf8");
	assert.match(page, /data-pagefind-ignore/);
	assert.match(page, /layouts\/media.njk/);
	assert.match(page, /<monthly-media api-url="{{ media\.apiUrl }}" bucket="{{ media\.bucket }}">/);
	assert.match(page, /type="module" src="\/media\/monthly\.js"/);
	assert.match(layout, /href="\/media\/monthly\.css"/);
	assert.match(layout, /href="\/media\/site\.css"/);
	assert.doesNotMatch(page + layout, /\/media\/app\.(js|css)|\/css\/index\.css/);
	assert.match(page, /eleventyExcludeFromCollections: true/);
});

test("Memos is a public Monthly feed without a site navigation link", () => {
	const page = readFileSync("content/memos.njk", "utf8");
	const layout = readFileSync("_includes/layouts/base.njk", "utf8");
	assert.match(page, /permalink: \/memos\//);
	assert.match(page, /monthlyAssets: true/);
	assert.match(page, /<header class="entry-header entry-header-single"><h1 class="entry-title">Memos<\/h1>/);
	assert.match(page, /<monthly-feed base-url="{{ media\.feedUrl }}" post-viewer post-prefix="note-" post-label="Memo">/);
	assert.doesNotMatch(page, /monthly-media|api-url=|bucket=|Refresh|noindex/);
	assert.doesNotMatch(layout, /href="\/memos\/"/);
	assert.match(layout, /{% if monthlyAssets %}[\s\S]*?\/media\/monthly\.css[\s\S]*?{% endif %}/);
	assert.match(layout, /{% if monthlyAssets %} monthly-feed-page{% endif %}/);
	const styles = readFileSync("client/monthly-site.css", "utf8");
	assert.match(readFileSync(new URL(import.meta.resolve("@bengfarrell/monthly/styles.css")), "utf8"),
		/monthly-feed\s*\{[^}]*container-type:\s*inline-size(?:;|})/);
	assert.doesNotMatch(styles, /notes-linked|\.monthly-post:target/);
	assert.doesNotMatch(styles, /\.monthly-notes > header\s*\{[^}]*background: #000/);
});

test("the site's public feed reads exactly three calendar months without API credentials", async () => {
	const { feedUrl } = await configData();
	const now = new Date("2026-01-15T12:00:00Z");
	const months = feedMonths(now);
	const requests = [];
	const post = {
		id: "6e809217-28d0-41bd-b722-4fc7b5524860", text: "A public update", tags: ["demo"],
		media: [], created: now.toISOString(),
	};
	const feed = new PostFeed({
		baseUrl: feedUrl, now: () => now,
		fetch: async (url, options) => {
			requests.push({ url, options });
			return new Response(JSON.stringify(url.includes("/2026/01/") ? [post] : []), { status: 200 });
		},
	});
	try {
		await feed.load();
		assert.deepEqual(months, ["2026-01", "2025-12", "2025-11"]);
		assert.deepEqual(requests.map(({ url }) => url), months.map(month => `${feedUrl}${month.replace("-", "/")}/posts.json`));
		assert.ok(requests.every(({ options }) => options.credentials === "omit" && !options.headers));
		assert.deepEqual(feed.state.posts, [post]);
		assert.deepEqual(feed.state.errors, []);
	} finally {
		feed.destroy();
	}
});
