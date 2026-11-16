import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { unzipSync } from "fflate";

test("deployment ZIP contains a standalone handler that reads Lambda environment variables", () => {
	execFileSync(process.execPath, ["scripts/build-media-api.mjs"], { stdio: "pipe" });
	const files = unzipSync(readFileSync("dist/media-lambda.zip"));
	assert.deepEqual(Object.keys(files), ["handler.mjs"]);

	const directory = mkdtempSync(join(tmpdir(), "media-lambda-test-"));
	try {
		const filename = join(directory, "handler.mjs");
		writeFileSync(filename, files["handler.mjs"]);
		const username = "archive-test";
		const password = "archive-test-password";
		const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
			const { handler } = await import(${JSON.stringify(pathToFileURL(filename).href)});
			const headers = {
				authorization: "Basic " + Buffer.from(process.env.MEDIA_USERNAME + ":" + process.env.MEDIA_PASSWORD).toString("base64"),
			};
			const unauthorized = await handler({ routeKey: "GET /media", headers: {} });
			const unknownBucket = await handler({
				routeKey: "GET /media", headers, queryStringParameters: { bucket: "not-allowed" },
			});
			console.log(JSON.stringify([unauthorized, unknownBucket]));
		`], {
			encoding: "utf8",
			env: {
				...process.env,
				MEDIA_USERNAME: username,
				MEDIA_PASSWORD: password,
				MEDIA_BUCKETS: JSON.stringify({
					"archive-test-bucket": {
						prefix: "media/", publicBaseUrl: "https://media.example.com", region: "us-west-2",
					},
				}),
			},
		});
		const [unauthorized, unknownBucket] = JSON.parse(output);
		assert.equal(unauthorized.statusCode, 401);
		assert.equal(unknownBucket.statusCode, 403);
		assert.deepEqual(JSON.parse(unknownBucket.body), { error: "This bucket is not allowed." });
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
});
