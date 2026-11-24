import { contentApi } from '../lib/contentApi';
import type { CommunityNews } from '../data/communityNews';

export interface CommunityNewsListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CommunityNewsListResult {
	rows: CommunityNews[];
	meta: CommunityNewsListMeta;
}

export interface CommunityNewsListParams {
	q?: string;
	type?: string;
	level?: string;
	featured?: boolean;
	page?: number;
	limit?: number;
}

export async function fetchCommunityNews(
	params: CommunityNewsListParams = {},
): Promise<CommunityNewsListResult> {
	const query: Record<string, string | number | boolean> = {
		page: params.page ?? 1,
		limit: params.limit ?? 12,
	};
	if (params.q?.trim()) query.search = params.q.trim();
	if (params.type?.trim()) query.type = params.type.trim();
	if (params.level?.trim()) query.level = params.level.trim();
	if (params.featured !== undefined) query.featured = params.featured;

	const { data } = await contentApi.get<{ data: CommunityNews[]; meta: CommunityNewsListMeta }>(
		'/public/community-news',
		{ params: query },
	);

	return {
		rows: data.data ?? [],
		meta: data.meta ?? { total: 0, page: 1, limit: query.limit as number, totalPages: 1 },
	};
}

export async function fetchCommunityNewsBySlug(slug: string): Promise<CommunityNews> {
	const { data } = await contentApi.get<{ data: CommunityNews }>(
		`/public/community-news/${encodeURIComponent(slug)}`,
	);
	return data.data;
}
