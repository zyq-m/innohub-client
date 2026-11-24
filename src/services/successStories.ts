import { contentApi } from '../lib/contentApi';
import type { SuccessStory } from '../data/successStories';

export interface SuccessStoryListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface SuccessStoryListResult {
	rows: SuccessStory[];
	meta: SuccessStoryListMeta;
}

export interface SuccessStoryListParams {
	q?: string;
	type?: string;
	level?: string;
	featured?: boolean;
	page?: number;
	limit?: number;
}

export async function fetchSuccessStories(
	params: SuccessStoryListParams = {},
): Promise<SuccessStoryListResult> {
	const query: Record<string, string | number | boolean> = {
		page: params.page ?? 1,
		limit: params.limit ?? 12,
	};
	if (params.q?.trim()) query.search = params.q.trim();
	if (params.type?.trim()) query.type = params.type.trim();
	if (params.level?.trim()) query.level = params.level.trim();
	if (params.featured !== undefined) query.featured = params.featured;

	const { data } = await contentApi.get<{ data: SuccessStory[]; meta: SuccessStoryListMeta }>(
		'/public/success-stories',
		{ params: query },
	);

	return {
		rows: data.data ?? [],
		meta: data.meta ?? { total: 0, page: 1, limit: query.limit as number, totalPages: 1 },
	};
}

export async function fetchSuccessStoryBySlug(slug: string): Promise<SuccessStory> {
	const { data } = await contentApi.get<{ data: SuccessStory }>(
		`/public/success-stories/${encodeURIComponent(slug)}`,
	);
	return data.data;
}
