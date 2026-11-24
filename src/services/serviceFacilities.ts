import { contentApi } from '../lib/contentApi';
import type { ServiceFacility } from '../data/serviceFacilities';

export interface ServiceFacilityListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ServiceFacilityListResult {
	rows: ServiceFacility[];
	meta: ServiceFacilityListMeta;
}

export interface ServiceFacilityListParams {
	q?: string;
	category?: string;
	featured?: boolean;
	page?: number;
	limit?: number;
}

export async function fetchServiceFacilities(
	params: ServiceFacilityListParams = {},
): Promise<ServiceFacilityListResult> {
	const query: Record<string, string | number | boolean> = {
		page: params.page ?? 1,
		limit: params.limit ?? 12,
	};
	if (params.q?.trim()) query.search = params.q.trim();
	if (params.category?.trim()) query.category = params.category.trim();
	if (params.featured !== undefined) query.featured = params.featured;

	const { data } = await contentApi.get<{ data: ServiceFacility[]; meta: ServiceFacilityListMeta }>(
		'/public/services',
		{ params: query },
	);

	return {
		rows: data.data ?? [],
		meta: data.meta ?? { total: 0, page: 1, limit: query.limit as number, totalPages: 1 },
	};
}

export async function fetchServiceFacilityBySlug(slug: string): Promise<ServiceFacility> {
	const { data } = await contentApi.get<{ data: ServiceFacility }>(
		`/public/services/${encodeURIComponent(slug)}`,
	);
	return data.data;
}
