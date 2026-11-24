import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = axios.create({
	baseURL: API_BASE,
	timeout: 15000,
	headers: { Accept: 'application/json' },
});

export function assetUrl(file: string | null | undefined): string {
	if (!file) return '';
	if (/^https?:\/\//i.test(file)) return file;
	const path = file.replace(/^\/?(api\/)+/i, '/');
	return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
