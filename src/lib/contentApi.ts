import axios from 'axios';

/**
 * Origin of the Node/Express content backend.
 * Dev: `/content` (proxied to localhost:3000 by Vite — see vite.config.ts).
 * Prod: absolute URL of the separate host (VITE_CONTENT_API_ORIGIN).
 */
export const CONTENT_API_ORIGIN = import.meta.env.VITE_CONTENT_API_ORIGIN || '';

export const contentApi = axios.create({
	baseURL: `${CONTENT_API_ORIGIN}/api`,
	timeout: 15000,
	withCredentials: true,
	headers: { Accept: 'application/json' },
});

/** Resolve an uploaded file path (e.g. `/uploads/x.png`) against the content origin. */
export function contentAssetUrl(path: string | null | undefined): string {
	if (!path) return '';
	if (/^https?:\/\//i.test(path)) return path;
	return `${CONTENT_API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Resolve a relative API path (e.g. `/public/posts`) against the content origin. */
export function contentApiUrl(path: string): string {
	return `${CONTENT_API_ORIGIN}/api${path.startsWith('/') ? path : `/${path}`}`;
}
