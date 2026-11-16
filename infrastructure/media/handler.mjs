import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import {
	S3Client, ListObjectsV2Command, PutObjectCommand,
	CreateMultipartUploadCommand, UploadPartCommand, ListPartsCommand,
	CompleteMultipartUploadCommand, AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MEDIA_TYPES as TYPES, mediaType } from "./media-types.mjs";

export const MAX_FILE_SIZE = 2 * 1024 ** 3;
export const PART_SIZE = 10 * 1024 ** 2;
const GRANT_LIFETIME = 24 * 60 * 60;

class HttpError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

function reject(message) {
	throw new HttpError(400, message);
}

export function monthPrefix(month, prefix) {
	if (typeof month !== "string" || !/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(month)) {
		reject("Month must use YYYY-MM.");
	}
	return `${prefix}${month.replace("-", "/")}/`;
}

export function mediaUrl(base, key) {
	return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function json(statusCode, value) {
	return {
		statusCode,
		headers: { "content-type": "application/json", "cache-control": "no-store" },
		body: JSON.stringify(value),
	};
}

function parseBody(event) {
	if (event.isBase64Encoded || typeof event.body !== "string" || event.body.length > 8192) {
		reject("Expected a small JSON request.");
	}
	let body;
	try {
		body = JSON.parse(event.body);
	} catch {
		reject("Invalid JSON.");
	}
	if (!body || typeof body !== "object" || Array.isArray(body)) reject("Expected a JSON object.");
	return body;
}

function mac(payload, secret) {
	return createHmac("sha256", secret).update(payload).digest();
}

function credentialDigest(value) {
	return createHash("sha256").update(value).digest();
}

function authenticate(event, expected) {
	const header = event.headers?.authorization ?? event.headers?.Authorization;
	const match = typeof header === "string" && header.length <= 8192 &&
		/^Basic ([a-zA-Z0-9+/]+={0,2})$/i.exec(header);
	if (!match) throw new HttpError(401, "Invalid username or password.");
	const decoded = Buffer.from(match[1], "base64");
	if (decoded.toString("base64") !== match[1] ||
		!timingSafeEqual(credentialDigest(decoded), expected)) {
		throw new HttpError(401, "Invalid username or password.");
	}
}

function createGrant(data, secret) {
	const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
	return `${payload}.${mac(payload, secret).toString("base64url")}`;
}

function readGrant(ticket, secret, subject, now, prefix) {
	if (typeof ticket !== "string" || ticket.length > 4096) reject("Invalid upload grant.");
	const [payload, signature, extra] = ticket.split(".");
	if (!payload || !signature || extra) reject("Invalid upload grant.");
	const actual = Buffer.from(signature, "base64url");
	const expected = mac(payload, secret);
	if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
		throw new HttpError(403, "Invalid upload grant.");
	}
	let grant;
	try {
		grant = JSON.parse(Buffer.from(payload, "base64url").toString());
	} catch {
		reject("Invalid upload grant.");
	}
	if (!grant || grant.sub !== subject || !Number.isSafeInteger(grant.exp) ||
		grant.exp <= Math.floor(now.getTime() / 1000) ||
		typeof grant.key !== "string" || !grant.key.startsWith(prefix) ||
		!Number.isSafeInteger(grant.size) || grant.size < 1 || grant.size > MAX_FILE_SIZE ||
		!TYPES.has(grant.type)) {
		throw new HttpError(403, "Upload grant expired or does not belong to this user.");
	}
	return grant;
}

