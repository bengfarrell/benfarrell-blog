(() => {
	const api = "https://public.api.bsky.app/xrpc/";
	const threadType = "app.bsky.feed.defs#threadViewPost";

	async function request(method, parameters) {
		const url = new URL(method, api);
		url.search = new URLSearchParams(parameters).toString();
		const response = await fetch(url, {
			credentials: "omit",
			referrerPolicy: "no-referrer",
			signal: AbortSignal.timeout(15000),
		});
		if (!response.ok) throw new Error(`Bluesky returned HTTP ${response.status}`);
		return response.json();
	}

	function element(tag, text, className) {
		const node = document.createElement(tag);
		if (text !== undefined) node.textContent = text;
		if (className) node.className = className;
		return node;
	}

	function link(text, url) {
		const node = element("a", text);
		node.href = url;
		node.target = "_blank";
		node.rel = "noopener noreferrer";
		return node;
	}

	function labeled(post) {
		return Boolean(post.labels?.length || post.author?.labels?.length);
	}

	function renderReplies(replies, budget, depth = 1) {
		const list = element("ul");
		for (const reply of [...replies].sort((a, b) =>
			(a.post?.record?.createdAt || "").localeCompare(b.post?.record?.createdAt || ""))) {
			if (budget.remaining === 0) break;
			budget.remaining--;
			const item = element("li");
			if (reply.$type !== threadType || labeled(reply.post)) {
				item.append(element("p", "A reply is unavailable or hidden because it carries a moderation label."));
			} else {
				const post = reply.post;
				const match = /^at:\/\/([^/]+)\/app\.bsky\.feed\.post\/([a-zA-Z0-9]+)$/.exec(post.uri);
				if (!match || !post.author?.did || typeof post.record?.text !== "string") {
					throw new Error("Bluesky returned an invalid reply");
				}
				const profileUrl = `https://bsky.app/profile/${encodeURIComponent(post.author.did)}`;
				const postUrl = `https://bsky.app/profile/${encodeURIComponent(match[1])}/post/${match[2]}`;
				const meta = element("p", undefined, "bluesky-comment-meta");
				meta.append(link(post.author.displayName || post.author.handle || post.author.did, profileUrl));
				const date = new Date(post.record.createdAt);
				if (!Number.isNaN(date.getTime())) {
					const time = element("time", date.toLocaleString());
					time.dateTime = date.toISOString();
					const permalink = link("", postUrl);
					permalink.append(time);
					meta.append(document.createTextNode(" | "), permalink);
				}
				item.append(meta, element("p", post.record.text, "bluesky-comment-text"));
				if (post.embed) item.append(link("View attached media or quoted post on Bluesky", postUrl));
				if (reply.replies?.length && depth < 6) {
					item.append(renderReplies(reply.replies, budget, depth + 1));
				}
			}
			list.append(item);
		}
		return list;
	}

	for (const section of document.querySelectorAll("[data-bluesky-comments]")) {
		const button = section.querySelector("[data-comments-load]");
		const status = section.querySelector("[data-comments-status]");
		const list = section.querySelector("[data-comments-list]");
		button.hidden = false;
		button.addEventListener("click", async () => {
			if (button.disabled) return;
			button.disabled = true;
			status.textContent = "Loading comments from Bluesky...";
			list.replaceChildren();
			list.setAttribute("aria-busy", "true");
			try {
				const postUrl = new URL(section.dataset.blueskyComments);
				const [, , actor, , postId] = postUrl.pathname.split("/");
				let did = decodeURIComponent(actor);
				if (!did.startsWith("did:")) {
					const profile = await request("app.bsky.actor.getProfile", { actor: did });
					did = profile.did;
				}
				if (typeof did !== "string" || !did.startsWith("did:")) {
					throw new Error("Bluesky returned an invalid account identifier");
				}
				const { thread } = await request("app.bsky.feed.getPostThread", {
					uri: `at://${did}/app.bsky.feed.post/${postId}`,
					depth: 6,
					parentHeight: 0,
				});
				if (thread?.$type !== threadType || labeled(thread.post)) {
					throw new Error("The Bluesky conversation is unavailable or moderation-labeled");
				}
				if (!thread.post || (thread.replies !== undefined && !Array.isArray(thread.replies))) {
					throw new Error("Bluesky returned an invalid conversation");
				}
				const replies = thread.replies || [];
				list.replaceChildren(renderReplies(replies, { remaining: 200 }));
				status.textContent = replies.length
					? "Showing available replies (up to 200, six levels deep). Labeled replies are hidden. View the full conversation on Bluesky."
					: "No replies yet. Be the first to reply on Bluesky!";
				button.textContent = "Refresh comments";
			} catch (error) {
				console.error("Unable to load Bluesky comments:", error);
				status.textContent = "Couldn't load comments. Try again, or read the conversation on Bluesky.";
				button.textContent = "Retry loading comments";
			} finally {
				button.disabled = false;
				list.setAttribute("aria-busy", "false");
			}
		});
	}
})();
