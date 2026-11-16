import { MEDIA_TYPES, mediaType } from "../infrastructure/media/media-types.mjs";
export { mediaType };

export const MAX_FILE_SIZE = 2 * 1024 ** 3;
export const PART_SIZE = 10 * 1024 ** 2;

export function validateFile(file) {
	if (!mediaType(file.name)) {
		throw new Error(`Unsupported file extension. Supported: ${[...MEDIA_TYPES.values()].flat().join(", ")}.`);
	}
	if (!Number.isSafeInteger(file.size) || file.size < 1 || file.size > MAX_FILE_SIZE) {
		throw new Error("Files must be between 1 byte and 2 GiB.");
	}
}

export function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
	return `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
}