export function parseBuckets(value) {
	let entries = value;
	if (typeof value === "string") {
		try {
			entries = JSON.parse(value);
		} catch {
			throw new Error("MEDIA_BUCKETS must contain a valid JSON object.");
		}
	}
	if (!entries || typeof entries !== "object" || Array.isArray(entries) || !Object.keys(entries).length) {
		throw new Error("MEDIA_BUCKETS must contain at least one configured bucket.");
	}
	const buckets = new Map();
	for (const [bucket, settings] of Object.entries(entries)) {
		if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) ||
			!settings || typeof settings !== "object" || Array.isArray(settings) ||
			typeof settings.prefix !== "string" || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/$/.test(settings.prefix) ||
			typeof settings.region !== "string" || !/^[a-z]{2}(?:-[a-z]+)+-\d+$/.test(settings.region) ||
			typeof settings.publicBaseUrl !== "string") {
			throw new Error("Each MEDIA_BUCKETS entry needs a valid bucket name, prefix, region, and HTTPS publicBaseUrl.");
		}
		let url;
		try {
			url = new URL(settings.publicBaseUrl);
		} catch {
			throw new Error("MEDIA_BUCKETS publicBaseUrl must be an HTTPS origin.");
		}
		if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
			throw new Error("MEDIA_BUCKETS publicBaseUrl must be an HTTPS origin without credentials, path, or query.");
		}
		buckets.set(bucket, { bucket, prefix: settings.prefix, region: settings.region, publicBaseUrl: url.origin });
	}
	return buckets;
}

