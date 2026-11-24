import { contentApi } from '../lib/contentApi';
import type { ResearchGroup } from '../data/researchGroups';

export interface ResearchGroupListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ResearchGroupListResult {
	rows: ResearchGroup[];
	meta: ResearchGroupListMeta;
}

export interface ResearchGroupListParams {
	q?: string;
	type?: string;
	cluster?: string;
	featured?: boolean;
	page?: number;
	limit?: number;
}

export async function fetchResearchGroups(
	params: ResearchGroupListParams = {},
): Promise<ResearchGroupListResult> {
	const query: Record<string, string | number | boolean> = {
		page: params.page ?? 1,
		limit: params.limit ?? 100,
	};
	if (params.q?.trim()) query.search = params.q.trim();
	if (params.type?.trim()) query.type = params.type.trim();
	if (params.cluster?.trim()) query.cluster = params.cluster.trim();
	if (params.featured !== undefined) query.featured = params.featured;

	const { data } = await contentApi.get<{ data: ResearchGroup[]; meta: ResearchGroupListMeta }>(
		'/public/research-groups',
		{ params: query },
	);

	return {
		rows: data.data ?? [],
		meta: data.meta ?? { total: 0, page: 1, limit: query.limit as number, totalPages: 1 },
	};
}

export async function fetchResearchGroupBySlug(slug: string): Promise<ResearchGroup> {
	const { data } = await contentApi.get<{ data: ResearchGroup }>(
		`/public/research-groups/${encodeURIComponent(slug)}`,
	);
	return data.data;
}
