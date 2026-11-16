export const MEDIA_TYPES = new Map([
	["image/jpeg", ["jpg", "jpeg"]], ["image/png", ["png"]],
	["image/gif", ["gif"]], ["image/webp", ["webp"]], ["image/avif", ["avif"]],
	["image/heic", ["heic"]], ["image/heif", ["heif"]],
	["video/mp4", ["mp4", "m4v"]], ["video/webm", ["webm"]],
	["video/quicktime", ["mov"]],
	["audio/mpeg", ["mp3"]], ["audio/wav", ["wav"]],
	["audio/mp4", ["m4a"]], ["audio/aac", ["aac"]],
	["audio/ogg", ["ogg", "oga", "opus"]], ["audio/flac", ["flac"]],
	["audio/aiff", ["aif", "aiff"]], ["audio/webm", ["weba"]],
]);

export function mediaType(name) {
	const filename = name.split(/[\\/]/).at(-1);
	const dot = filename.lastIndexOf(".");
	if (dot < 1) return null;
	const extension = filename.slice(dot + 1).toLowerCase();
	for (const [type, extensions] of MEDIA_TYPES) {
		if (extensions.includes(extension)) return type;
	}
	return null;
}
