import { contentApi } from '../lib/contentApi';
import type { SpinOff } from '../data/spinoffs';

export interface SpinOffListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface SpinOffListResult {
	rows: SpinOff[];
	meta: SpinOffListMeta;
}

export interface SpinOffListParams {
	q?: string;
	featured?: boolean;
	page?: number;
	limit?: number;
}

export async function fetchSpinOffs(params: SpinOffListParams = {}): Promise<SpinOffListResult> {
	const query: Record<string, string | number | boolean> = {
		page: params.page ?? 1,
		limit: params.limit ?? 12,
	};
	if (params.q?.trim()) query.search = params.q.trim();
	if (params.featured !== undefined) query.featured = params.featured;

	const { data } = await contentApi.get<{ data: SpinOff[]; meta: SpinOffListMeta }>(
		'/public/spin-offs',
		{ params: query },
	);

	return {
		rows: data.data ?? [],
		meta: data.meta ?? { total: 0, page: 1, limit: query.limit as number, totalPages: 1 },
	};
}

export async function fetchSpinOffBySlug(slug: string): Promise<SpinOff> {
	const { data } = await contentApi.get<{ data: SpinOff }>(
		`/public/spin-offs/${encodeURIComponent(slug)}`,
	);
	return data.data;
}
