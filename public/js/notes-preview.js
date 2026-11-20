import { readPosts } from "../media/shared/posts.js";
import { firstThumbnail, mediaType } from "../media/shared/media-types.js";

function previewMedia(media) {
	const image = media.find(item => mediaType(item.key)?.startsWith("image/"));
	const asset = image ?? media[0];
	if (!asset) return;
	const type = mediaType(asset.key);
	const thumbnail = document.createElement("img");
	thumbnail.className = "home-note-media";
	thumbnail.width = thumbnail.height = 44;
	thumbnail.alt = "";
	if (image) {
		thumbnail.src = firstThumbnail(image)?.url ?? image.url;
		thumbnail.loading = "lazy";
		thumbnail.referrerPolicy = "no-referrer";
		thumbnail.addEventListener("error", () => {
			console.warn("Memos preview: Could not load image thumbnail.");
			thumbnail.hidden = true;
		}, { once: true });
	} else {
		const kind = type?.startsWith("video/") ? "video" : "audio";
		thumbnail.src = `/images/note-${kind}.svg`;
		thumbnail.alt = kind === "video" ? "Video attached" : "Audio attached";
		thumbnail.className += " home-note-icon";
	}
	return thumbnail;
}

async function loadPreview(section) {
	try {
		const now = new Date();
		const month = now.toISOString().slice(0, 7);
		const url = new URL(`${month.replace("-", "/")}/posts.json`, section.dataset.feedUrl);
		const response = await fetch(url, {
			credentials: "omit",
			referrerPolicy: "no-referrer",
			cache: "no-cache",
			signal: AbortSignal.timeout(15000),
		});
		if (response.status === 404) {
			console.warn(`Memos preview: No posts file for ${month} (HTTP 404).`);
			return;
		}
		if (!response.ok) throw new Error(`Could not load memos (HTTP ${response.status}).`);
		const posts = readPosts(await response.json(), month)
			.filter(post => post.created <= now.toISOString())
			.sort((a, b) => b.created.localeCompare(a.created))
			.slice(0, 2);
		if (!posts.length) return;

		const list = section.querySelector("[data-notes-list]");
		for (const post of posts) {
			const item = document.createElement("li");
			const link = document.createElement("a");
			link.className = "home-note-link";
			link.href = `/memos/?month=${month}#note-${post.id}`;
			const thumbnail = previewMedia(post.media);
			if (thumbnail) link.append(thumbnail);
			const copy = document.createElement("div");
			copy.className = "home-note-copy";
			const time = document.createElement("time");
			time.dateTime = post.created;
			time.textContent = new Date(post.created).toLocaleDateString("en-US", {
				month: "short", day: "numeric", timeZone: "UTC",
			});
			const text = document.createElement("p");
			const message = post.text.trim().replace(/\s+/g, " ") || "New media shared on Memos.";
			const characters = Array.from(message);
			text.textContent = characters.length > 140
				? `${characters.slice(0, 139).join("").trimEnd()}\u2026`
				: message;
			copy.append(time, text);
			link.append(copy);
			item.append(link);
			list.append(item);
		}
		section.querySelector("[data-notes-month]").textContent =
			` \u00b7 ${now.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })}`;
		section.hidden = false;
	} catch (error) {
		console.error("Memos preview:", error);
	}
}

for (const section of document.querySelectorAll("[data-notes-preview]")) {
	void loadPreview(section);
}
