import { MonthlyFeed, PostFeed, validateMonth } from "../media/monthly.js";
import { MemoViewer } from "./memo-viewer.js";

class NotesFeed extends MonthlyFeed {
	connectedCallback() {
		const month = new URL(window.location.href).searchParams.get("month");
		let now = () => new Date();
		if (month !== null) {
			try {
				validateMonth(month);
				now = () => new Date(`${month}-01T00:00:00.000Z`);
			} catch (error) {
				console.error("Memos:", error);
				this.showStatus("This memo link has an invalid month. Showing recent memos instead.");
			}
		}
		this.model = new PostFeed({ baseUrl: this.getAttribute("base-url"), now });
		this.viewer = new MemoViewer(document.querySelector("[data-memo-viewer]"));
		this.onHashChange = () => {
			this.focusedHash = null;
			this.revealNote();
		};
		window.addEventListener("hashchange", this.onHashChange);
		super.connectedCallback();
	}

	disconnectedCallback() {
		window.removeEventListener("hashchange", this.onHashChange);
		this.viewer.destroy();
		this.model.destroy();
		super.disconnectedCallback();
	}

	updated() {
		this.viewer.enhance(this, this.model.state.posts.flatMap(post => post.media));
		const articles = this.querySelectorAll(".monthly-post");
		this.model.state.posts.forEach((post, index) => {
			if (articles[index]) {
				articles[index].id = `note-${post.id}`;
				articles[index].tabIndex = -1;
			}
		});
		this.revealNote();
	}

	showStatus(message) {
		const status = document.querySelector("[data-note-status]");
		status.textContent = message;
		status.hidden = false;
	}

	revealNote() {
		const hash = window.location.hash;
		if (!hash.startsWith("#note-") || hash === this.focusedHash ||
			!this.model.state.loaded || this.model.state.loading) return;
		this.focusedHash = hash;
		const articles = [...this.querySelectorAll(".monthly-post")];
		const target = articles.find(article => `#${article.id}` === hash);
		if (target) {
			target.focus({ preventScroll: true });
			target.scrollIntoView({ block: "start" });
		} else {
			this.showStatus(this.model.state.errors.length
				? "This memo could not be loaded. Please try again."
				: "This memo is no longer available.");
			console.warn("Memos: Linked post is unavailable.");
		}
	}
}

customElements.define("site-notes-feed", NotesFeed);
