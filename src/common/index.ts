export * from './get-data';

interface Dimensions {
    width: number
    height: number
    orientation: number
}

export function attachmentUrl(guildId: string, channelId: string, id: number) {
    return `https://media.discordapp.net/attachments/${guildId}/${channelId}/${id}.png`
}

export function readableDimensions({ width, height, orientation }: Dimensions) {
    return (orientation || 0) >= 5
      ? `${height}px x ${width}px`
      : `${width}px x ${height}px`
}

export function readableSize(bytes: number) {
    return bytes === 0 ? '0 B' :
    `${(bytes / Math.pow(1024, Math.floor(Math.log(bytes) / Math.log(1024)))).toFixed(2)} ${'KMGTPE'.charAt(Math.floor(Math.log(bytes) / Math.log(1024)))}B`;
}

export function formatMemoryUsage(bytes: number) {
	const gigaBytes = bytes / 1024 ** 3;
	if (gigaBytes >= 1) {
		return `[${gigaBytes.toFixed(3)} GB]`;
	}

	const megaBytes = bytes / 1024 ** 2;
	if (megaBytes >= 1) {
		return `[${megaBytes.toFixed(2)} MB]`;
	}

	const kiloBytes = bytes / 1024;
	if (kiloBytes >= 1) {
		return `[${kiloBytes.toFixed(2)} KB]`;
	}

	return `[${bytes.toFixed(2)} B]`;
}