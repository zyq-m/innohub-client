export type VideoKind = 'file' | 'youtube' | 'vimeo' | 'link';

export interface ResolvedVideo {
	kind: VideoKind;
	src: string;
	embedSrc?: string;
}

function youtubeId(url: string): string | null {
	try {
		const u = new URL(url);
		if (u.hostname.includes('youtu.be')) return u.pathname.replace(/^\//, '') || null;
		if (u.hostname.includes('youtube.com')) {
			if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
			if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
			return u.searchParams.get('v');
		}
	} catch {
		return null;
	}
	return null;
}

function vimeoId(url: string): string | null {
	try {
		const u = new URL(url);
		if (!u.hostname.includes('vimeo.com')) return null;
		const match = u.pathname.match(/\/(\d+)/);
		return match?.[1] ?? null;
	} catch {
		return null;
	}
}

export function resolveVideo(url: string | null | undefined): ResolvedVideo | null {
	if (!url) return null;
	const src = url.trim();
	if (!src) return null;

	const yt = youtubeId(src);
	if (yt) {
		return {
			kind: 'youtube',
			src,
			embedSrc: `https://www.youtube.com/embed/${encodeURIComponent(yt)}?rel=0&modestbranding=1`,
		};
	}

	const vm = vimeoId(src);
	if (vm) {
		return {
			kind: 'vimeo',
			src,
			embedSrc: `https://player.vimeo.com/video/${encodeURIComponent(vm)}`,
		};
	}

	const clean = src.split('?')[0]?.toLowerCase() ?? '';
	if (/\.(mp4|webm|ogg|mov|m4v)(\/)?$/i.test(clean)) {
		return { kind: 'file', src };
	}

	if (/^https?:\/\//i.test(src)) {
		// Default to file for relative-path API URLs (e.g. /api/uploads/x.mp4) or unknown external URLs.
		if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i.test(src)) {
			// Heuristic: if it came through assetUrl (/api/... or /unigrant_rest/...), treat as direct file.
			if (/\/uploads\//i.test(src) || /\.(mp4|webm|ogg|mov|m4v)/i.test(src)) return { kind: 'file', src };
			return { kind: 'link', src };
		}
	}

	return { kind: 'file', src };
}