export function createHandler({ clientForRegion, sign = getSignedUrl, config, now = () => new Date(), uuid = randomUUID, logger = console }) {
	const { username, password } = config;
	const buckets = parseBuckets(config.buckets);
	const clients = new Map();
	const getClient = clientForRegion ?? (region => {
		if (!clients.has(region)) clients.set(region, new S3Client({ region, requestChecksumCalculation: "WHEN_REQUIRED" }));
		return clients.get(region);
	});
	function destination(bucket) {
		if (typeof bucket !== "string" || !bucket) reject("A bucket name is required.");
		const settings = buckets.get(bucket);
		if (!settings) throw new HttpError(403, "This bucket is not allowed.");
		return settings;
	}
	if (typeof username !== "string" || !username || username.length > 128 || /[:\r\n]/.test(username) ||
		typeof password !== "string" || password.length < 16 || password.length > 1024 || /[\r\n]/.test(password)) {
		throw new Error("Set MEDIA_USERNAME (no colon) and MEDIA_PASSWORD (16-1024 characters) on Lambda.");
	}
	const expectedCredentials = credentialDigest(`${username}:${password}`);
	const secret = createHmac("sha256", expectedCredentials).update("blog-media-upload-grants").digest("hex");

	return async event => {
		try {
			authenticate(event, expectedCredentials);
			const route = event.routeKey;
			if (route === "GET /media") {
				const query = event.queryStringParameters || {};
				const { bucket, prefix, publicBaseUrl, region } = destination(query.bucket);
				const listPrefix = query.month ? monthPrefix(query.month, prefix) : prefix;
				if (query.cursor && (typeof query.cursor !== "string" || query.cursor.length > 4096)) {
					reject("Invalid page cursor.");
				}
				const result = await getClient(region).send(new ListObjectsV2Command({
					Bucket: bucket, Prefix: listPrefix, MaxKeys: 50,
					ContinuationToken: query.cursor || undefined,
				}));
				return json(200, {
					bucket,
					items: (result.Contents || []).filter(item => item.Key && !item.Key.endsWith("/")).map(item => ({
						key: item.Key, size: item.Size, modified: item.LastModified?.toISOString(),
						url: mediaUrl(publicBaseUrl, item.Key),
					})),
					cursor: result.IsTruncated ? result.NextContinuationToken : null,
				});
			}

			if (route === "POST /uploads") {
				const body = parseBody(event);
				const { bucket, prefix, publicBaseUrl, region } = destination(body.bucket);
				if (typeof body.name !== "string" || body.name.length > 255 || !body.name) reject("Invalid filename.");
				if (!Number.isSafeInteger(body.size) || body.size < 1 || body.size > MAX_FILE_SIZE) {
					reject("Files must be between 1 byte and 2 GiB.");
				}
				const type = mediaType(body.name);
				if (!type || body.type !== type) reject("Unsupported image/audio/video type or filename extension.");
				const date = now();
				const folder = monthPrefix(body.month || date.toISOString().slice(0, 7), prefix);
				const filename = body.name.split(/[\\/]/).at(-1)
					.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "").slice(-160);
				const key = `${folder}${uuid()}-${filename}`;
				const ticket = createGrant({
					bucket, prefix, region,
					key, size: body.size, type: body.type, sub: "owner",
					exp: Math.floor(date.getTime() / 1000) + GRANT_LIFETIME,
				}, secret);
				return json(201, { bucket, key, ticket, url: mediaUrl(publicBaseUrl, key), partSize: PART_SIZE });
			}

			if (route === "POST /sign") {
				const body = parseBody(event);
				const { bucket, prefix, region } = destination(body.bucket);
				const grant = readGrant(body.ticket, secret, "owner", now(), prefix);
				if (grant.bucket !== bucket || grant.prefix !== prefix || grant.region !== region) {
					throw new HttpError(403, "Upload grant does not match this bucket configuration.");
				}
				if (body.key !== grant.key) throw new HttpError(403, "Upload key does not match its grant.");
				const input = { Bucket: bucket, Key: grant.key };
				const hasUploadId = body.uploadId !== undefined;
				if (hasUploadId && (typeof body.uploadId !== "string" || !body.uploadId || body.uploadId.length > 2048)) {
					reject("Invalid multipart upload ID.");
				}
				let command;
				let headers;
				if (!hasUploadId) {
					if (body.partNumber !== undefined) reject("Part number requires a multipart upload ID.");
					headers = { "Content-Type": grant.type };
					const metadata = { ...input, ContentType: grant.type };
					if (body.method === "PUT") {
						if (grant.size > 100 * 1024 ** 2) reject("Files over 100 MiB require multipart upload.");
						command = new PutObjectCommand({ ...metadata, ContentLength: grant.size });
					} else if (body.method === "POST") {
						command = new CreateMultipartUploadCommand(metadata);
					} else reject("Unsupported upload operation.");
				} else if (body.method === "PUT") {
					const count = Math.ceil(grant.size / PART_SIZE);
					if (!Number.isInteger(body.partNumber) || body.partNumber < 1 || body.partNumber > count) {
						reject("Invalid multipart part number.");
					}
					command = new UploadPartCommand({
						...input, UploadId: body.uploadId, PartNumber: body.partNumber,
						ContentLength: Math.min(PART_SIZE, grant.size - (body.partNumber - 1) * PART_SIZE),
					});
				} else {
					if (body.partNumber !== undefined) reject("Part number is only valid for uploading a part.");
					const commands = new Map([["GET", ListPartsCommand], ["POST", CompleteMultipartUploadCommand], ["DELETE", AbortMultipartUploadCommand]]);
					const Command = commands.get(body.method);
					if (!Command) reject("Unsupported upload operation.");
					command = new Command({ ...input, UploadId: body.uploadId });
				}
				const url = await sign(getClient(region), command, {
					expiresIn: 300,
					signableHeaders: new Set(["content-length", ...(headers ? ["content-type"] : [])]),
				});
				return json(200, { bucket, url, key: grant.key, ...(headers && { headers }) });
			}
			throw new HttpError(404, "Unknown media endpoint.");
		} catch (error) {
			if (error instanceof HttpError) return json(error.status, { error: error.message });
			logger.error("Media API request failed", { route: event.routeKey, name: error.name, message: error.message });
			return json(500, { error: "Media service failed. Check the Lambda logs and try again." });
		}
	};
}

let runtimeHandler;
export async function handler(event) {
	if (!runtimeHandler) {
		try {
			runtimeHandler = createHandler({
				config: {
					buckets: process.env.MEDIA_BUCKETS,
					username: process.env.MEDIA_USERNAME, password: process.env.MEDIA_PASSWORD,
				},
			});
		} catch (error) {
			console.error("Media API configuration failed:", error.message);
			return json(503, { error: "Media service is not configured. Check the Lambda environment variables." });
		}
	}
	return runtimeHandler(event);
}
