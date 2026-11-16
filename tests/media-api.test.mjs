import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { createHandler, handler as runtimeHandler, parseBuckets, MAX_FILE_SIZE, PART_SIZE, mediaUrl, monthPrefix } from "../infrastructure/media/handler.mjs";
import { MEDIA_TYPES, mediaType } from "../infrastructure/media/media-types.mjs";

const require = createRequire(new URL("../infrastructure/media/package.json", import.meta.url));
const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const primary = {
	bucket: "example-bucket", prefix: "media/",
	publicBaseUrl: "https://media.example.com", region: "us-west-2",
};
const secondary = {
	bucket: "second-example-bucket", prefix: "uploads/",
	publicBaseUrl: "https://second.example.com", region: "us-east-1",
};
const config = {
	buckets: { [primary.bucket]: primary, [secondary.bucket]: secondary },
	username: "owner", password: "test-only-password-not-real",
};
const date = new Date("2026-11-15T02:00:00Z");

function event(route, body, username = config.username, password = config.password) {
	return {
		routeKey: route,
		headers: { authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}` },
		queryStringParameters: { bucket: primary.bucket },
		...(body && { body: JSON.stringify({ bucket: primary.bucket, ...body }) }),
	};
}

function setup(options = {}) {
	const commands = [];
	const signatures = [];
	const errors = [];
	const regions = [];
	const client = { send: async command => { commands.push(command); return options.result || {}; } };
	const handle = createHandler({
		config, now: () => date, uuid: () => "unique-id",
		clientForRegion: region => { regions.push(region); return client; },
		sign: async (client, command, signing) => {
			signatures.push({ command, signing });
			return "https://bucket.example.com/signed-upload";
		},
		logger: { error: (...args) => errors.push(args) },
		...options,
	});
	return { handle, commands, signatures, errors, regions };
}

async function prepare(handle, overrides = {}) {
	const response = await handle(event("POST /uploads", {
		name: "a video.mp4", size: 1024, type: "video/mp4", ...overrides,
	}));
	assert.equal(response.statusCode, 201);
	return JSON.parse(response.body);
}

test("requires the configured Basic credentials on every route and ignores old JWT claims", async () => {
	const { handle, commands, signatures, errors } = setup();
	for (const route of ["GET /media", "POST /uploads", "POST /sign"]) {
		for (const authorization of [
			undefined, "", "Bearer fixture-token", "Basic !!!", "Basic YTpi", "Basic YTpi=",
			`Basic ${Buffer.from(`wrong:${config.password}`).toString("base64")}`,
			`Basic ${Buffer.from(`${config.username}:wrong`).toString("base64")}`,
			`Basic ${"a".repeat(8192)}`,
		]) {
			const response = await handle({
				routeKey: route, body: "{}", headers: { authorization },
				requestContext: { authorizer: { jwt: { claims: { sub: "owner", token_use: "access" } } } },
			});
			assert.equal(response.statusCode, 401);
			assert.deepEqual(JSON.parse(response.body), { error: "Invalid username or password." });
		}
	}
	assert.equal(commands.length, 0);
	assert.equal(signatures.length, 0);
	assert.equal(errors.length, 0);
});

test("accepts case-insensitive Basic scheme/header names and UTF-8 credentials with colons in passwords", async () => {
	const unicode = { ...config, username: "propriétaire", password: "fixture:pässword:音楽" };
	const { handle } = setup({ config: unicode });
	const request = event("GET /media", undefined, unicode.username, unicode.password);
	request.headers = { Authorization: request.headers.authorization.replace("Basic ", "basic ") };
	assert.equal((await handle(request)).statusCode, 200);
});

test("invalid credential configuration fails closed without exposing its values", () => {
	for (const credentials of [
		{ username: undefined }, { username: "" }, { username: "owner:other" },
		{ password: undefined }, { password: "" }, { password: "short" },
		{ password: "x".repeat(1025) }, { password: "line\n".repeat(4) },
	]) {
		assert.throws(() => setup({ config: { ...config, ...credentials } }), /Set MEDIA_USERNAME/);
	}
});

test("an unconfigured deployed handler returns an explicit error and does not process requests", async () => {
	const names = ["MEDIA_BUCKETS", "MEDIA_USERNAME", "MEDIA_PASSWORD"];
	const previous = names.map(name => process.env[name]);
	const originalError = console.error;
	const messages = [];
	try {
		process.env.MEDIA_BUCKETS = JSON.stringify(config.buckets);
		delete process.env.MEDIA_USERNAME;
		delete process.env.MEDIA_PASSWORD;
		console.error = (...args) => messages.push(args.join(" "));
		const response = await runtimeHandler(event("GET /media"));
		assert.equal(response.statusCode, 503);
		assert.match(JSON.parse(response.body).error, /not configured/);
		assert.equal(messages.length, 1);
		assert.match(messages[0], /Set MEDIA_USERNAME/);
		assert.doesNotMatch(messages[0], /test-only-password/);
	} finally {
		console.error = originalError;
		names.forEach((name, index) => {
			if (previous[index] === undefined) delete process.env[name];
			else process.env[name] = previous[index];
		});
	}
});

test("uses server UTC year/month, sanitizes filenames, and supports an explicit month", async () => {
	const { handle } = setup();
	const current = await prepare(handle);
	assert.equal(current.key, "media/2026/11/unique-id-a-video.mp4");
	assert.equal(current.url, "https://media.example.com/media/2026/11/unique-id-a-video.mp4");
	const old = await prepare(handle, { month: "2024-02", name: "../../old clip.mp4" });
	assert.equal(old.key, "media/2024/02/unique-id-old-clip.mp4");
	assert.equal(old.partSize, PART_SIZE);
});

test("enforces type/extension, file size boundaries, and valid calendar months", async () => {
	const { handle } = setup();
	const input = { name: "file.mp4", type: "video/mp4", size: 1 };
	for (const overrides of [
		{ size: 0 }, { size: -1 }, { size: 1.5 }, { size: MAX_FILE_SIZE + 1 },
		{ type: "text/html" }, { name: "file.html" }, { name: "" },
		{ name: "x".repeat(256) }, { type: "image/svg+xml", name: "file.svg" },
		{ month: "2026-00" }, { month: "2026-13" }, { month: "../../" },
	]) {
		assert.equal((await handle(event("POST /uploads", { ...input, ...overrides }))).statusCode, 400);
	}
	await prepare(handle, { size: 1 });
	await prepare(handle, { size: MAX_FILE_SIZE });
});

test("malformed/oversized/base64 JSON fails explicitly", async () => {
	const { handle } = setup();
	for (const body of ["{", "null", "[]", '"text"', " ".repeat(8193)]) {
		assert.equal((await handle({ ...event("POST /uploads"), body })).statusCode, 400);
	}
	assert.equal((await handle({ ...event("POST /uploads", {}), isBase64Encoded: true })).statusCode, 400);
});

test("every shared media extension is accepted and signed with its canonical content type", async () => {
	const { handle, signatures } = setup();
	for (const [type, extensions] of MEDIA_TYPES) {
		for (const extension of extensions) {
			const name = `file.${extension.toUpperCase()}`;
			assert.equal(mediaType(name), type);
			const grant = await prepare(handle, { name, type });
			const response = await handle(event("POST /sign", { ...grant, method: "PUT" }));
			assert.equal(response.statusCode, 200);
			assert.equal(JSON.parse(response.body).headers["Content-Type"], type);
			assert.equal(signatures.at(-1).command.input.ContentType, type);
		}
	}
	for (const [name, type] of [
		["file.mp3", "video/mp4"], ["file.wav", "audio/mpeg"],
		["file.mid", "audio/midi"], ["file.pdf", "application/pdf"],
		["file.zip", "application/zip"], ["mp3", "audio/mpeg"],
	]) {
		assert.equal((await handle(event("POST /uploads", { name, type, size: 123 }))).statusCode, 400);
	}
});

test("browse is prefix-scoped, paginated, skips folder placeholders, and encodes URLs", async () => {
	const { handle, commands } = setup({ result: {
		Contents: [
			{ Key: "media/2026/11/", Size: 0 },
			{ Key: "media/2026/11/old #clip.mp4", Size: 123, LastModified: date },
		],
		IsTruncated: true, NextContinuationToken: "next-page",
	} });
	const response = await handle({
		...event("GET /media"), queryStringParameters: { bucket: primary.bucket, month: "2026-11", cursor: "previous-page" },
	});
	assert.equal(response.statusCode, 200);
	assert.deepEqual(commands[0].input, {
		Bucket: primary.bucket, Prefix: "media/2026/11/", MaxKeys: 50, ContinuationToken: "previous-page",
	});
	assert.deepEqual(JSON.parse(response.body), {
		bucket: primary.bucket,
		items: [{ key: "media/2026/11/old #clip.mp4", size: 123, modified: date.toISOString(),
			url: "https://media.example.com/media/2026/11/old%20%23clip.mp4" }],
		cursor: "next-page",
	});
	await handle(event("GET /media"));
	assert.equal(commands[1].input.Prefix, "media/");
	assert.equal(response.headers["cache-control"], "no-store");
});

test("upload grants prevent key substitution, tampering, unauthorized access, and expiration", async () => {
	const { handle, signatures } = setup();
	const grant = await prepare(handle);
	const input = { key: grant.key, ticket: grant.ticket, method: "PUT" };
	assert.equal((await handle(event("POST /sign", { ...input, key: "outside/file.mp4" }))).statusCode, 403);
	assert.equal((await handle(event("POST /sign", input, "different-user"))).statusCode, 401);
	assert.equal((await handle(event("POST /sign", { ...input, ticket: `${grant.ticket}x` }))).statusCode, 403);
	const { handle: expired } = setup({ now: () => new Date(date.getTime() + 86400000) });
	assert.equal((await expired(event("POST /sign", input))).statusCode, 403);
	assert.equal(signatures.length, 0);
});

test("rotating the Lambda password invalidates old credentials and upload grants", async () => {
	const { handle } = setup();
	const grant = await prepare(handle);
	const password = "rotated-fixture-password-not-real";
	const rotated = setup({ config: { ...config, password } });
	const input = { key: grant.key, ticket: grant.ticket, method: "PUT" };
	assert.equal((await rotated.handle(event("POST /sign", input))).statusCode, 401);
	assert.equal((await rotated.handle(event("POST /sign", input, config.username, password))).statusCode, 403);
	assert.equal(rotated.signatures.length, 0);
});

test("single PUT signs exact size and type; 100 MiB is the multipart boundary", async () => {
	const { handle, signatures } = setup();
	const grant = await prepare(handle, { size: 100 * 1024 ** 2 });
	const response = await handle(event("POST /sign", { ...grant, method: "PUT" }));
	assert.equal(response.statusCode, 200);
	assert.equal(signatures[0].command.constructor.name, "PutObjectCommand");
	assert.equal(signatures[0].command.input.ContentLength, 100 * 1024 ** 2);
	assert.equal(signatures[0].command.input.ContentType, "video/mp4");
	assert.equal(signatures[0].signing.expiresIn, 300);
	assert.deepEqual(JSON.parse(response.body).headers, { "Content-Type": "video/mp4" });
	const large = await prepare(handle, { size: 100 * 1024 ** 2 + 1 });
	assert.equal((await handle(event("POST /sign", { ...large, method: "PUT" }))).statusCode, 400);
});

test("multipart signs all operations, exact final part sizes, and never prefixes a key twice", async () => {
	const { handle, signatures } = setup();
	const size = PART_SIZE * 10 + 17;
	const grant = await prepare(handle, { size });
	const calls = [
		{ method: "POST" },
		{ method: "PUT", uploadId: "upload-id", partNumber: 1 },
		{ method: "PUT", uploadId: "upload-id", partNumber: 11 },
		{ method: "GET", uploadId: "upload-id" },
		{ method: "POST", uploadId: "upload-id" },
		{ method: "DELETE", uploadId: "upload-id" },
	];
	for (const operation of calls) {
		const response = await handle(event("POST /sign", { ...grant, ...operation }));
		assert.equal(response.statusCode, 200);
		assert.equal(JSON.parse(response.body).key, grant.key);
	}
	assert.deepEqual(signatures.map(item => item.command.constructor.name), [
		"CreateMultipartUploadCommand", "UploadPartCommand", "UploadPartCommand",
		"ListPartsCommand", "CompleteMultipartUploadCommand", "AbortMultipartUploadCommand",
	]);
	assert.equal(signatures[1].command.input.ContentLength, PART_SIZE);
	assert.equal(signatures[2].command.input.ContentLength, 17);
	for (const signature of signatures) assert.equal(signature.command.input.Key, grant.key);
	for (const operation of [
		{ method: "PUT", uploadId: "upload-id", partNumber: 0 },
		{ method: "PUT", uploadId: "upload-id", partNumber: 12 },
		{ method: "PUT", uploadId: "upload-id", partNumber: "1" },
		{ method: "GET", uploadId: "upload-id", partNumber: 1 },
		{ method: "DELETE" }, { method: "PUT", partNumber: 1 },
		{ method: "PUT", uploadId: "" }, { method: "toString", uploadId: "upload-id" },
	]) assert.equal((await handle(event("POST /sign", { ...grant, ...operation }))).statusCode, 400);
});

test("actual AWS signatures bind upload Content-Length without binding unintended multipart headers", async () => {
	const client = new S3Client({
		region: "us-west-2", credentials: { accessKeyId: "fixture", secretAccessKey: "fixture" },
		requestChecksumCalculation: "WHEN_REQUIRED",
	});
	const { handle } = setup({ clientForRegion: () => client, sign: getSignedUrl });
	const grant = await prepare(handle);
	for (const operation of [
		{ method: "PUT" },
		{ method: "POST" },
		{ method: "PUT", uploadId: "upload-id", partNumber: 1 },
		{ method: "POST", uploadId: "upload-id" },
	]) {
		const response = await handle(event("POST /sign", { ...grant, ...operation }));
		assert.equal(response.statusCode, 200);
		const data = JSON.parse(response.body);
		const signedHeaders = new URL(data.url).searchParams.get("X-Amz-SignedHeaders").split(";");
		if (operation.method === "PUT") assert.ok(signedHeaders.includes("content-length"));
		assert.equal(signedHeaders.includes("content-type"), !operation.uploadId);
		assert.equal(data.headers?.["content-length"], undefined);
	}
});

test("unexpected S3 errors are logged and returned as errors, not empty libraries", async () => {
	const { handle, errors } = setup({ clientForRegion: () => ({ send: async () => { throw new Error("S3 unavailable"); } }) });
	const response = await handle(event("GET /media"));
	assert.equal(response.statusCode, 500);
	assert.match(JSON.parse(response.body).error, /Media service failed/);
	assert.equal(errors.length, 1);
	assert.equal((await handle(event("GET /unknown"))).statusCode, 404);
});

test("prefix and URL helpers reject traversal and preserve special object names", () => {
	assert.throws(() => monthPrefix("../2026-11", "media/"));
	assert.equal(mediaUrl(primary.publicBaseUrl, "media/a+b #é.jpg"), "https://media.example.com/media/a%2Bb%20%23%C3%A9.jpg");
	assert.throws(() => setup({ config: { ...config, buckets: { [primary.bucket]: { ...primary, prefix: "../" } } } }));
});

test("only explicitly allowed buckets can be browsed, prepared, or signed", async () => {
	const { handle, commands, signatures, regions } = setup();
	for (const bucket of [undefined, "", 42, "unknown-bucket", "__proto__", "constructor"]) {
		const browse = { ...event("GET /media"), queryStringParameters: { bucket } };
		const upload = event("POST /uploads", { bucket, name: "file.mp4", size: 123, type: "video/mp4" });
		const sign = event("POST /sign", { bucket, key: "media/file.mp4", ticket: "irrelevant", method: "PUT" });
		const expected = typeof bucket !== "string" || !bucket ? 400 : 403;
		for (const request of [browse, upload, sign]) assert.equal((await handle(request)).statusCode, expected);
	}
	assert.equal(commands.length, 0);
	assert.equal(signatures.length, 0);
	assert.equal(regions.length, 0);
});

test("each allowed bucket uses its own prefix, public URL, and regional S3 client", async () => {
	const { handle, commands, signatures, regions } = setup();
	const prepared = await prepare(handle, {
		bucket: secondary.bucket, prefix: "attacker/", publicBaseUrl: "https://attacker.example.com", region: "eu-west-1",
	});
	assert.equal(prepared.bucket, secondary.bucket);
	assert.equal(prepared.key, "uploads/2026/11/unique-id-a-video.mp4");
	assert.equal(prepared.url, `${secondary.publicBaseUrl}/${prepared.key}`);
	await handle({
		...event("GET /media"),
		queryStringParameters: { bucket: secondary.bucket, month: "2026-11" },
	});
	assert.equal(commands[0].input.Bucket, secondary.bucket);
	assert.equal(commands[0].input.Prefix, "uploads/2026/11/");
	assert.equal(JSON.parse((await handle(event("POST /sign", { ...prepared, method: "PUT" }))).body).bucket, secondary.bucket);
	assert.equal(signatures[0].command.input.Bucket, secondary.bucket);
	assert.deepEqual(regions, ["us-east-1", "us-east-1"]);
});

test("grants cannot cross buckets even if the prefixes match", async () => {
	const samePrefixConfig = { ...config, buckets: {
		[primary.bucket]: primary, [secondary.bucket]: { ...secondary, prefix: primary.prefix },
	} };
	const { handle, signatures } = setup({ config: samePrefixConfig });
	const prepared = await prepare(handle);
	const response = await handle(event("POST /sign", { ...prepared, bucket: secondary.bucket, method: "PUT" }));
	assert.equal(response.statusCode, 403);
	assert.match(JSON.parse(response.body).error, /bucket configuration/);
	assert.equal(signatures.length, 0);
});

test("changing a bucket prefix or region invalidates its outstanding grant", async () => {
	const { handle } = setup();
	const prepared = await prepare(handle);
	for (const changed of [{ prefix: "new-media/" }, { region: "eu-west-1" }]) {
		const updated = setup({ config: { ...config, buckets: { [primary.bucket]: { ...primary, ...changed } } } });
		assert.equal((await updated.handle(event("POST /sign", { ...prepared, method: "PUT" }))).statusCode, 403);
		assert.equal(updated.signatures.length, 0);
	}
});

test("bucket mappings are parsed once and malformed entries fail closed", () => {
	const parsed = parseBuckets(JSON.stringify(config.buckets));
	assert.equal(parsed.get(secondary.bucket).region, "us-east-1");
	for (const value of [undefined, "", "{", "null", "[]", "{}", { "bad bucket": primary }]) {
		assert.throws(() => parseBuckets(value), /MEDIA_BUCKETS/);
	}
	for (const settings of [
		null, [], { ...primary, prefix: "../" }, { ...primary, prefix: "media" },
		{ ...primary, region: undefined }, { ...primary, region: "https://attacker.example.com" },
		{ ...primary, publicBaseUrl: "http://media.example.com" },
		{ ...primary, publicBaseUrl: "https://media.example.com/path" },
		{ ...primary, publicBaseUrl: "https://media.example.com?token=fixture" },
	]) assert.throws(() => parseBuckets({ [primary.bucket]: settings }), /MEDIA_BUCKETS/);
});

test("real presigned URLs use the selected bucket's region, not the Lambda region", async () => {
	const { handle } = setup({
		clientForRegion: region => new S3Client({
			region, credentials: { accessKeyId: "fixture", secretAccessKey: "fixture" },
			requestChecksumCalculation: "WHEN_REQUIRED",
		}),
		sign: getSignedUrl,
	});
	const prepared = await prepare(handle, { bucket: secondary.bucket });
	const response = await handle(event("POST /sign", { ...prepared, method: "PUT" }));
	assert.equal(response.statusCode, 200);
	const url = new URL(JSON.parse(response.body).url);
	assert.match(url.hostname, /second-example-bucket\.s3\.us-east-1\.amazonaws\.com/);
	assert.match(url.searchParams.get("X-Amz-Credential"), /\/us-east-1\/s3\/aws4_request$/);
});
