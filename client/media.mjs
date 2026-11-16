import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import AwsS3 from "@uppy/aws-s3";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "./media.css";
import { MediaAuth } from "./media-auth.mjs";
import { validateConnection } from "./media-config.cjs";
import { MAX_FILE_SIZE, PART_SIZE, mediaType, validateFile, formatBytes } from "./media-helpers.mjs";

const elements = Object.fromEntries([
	"status", "error", "login", "login-form", "username", "password", "logout", "private", "upload-month",
	"uploaded", "browse", "browse-month", "refresh", "library", "more",
	"browse-tab", "upload-tab", "browse-panel", "upload-panel",
].map(name => [name, document.getElementById(`media-${name}`)]));

function status(message, quiet = false) {
	elements.status.textContent = message;
	elements.status.classList.toggle("media-sr-only", quiet);
}

function showError(error) {
	console.error("Media manager:", error.message);
	elements.error.textContent = error.message;
	elements.error.hidden = false;
}

function clearError() {
	elements.error.hidden = true;
	elements.error.textContent = "";
}

function selectTab(name) {
	for (const tab of ["browse", "upload"]) {
		const selected = tab === name;
		elements[`${tab}-tab`].setAttribute("aria-selected", String(selected));
		elements[`${tab}-tab`].tabIndex = selected ? 0 : -1;
		elements[`${tab}-panel`].hidden = !selected;
	}
}

function node(tag, text) {
	const result = document.createElement(tag);
	if (text !== undefined) result.textContent = text;
	return result;
}

function asset(item, preview = true) {
	const row = node("li");
	const link = node("a", item.key.split("/").at(-1));
	link.href = item.url;
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	link.className = "media-asset-title";
	link.title = link.textContent;
	row.append(link);
	const type = mediaType(item.key);
	if (preview && type && !["image/heic", "image/heif"].includes(type)) {
		const media = node(type.startsWith("audio/") ? "audio" : type.startsWith("video/") ? "video" : "img");
		if (media.tagName === "VIDEO" || media.tagName === "AUDIO") {
			media.controls = true;
			media.preload = "none";
		} else {
			media.loading = "lazy";
			media.alt = item.key.split("/").at(-1);
		}
		media.src = item.url;
		row.append(media);
	}
	row.append(node("p", formatBytes(item.size)));
	const label = node("label", "Public media URL");
	const input = node("input");
	input.type = "url";
	input.readOnly = true;
	input.value = item.url;
	input.className = "media-url";
	input.id = `media-url-${crypto.randomUUID()}`;
	label.htmlFor = input.id;
	const urlRow = node("div");
	urlRow.className = "media-url-row";
	const copy = node("button");
	copy.type = "button";
	copy.className = "media-button media-copy";
	copy.setAttribute("aria-label", "Copy URL");
	copy.title = "Copy URL";
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("width", "20");
	svg.setAttribute("height", "20");
	svg.setAttribute("fill", "none");
	svg.setAttribute("stroke", "currentColor");
	svg.setAttribute("stroke-width", "2");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("focusable", "false");
	const outline = document.createElementNS(svg.namespaceURI, "path");
	outline.setAttribute("d", "M8 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3");
	const square = document.createElementNS(svg.namespaceURI, "rect");
	for (const [name, value] of Object.entries({ x: "8", y: "8", width: "13", height: "13", rx: "2" })) {
		square.setAttribute(name, value);
	}
	svg.append(outline, square);
	copy.append(svg);
	copy.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(item.url);
			status("Media URL copied.");
		} catch {
			input.focus();
			input.select();
			showError(new Error("Clipboard access failed. Copy the selected URL manually."));
		}
	});
	urlRow.append(input, copy);
	row.append(label, urlRow);
	return row;
}

