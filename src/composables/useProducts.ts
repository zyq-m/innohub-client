import axios from "axios";
import { computed, reactive, watch } from "vue";
import type { Faculty, Pagination, Product } from "../data/products";
import {
	emptyPagination,
	fetchProducts,
	type ProductFilters,
} from "../services/products";

const DEBOUNCE_MS = 300;
const ROWS_PER_PAGE = 8;
const TRL_MIN = 1;
const TRL_MAX = 9;
const DEFAULT_TRL_MIN = 5;
const DEFAULT_TRL_MAX = 9;

const state = reactive({
	products: [] as Product[],
	pagination: { ...emptyPagination } as Pagination,
	faculty: [] as Faculty[],
	loading: false,
	loadingMore: false,
	error: "",
	loaded: false,
	rowsPerPage: ROWS_PER_PAGE,
});

const filters = reactive<ProductFilters>({
	name: "",
	researcher_name: "",
	category: "",
	faculty: "",
	year: "",
	spinOff: "",
	trl_min: DEFAULT_TRL_MIN,
	trl_max: DEFAULT_TRL_MAX,
	page: 1,
	rowsPerPage: ROWS_PER_PAGE,
});

let controller: AbortController | null = null;
let sequence = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

async function request(page: number, append: boolean): Promise<void> {
	const id = ++sequence;
	controller?.abort();
	controller = new AbortController();

	if (append) state.loadingMore = true;
	else state.loading = true;
	state.error = "";

	try {
		const result = await fetchProducts(
			{ ...filters, page, rowsPerPage: state.rowsPerPage },
			controller.signal,
		);
		if (id !== sequence) return;
		state.products = append
			? [...state.products, ...result.products]
			: result.products;
		state.pagination = result.pagination;
		if (result.faculty.length) state.faculty = result.faculty;
		state.loaded = true;
	} catch (error) {
		if (axios.isCancel(error) || id !== sequence) return;
		state.error =
			"Innovations could not be loaded right now. Please try again.";
		if (!append) state.products = [];
	} finally {
		if (id === sequence) {
			state.loading = false;
			state.loadingMore = false;
		}
	}
}

function load(): void {
	filters.page = 1;
	void request(1, false);
}

function loadMore(): void {
	if (state.loading || state.loadingMore || !hasMore.value) return;
	filters.page = state.pagination.page + 1;
	void request(filters.page, true);
}

function reload(): void {
	void request(filters.page, state.products.length > 0);
}

function resetFilters(): void {
	Object.assign(filters, {
		name: "",
		researcher_name: "",
		category: "",
		faculty: "",
		year: "",
		spinOff: "",
		trl_min: DEFAULT_TRL_MIN,
		trl_max: DEFAULT_TRL_MAX,
	});
	load();
}

function setFilters(patch: Partial<ProductFilters>): void {
	Object.assign(filters, patch);
}

function clampTrl(value: number): number {
	return Math.min(TRL_MAX, Math.max(TRL_MIN, Math.round(value)));
}

function setTrlMin(value: number): void {
	const min = clampTrl(value);
	setFilters({
		trl_min: min,
		trl_max: Math.max(min, filters.trl_max),
	});
}

function setTrlMax(value: number): void {
	const max = clampTrl(value);
	setFilters({
		trl_max: max,
		trl_min: Math.min(max, filters.trl_min),
	});
}

/** Home shows a single row of 4; the catalogue paginates in pages of 10. */
function setPageSize(rows: number): void {
	state.rowsPerPage = rows;
	load();
}

watch(
	() => [filters.name, filters.researcher_name],
	() => {
		clearTimeout(timer);
		timer = setTimeout(load, DEBOUNCE_MS);
	},
);

watch(
	() => [
		filters.category,
		filters.faculty,
		filters.year,
		filters.spinOff,
		filters.trl_min,
		filters.trl_max,
	],
	() => {
		clearTimeout(timer);
		load();
	},
);

const total = computed(() => state.pagination.rowsNumber);
const hasMore = computed(
	() => state.products.length < state.pagination.rowsNumber,
);
const isFiltered = computed(() =>
	Boolean(
		filters.name ||
		filters.researcher_name ||
		filters.category ||
		filters.faculty ||
		filters.year ||
		filters.spinOff ||
		filters.trl_min !== DEFAULT_TRL_MIN ||
		filters.trl_max !== DEFAULT_TRL_MAX,
	),
);
const visibleProducts = computed(() =>
	state.products.filter(
		(item) =>
			item.trl === null ||
			(item.trl >= filters.trl_min && item.trl <= filters.trl_max),
	),
);

export function useProducts() {
	return {
		state,
		filters,
		total,
		hasMore,
		isFiltered,
		visibleProducts,
		load,
		loadMore,
		reload,
		resetFilters,
		setFilters,
		setTrlMin,
		setTrlMax,
		setPageSize,
	};
}

export { DEFAULT_TRL_MAX, DEFAULT_TRL_MIN, TRL_MAX, TRL_MIN };
