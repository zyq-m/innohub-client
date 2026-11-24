import { contentApi } from '../lib/contentApi';
import type { CommunityProduct } from '../data/communityProducts';

export interface CommunityProductListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CommunityProductListResult {
	rows: CommunityProduct[];
	meta: CommunityProductListMeta;
}

export interface CommunityProductListParams {
	q?: string;
	featured?: boolean;
	page?: number;
	limit?: number;
}

export async function fetchCommunityProducts(
	params: CommunityProductListParams = {},
): Promise<CommunityProductListResult> {
	const query: Record<string, string | number | boolean> = {
		page: params.page ?? 1,
		limit: params.limit ?? 12,
	};
	if (params.q?.trim()) query.search = params.q.trim();
	if (params.featured !== undefined) query.featured = params.featured;

	const { data } = await contentApi.get<{ data: CommunityProduct[]; meta: CommunityProductListMeta }>(
		'/public/community-products',
		{ params: query },
	);

	return {
		rows: data.data ?? [],
		meta: data.meta ?? { total: 0, page: 1, limit: query.limit as number, totalPages: 1 },
	};
}

export async function fetchCommunityProductBySlug(slug: string): Promise<CommunityProduct> {
	const { data } = await contentApi.get<{ data: CommunityProduct }>(
		`/public/community-products/${encodeURIComponent(slug)}`,
	);
	return data.data;
}
