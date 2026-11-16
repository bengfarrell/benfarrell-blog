const { validateConnection } = require("../client/media-config.cjs");

const API_URL = "https://n3rnxs3qyh.execute-api.us-east-1.amazonaws.com";
const BUCKET = "wp-uploads-bf";

module.exports = () => {
	const connection = validateConnection(API_URL, BUCKET);
	return { configJson: JSON.stringify({ configured: true, ...connection }) };
};
