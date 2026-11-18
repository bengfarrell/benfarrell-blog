const API_URL = "https://n3rnxs3qyh.execute-api.us-east-1.amazonaws.com";
const BUCKET = "wp-uploads-bf";
const FEED_URL = "https://d2ypg8o05lff0b.cloudfront.net/wp-content/uploads/";

module.exports = async () => {
	const { validateConnection, PostFeed } = await import("@bengfarrell/monthly/core");
	const connection = validateConnection(API_URL, BUCKET);
	const feedUrl = new PostFeed({ baseUrl: FEED_URL }).baseUrl;
	return { ...connection, feedUrl, configJson: JSON.stringify({ configured: true, ...connection }) };
};