async function start() {
	const response = await fetch("/media/config.json", { cache: "no-store", credentials: "omit" });
	if (!response.ok) throw new Error(`Cannot load media configuration (HTTP ${response.status}).`);
	const config = await response.json();
	const siteConnection = validateConnection(config.apiUrl, config.bucket);
	const auth = new MediaAuth();
	let connection = null;
	for (const name of ["browse", "upload"]) {
		const tab = elements[`${name}-tab`];
		tab.addEventListener("click", () => selectTab(name));
		tab.addEventListener("keydown", event => {
			let target;
			if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
				target = name === "browse" ? "upload" : "browse";
			} else if (event.key === "Home") target = "browse";
			else if (event.key === "End") target = "upload";
			else return;
			event.preventDefault();
			selectTab(target);
			elements[`${target}-tab`].focus();
		});
	}
	function lock() {
		auth.clear();
		connection = null;
		elements["login-form"].hidden = false;
		elements.login.hidden = false;
		elements.logout.hidden = true;
		elements.private.hidden = true;
		elements["browse-tab"].disabled = true;
		elements["upload-tab"].disabled = true;
		selectTab("browse");
	}
	elements["upload-month"].value = new Date().toISOString().slice(0, 7);
	elements["browse-month"].value = new Date().toISOString().slice(0, 7);

	async function api(path, body) {
		const authorization = auth.authorization;
		const destination = connection;
		const url = new URL(`${destination.apiUrl}${path}`);
		if (!body) url.searchParams.set("bucket", destination.bucket);
		const result = await fetch(url.href, {
			method: body ? "POST" : "GET",
			headers: { Authorization: authorization, ...(body && { "content-type": "application/json" }) },
			...(body && { body: JSON.stringify({ ...body, bucket: destination.bucket }) }),
			credentials: "omit",
			referrerPolicy: "no-referrer",
			signal: AbortSignal.timeout(30000),
		});
		const data = await result.json();
		if (connection !== destination || auth.authorization !== authorization) {
			throw new Error("Sign-in changed during the request. Refresh the library.");
		}
		if (result.status === 401) {
			lock();
			throw new Error("Invalid username or password. Sign in again.");
		}
		if (!result.ok) throw new Error(data.error || `Media API returned HTTP ${result.status}.`);
		return data;
	}

	let cursor = null;
	let listedMonth = "";
	let browsing = false;
	let refreshPending = false;
	async function browse(append = false) {
		if (browsing) {
			if (!append) refreshPending = true;
			return;
		}
		const destination = connection;
		browsing = true;
		elements.refresh.disabled = true;
		elements.more.disabled = true;
		clearError();
		try {
			const query = new URLSearchParams();
			const month = append ? listedMonth : elements["browse-month"].value;
			if (month) query.set("month", month);
			if (append && cursor) query.set("cursor", cursor);
			const page = await api(`/media?${query}`);
			if (page.bucket !== destination.bucket) throw new Error("The media API returned a different bucket.");
			if (!append) elements.library.replaceChildren();
			for (const item of page.items) elements.library.append(asset(item));
			cursor = page.cursor;
			listedMonth = month;
			elements.more.hidden = !cursor;
			const hasMedia = elements.library.children.length > 0;
			status(hasMedia ? "Media library loaded." : "No media found for this month/prefix.", hasMedia);
			return true;
		} catch (error) {
			showError(error);
			status("Could not load the media library.");
			return false;
		} finally {
			browsing = false;
			elements.refresh.disabled = false;
			elements.more.disabled = false;
			if (refreshPending) {
				refreshPending = false;
				if (connection) browse();
			}
		}
	}
	elements["browse-month"].addEventListener("change", () => browse());
	elements.browse.addEventListener("submit", event => {
		event.preventDefault();
		browse();
	});
	elements.more.addEventListener("click", () => browse(true));

	const grants = new Map();
	const proposals = new Map();
	const uppy = new Uppy({
		restrictions: { maxFileSize: MAX_FILE_SIZE, maxNumberOfFiles: 20 },
		onBeforeFileAdded(file) {
			try {
				validateFile(file);
				return true;
			} catch (error) {
				showError(error);
				return false;
			}
		},
	}).use(Dashboard, {
		inline: true, target: "#media-uploader", proudlyDisplayPoweredByUppy: false,
		height: 360, note: "Images, audio, and videos, up to 2 GiB per file",
	}).use(AwsS3, {
		limit: 3,
		shouldUseMultipart: file => file.size > 100 * 1024 ** 2,
		getChunkSize: () => PART_SIZE,
		generateObjectKey(file) {
			const proposal = crypto.randomUUID();
			proposals.set(proposal, file);
			return proposal;
		},
		async signRequest(request) {
			const destination = connection;
			let grant = grants.get(request.key);
			if (!grant) {
				const file = proposals.get(request.key);
				if (!file || request.uploadId) throw new Error("Upload authorization is missing. Remove the file and add it again.");
				grant = await api("/uploads", {
					name: file.name, size: file.size, type: mediaType(file.name),
					month: elements["upload-month"].value,
				});
				if (grant.bucket !== destination.bucket) throw new Error("Upload authorization returned a different bucket.");
				if (grant.partSize !== PART_SIZE) throw new Error("Uploader and API part sizes differ. Rebuild the site with the matching API version.");
				grants.set(request.key, grant);
				grants.set(grant.key, grant);
			}
			return api("/sign", { ...request, key: grant.key, ticket: grant.ticket });
		},
	});
	uppy.on("upload", () => {
		clearError();
		elements.logout.disabled = true;
		elements["upload-month"].disabled = true;
		status("Uploading media. Keep this page open.");
	});
	uppy.on("upload-error", (file, error) => showError(new Error(`${file?.name || "Upload"}: ${error.message}`)));
	uppy.on("restriction-failed", (file, error) => showError(error));
	uppy.on("upload-success", (file, result) => {
		const grant = grants.get(result.body.key);
		if (!grant) {
			showError(new Error("Upload finished but its public URL is missing. Refresh the library."));
			return;
		}
		elements.uploaded.prepend(asset({ key: grant.key, url: grant.url, size: file.size }, false));
	});
	uppy.on("complete", result => {
		elements.logout.disabled = false;
		elements["upload-month"].disabled = false;
		status(`${result.successful.length} uploaded; ${result.failed.length} failed. Uploaded URLs are shown below the uploader.`);
	});
	uppy.on("cancel-all", () => {
		elements.logout.disabled = false;
		elements["upload-month"].disabled = false;
		status("Uploads cancelled.");
	});
	elements["login-form"].addEventListener("submit", async event => {
		event.preventDefault();
		clearError();
		elements.login.disabled = true;
		try {
			const destination = { ...siteConnection };
			auth.login(elements.username.value, elements.password.value);
			connection = destination;
			if (await browse()) {
				elements["login-form"].hidden = true;
				elements.login.hidden = true;
				elements.logout.hidden = false;
				elements.private.hidden = false;
				elements["browse-tab"].disabled = false;
				elements["upload-tab"].disabled = false;
			} else lock();
		} catch (error) {
			lock();
			showError(error);
		} finally {
			elements.username.value = "";
			elements.password.value = "";
			elements.login.disabled = false;
		}
	});
	elements.logout.addEventListener("click", () => {
		uppy.cancelAll();
		grants.clear();
		proposals.clear();
		elements.library.replaceChildren();
		elements.uploaded.replaceChildren();
		cursor = null;
		lock();
		clearError();
		status("Signed out. Sign in again to manage media.");
	});
	lock();
	status("Sign in to browse and upload media.");
}

start().catch(error => {
	showError(error);
	status("Media manager could not start.");
});
