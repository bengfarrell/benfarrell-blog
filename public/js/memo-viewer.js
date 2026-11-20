import { firstThumbnail } from "../media/shared/media-types.js";

export class MemoViewer {
	constructor(dialog) {
		this.dialog = dialog;
		this.content = dialog.querySelector("[data-viewer-content]");
		this.title = dialog.querySelector("[data-viewer-title]");
		this.original = dialog.querySelector("[data-viewer-original]");
		this.error = dialog.querySelector("[data-viewer-error]");
		this.events = new AbortController();
		this.previews = new Map();
		this.sources = new WeakMap();
		dialog.addEventListener("close", () => {
			if (!dialog.open) this.reset();
		}, { signal: this.events.signal });
		dialog.addEventListener("click", event => {
			if (event.target !== dialog) return;
			const rect = dialog.getBoundingClientRect();
			if (event.clientX < rect.left || event.clientX > rect.right ||
				event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
		}, { signal: this.events.signal });
	}

	enhance(feed, media) {
		const previews = [...feed.querySelectorAll(".monthly-post-media .monthly-preview")];
		if (previews.length !== media.length) throw new Error("Rendered memo media does not match the feed.");
		for (const [index, preview] of previews.entries()) {
			this.sources.set(preview, media[index]);
			if (this.previews.has(preview)) continue;
			const kind = preview.tagName === "IMG" ? "image" : preview.tagName.toLowerCase();
			if (!["image", "video", "audio"].includes(kind)) continue;
			const name = preview.getAttribute("alt") || preview.getAttribute("aria-label") || kind;
			const button = document.createElement("button");
			button.type = "button";
			button.className = "memo-asset-expand";
			button.setAttribute("aria-label", `Expand ${kind}: ${name}`);
			button.setAttribute("aria-haspopup", "dialog");
			const icon = document.createElement("img");
			icon.src = "/images/asset-expand.svg";
			icon.alt = "";
			icon.width = icon.height = 16;
			button.append(icon, document.createTextNode("Expand"));
			button.addEventListener("click", () => this.open(preview, button, kind, name, this.sources.get(preview)), {
				signal: this.events.signal,
			});
			if (kind === "image") {
				preview.classList.add("memo-expandable-image");
				preview.addEventListener("click", () => this.open(preview, button, kind, name, this.sources.get(preview)), {
					signal: this.events.signal,
				});
			}
			preview.after(button);
			this.previews.set(preview, button);
		}
	}

	open(preview, opener, kind, name, media) {
		if (this.dialog.open) return;
		this.reset();
		const asset = document.createElement(kind === "image" ? "img" : kind);
		this.asset = asset;
		this.preview = preview;
		this.opener = opener;
		this.title.textContent = name;
		this.original.href = media.url;
		this.error.hidden = true;
		asset.addEventListener("error", () => {
			if (asset !== this.asset) return;
			this.error.textContent = "This media could not be displayed. Try opening the original file.";
			this.error.hidden = false;
			console.error("Memos viewer: Could not load media.");
		}, { once: true });
		if (kind === "image") {
			asset.alt = preview.alt;
			asset.referrerPolicy = "no-referrer";
		} else {
			preview.pause();
			const position = preview.currentTime;
			asset.controls = true;
			asset.preload = "metadata";
			asset.playsInline = true;
			const thumbnail = firstThumbnail(media);
			if (kind === "video" && thumbnail) asset.poster = thumbnail.url;
			asset.addEventListener("loadedmetadata", () => {
				if (asset === this.asset && Number.isFinite(position)) {
					asset.currentTime = Number.isFinite(asset.duration)
						? Math.min(position, asset.duration) : position;
				}
			}, { once: true });
		}
		asset.src = media.url;
		this.content.replaceChildren(asset);
		this.dialog.showModal();
		document.documentElement.classList.add("memo-viewer-open");
	}

	reset() {
		if (!this.asset) return;
		if (this.asset.tagName !== "IMG") {
			this.asset.pause();
			if (this.asset.readyState >= 1 && this.preview.readyState >= 1) {
				const position = this.asset.currentTime;
				this.preview.currentTime = Number.isFinite(this.preview.duration)
					? Math.min(position, this.preview.duration) : position;
			}
			this.asset.removeAttribute("src");
			this.asset.load();
		}
		this.content.replaceChildren();
		document.documentElement.classList.remove("memo-viewer-open");
		if (this.opener.isConnected) this.opener.focus({ preventScroll: true });
		this.asset = this.preview = this.opener = null;
	}

	destroy() {
		if (this.dialog.open) this.dialog.close();
		this.reset();
		this.events.abort();
		for (const [preview, button] of this.previews) {
			preview.classList.remove("memo-expandable-image");
			button.remove();
		}
		this.previews.clear();
	}
}
