export class MediaAuth {
	#authorization = null;

	login(username, password) {
		if (typeof username !== "string" || !username || username.length > 128 || /[:\r\n]/.test(username) ||
			typeof password !== "string" || !password || password.length > 1024 || /[\r\n]/.test(password)) {
			throw new Error("Enter a username (without a colon) and password.");
		}
		const bytes = new TextEncoder().encode(`${username}:${password}`);
		this.#authorization = `Basic ${btoa(String.fromCharCode(...bytes))}`;
	}

	get authorization() {
		if (!this.#authorization) throw new Error("Sign in to manage media.");
		return this.#authorization;
	}

	clear() {
		this.#authorization = null;
	}
}
