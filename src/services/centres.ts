import { contentApi } from '../lib/contentApi';
import type { Centre } from '../data/centres';

export interface CentreListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CentreListResult {
	rows: Centre[];
	meta: CentreListMeta;
}

export interface CentreListParams {
	q?: string;
	featured?: boolean;
	page?: number;
	limit?: number;
}

export async function fetchCentres(params: CentreListParams = {}): Promise<CentreListResult> {
	const query: Record<string, string | number | boolean> = {
		page: params.page ?? 1,
		limit: params.limit ?? 12,
	};
	if (params.q?.trim()) query.search = params.q.trim();
	if (params.featured !== undefined) query.featured = params.featured;

	const { data } = await contentApi.get<{ data: Centre[]; meta: CentreListMeta }>(
		'/public/centres',
		{ params: query },
	);

	return {
		rows: data.data ?? [],
		meta: data.meta ?? { total: 0, page: 1, limit: query.limit as number, totalPages: 1 },
	};
}

export async function fetchCentreBySlug(slug: string): Promise<Centre> {
	const { data } = await contentApi.get<{ data: Centre }>(
		`/public/centres/${encodeURIComponent(slug)}`,
	);
	return data.data;
}
