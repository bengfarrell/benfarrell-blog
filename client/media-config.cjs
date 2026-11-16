function validateConnection(apiUrl, bucket) {
	if (typeof apiUrl !== "string") throw new Error("API URL must be an HTTPS origin.");
	let url;
	try {
		url = new URL(apiUrl.trim());
	} catch {
		throw new Error("API URL must be an HTTPS origin.");
	}
	if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
		throw new Error("API URL must be an HTTPS origin without a path, query, or credentials.");
	}
	if (typeof bucket !== "string" || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket.trim())) {
		throw new Error("Enter an S3 bucket name, not a URL or folder path.");
	}
	return { apiUrl: url.origin, bucket: bucket.trim() };
}

module.exports = { validateConnection };
