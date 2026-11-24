import {
	mapFaculty,
	mapProduct,
	type Faculty,
	type Pagination,
	type Product,
	type RawProduct,
} from "../data/products";
import { api } from "../lib/api";

export interface ProductFilters {
	name: string;
	researcher_name: string;
	category: string;
	faculty: string;
	year: string;
	spinOff: string;
	trl_min: number;
	trl_max: number;
	page: number;
	rowsPerPage: number;
}

export interface ProductListResponse {
	products: Product[];
	pagination: Pagination;
	faculty: Faculty[];
}

export const emptyPagination: Pagination = {
	rowsNumber: 0,
	rowsPerPage: 10,
	page: 1,
};

export function buildParams(
	filters: ProductFilters,
): Record<string, string | number> {
	const params: Record<string, string | number> = {
		page: filters.page,
		rowsPerPage: filters.rowsPerPage,
		trl_min: filters.trl_min,
		trl_max: filters.trl_max,
	};

	if (filters.name.trim()) params.name = filters.name.trim();
	if (filters.researcher_name.trim())
		params.researcher_name = filters.researcher_name.trim();
	if (filters.category) params.category = filters.category;
	if (filters.faculty) params.faculty = filters.faculty;
	if (filters.year) params.year = filters.year;
	if (filters.spinOff === "1") params.spinOff = "1";

	return params;
}

export async function fetchProducts(
	filters: ProductFilters,
	signal?: AbortSignal,
): Promise<ProductListResponse> {
	const { data } = await api.get<{
		products?: RawProduct[];
		pagination?: Pagination;
		faculty?: { a019kbahagian: string; a019singkatan: string }[];
	}>("/ip/product", { params: buildParams(filters), signal });

	return {
		products: (data.products ?? []).map(mapProduct),
		pagination: data.pagination ?? {
			...emptyPagination,
			rowsNumber: (data.products ?? []).length,
		},
		faculty: mapFaculty(data.faculty),
	};
}

export async function fetchProductById(
	id: string,
	signal?: AbortSignal,
): Promise<Product> {
	const { data } = await api.get<RawProduct>(
		`/ip/product/${encodeURIComponent(id)}`,
		{ signal },
	);
	return mapProduct(data);
}
