const path = require("node:path");

module.exports = {
	cacheDirectory: path.join(__dirname, ".cache", "puppeteer"),
	chrome: { skipDownload: process.platform === "darwin" },
	"chrome-headless-shell": { skipDownload: true },
};
