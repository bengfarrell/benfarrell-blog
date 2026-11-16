import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { MediaAuth } from "../client/media-auth.mjs";
import { validateConnection } from "../client/media-config.cjs";
import { mediaType, validateFile, MAX_FILE_SIZE, formatBytes } from "../client/media-helpers.mjs";
import { MEDIA_TYPES } from "../infrastructure/media/media-types.mjs";

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
	assert.doesNotMatch(readFileSync("client/media-auth.mjs", "utf8"), /sessionStorage|localStorage|document\.cookie/);
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
	assert.deepEqual(validateConnection(" https://api.example.com/ ", " example-bucket "), {
		apiUrl: "https://api.example.com", bucket: "example-bucket",
	});
	for (const url of [
		"", "not a URL", null, "http://localhost:8080", "https://api.example.com/path",
		"https://api.example.com?token=fixture", "https://api.example.com#fragment",
		"https://username:password@api.example.com",
	]) {
		assert.throws(() => validateConnection(url, "example-bucket"), /HTTPS origin/);
	}
	for (const bucket of ["", null, "s3://example-bucket", "example-bucket/media/", "../bucket", "EXAMPLE-BUCKET"]) {
		assert.throws(() => validateConnection("https://api.example.com", bucket), /S3 bucket name/);
	}
});

test("static site connection ignores environment overrides and never emits Lambda credentials", () => {
	const names = ["MEDIA_API_URL", "MEDIA_BUCKET", "MEDIA_USERNAME", "MEDIA_PASSWORD", "MEDIA_BUCKETS"];
	const previous = names.map(name => process.env[name]);
	try {
		process.env.MEDIA_API_URL = "http://untrusted.example.com";
		process.env.MEDIA_BUCKET = "other-bucket";
		process.env.MEDIA_USERNAME = "fixture-owner";
		process.env.MEDIA_PASSWORD = "fixture-only-password-not-real";
		process.env.MEDIA_BUCKETS = '{"other-private-bucket":{"prefix":"media/"}}';
		assert.deepEqual(JSON.parse(configData().configJson), {
			configured: true,
			apiUrl: "https://n3rnxs3qyh.execute-api.us-east-1.amazonaws.com",
			bucket: "wp-uploads-bf",
		});
	} finally {
		names.forEach((name, index) => {
			if (previous[index] === undefined) delete process.env[name];
			else process.env[name] = previous[index];
		});
	}
});

test("private sign-in supports password managers without app credential storage", () => {
	const layout = readFileSync("_includes/layouts/media.njk", "utf8");
	assert.match(layout, /noindex, nofollow/);
	assert.match(layout, /no-referrer/);
	assert.doesNotMatch(layout, /googletagmanager|gtag|shaders/);
	const page = readFileSync("content/media/index.njk", "utf8");
	assert.match(page, /data-pagefind-ignore/);
	assert.match(page, /layouts\/media.njk/);
	assert.match(page, /id="media-login-form"[^>]*method="post"[^>]*autocomplete="on"/);
	assert.match(page, /id="media-username"[^>]*name="username"[^>]*autocomplete="username"/);
	assert.match(page, /id="media-password"[^>]*name="password"[^>]*autocomplete="current-password"/);
	assert.match(page, /id="media-password" type="password"/);
	assert.doesNotMatch(page, /id="media-api-url"|id="media-bucket"/);
	assert.doesNotMatch(page, /media-destination|Supported image, audio, and video formats only/);
	assert.match(page, /id="media-login" class="media-button"/);
	assert.match(page, /id="media-login"[^>]*form="media-login-form"/);
	assert.doesNotMatch(page, /<h1|Upload images, audio, and videos to S3, then copy their public URLs/);
	const toolbar = page.slice(page.indexOf('class="media-toolbar"'), page.indexOf('id="media-status"'));
	assert.match(toolbar, /id="media-login"/);
	assert.match(toolbar, /id="media-logout"/);
	assert.match(toolbar, /id="media-browse-tab"/);
	const client = readFileSync("client/media.mjs", "utf8");
	assert.doesNotMatch(client, /if \(!config\.configured\)|sessionStorage|localStorage|document\.cookie/);
	const template = readFileSync("infrastructure/media/template.yaml", "utf8");
	assert.doesNotMatch(template, /AWS::Cognito|AWS::SecretsManager|DefaultAuthorizer|UPLOAD_SIGNING_SECRET/);
	assert.doesNotMatch(template, /MEDIA_PASSWORD:/);
});

test("browse and upload have separate accessible tabs and preserve their existing controls", () => {
	const page = readFileSync("content/media/index.njk", "utf8");
	assert.match(page, /role="tablist" aria-label="Media manager"/);
	for (const name of ["browse", "upload"]) {
		assert.match(page, new RegExp(`id="media-${name}-tab"[^>]*role="tab"[^>]*aria-controls="media-${name}-panel"`));
		assert.match(page, new RegExp(`id="media-${name}-panel"[^>]*role="tabpanel"[^>]*aria-labelledby="media-${name}-tab"`));
	}
	assert.match(page, /id="media-browse-tab"[^>]*aria-selected="true"/);
	assert.match(page, /id="media-upload-tab"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
	assert.match(page, /id="media-upload-panel"[^>]*hidden/);
	const browsePanel = page.slice(page.indexOf('id="media-browse-panel"'), page.indexOf('id="media-upload-panel"'));
	assert.match(browsePanel, /id="media-library"/);
	assert.match(browsePanel, /id="media-browse-month"/);
	assert.match(browsePanel, /class="media-browse-controls"/);
	assert.match(browsePanel, /id="media-refresh"[^>]*aria-label="Refresh library"[^>]*title="Refresh library"/);
	const uploadPanel = page.slice(page.indexOf('id="media-upload-panel"'));
	assert.match(uploadPanel, /id="media-uploader"/);
	assert.match(uploadPanel, /id="media-uploaded"/);
});
