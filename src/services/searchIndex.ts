import type { Centre } from "../data/centres";
import type { CommunityNews } from "../data/communityNews";
import type { CommunityProduct } from "../data/communityProducts";
import { mapProduct, type Product } from "../data/products";
import type { ResearchGroup } from "../data/researchGroups";
import type { ServiceFacility } from "../data/serviceFacilities";
import type { SpinOff } from "../data/spinoffs";
import type { SuccessStory } from "../data/successStories";
import { api } from "../lib/api";
import { fetchCentres } from "./centres";
import { fetchCommunityNews } from "./communityNews";
import { fetchCommunityProducts } from "./communityProducts";
import { fetchResearchGroups } from "./researchGroups";
import { fetchServiceFacilities } from "./serviceFacilities";
import { fetchSpinOffs } from "./spinoffs";
import { fetchSuccessStories } from "./successStories";

export interface SearchIndex {
	products: Product[];
	services: ServiceFacility[];
	centres: Centre[];
	researchGroups: ResearchGroup[];
	stories: SuccessStory[];
	communityProducts: CommunityProduct[];
	communityNews: CommunityNews[];
	spinOffs: SpinOff[];
	productCapped: boolean;
	errors: Partial<Record<keyof SearchIndex, string>>;
	loadedAt: number;
}

const PRODUCT_PAGE_SIZE = 100;
const PRODUCT_CAP = 1000;
const CONTENT_PAGE_SIZE = 100;

let cache: SearchIndex | null = null;
let inflight: Promise<SearchIndex> | null = null;

async function fetchAllProducts(): Promise<{
	products: Product[];
	capped: boolean;
}> {
	const products: Product[] = [];
	let page = 1;
	let rowsNumber = Infinity;
	while (products.length < rowsNumber && products.length < PRODUCT_CAP) {
		const { data } = await api.get<{
			products?: unknown[];
			pagination?: { rowsNumber?: number };
		}>("/ip/product", { params: { rowsPerPage: PRODUCT_PAGE_SIZE, page } });
		const batch = (data.products ?? []).map((raw) =>
			mapProduct(raw as Parameters<typeof mapProduct>[0]),
		);
		products.push(...batch);
		rowsNumber = data.pagination?.rowsNumber ?? products.length;
		if (batch.length === 0) break;
		page += 1;
	}
	return {
		products: products.slice(0, PRODUCT_CAP),
		capped: rowsNumber > PRODUCT_CAP,
	};
}

async function fetchAllPages<T>(
	fetchPage: (
		page: number,
		limit: number,
	) => Promise<{ rows: T[]; meta: { total: number } }>,
): Promise<T[]> {
	const rows: T[] = [];
	let page = 1;
	let total = Infinity;
	while (rows.length < total) {
		const result = await fetchPage(page, CONTENT_PAGE_SIZE);
		rows.push(...result.rows);
		total = result.meta.total ?? rows.length;
		if (result.rows.length === 0) break;
		page += 1;
		if (page > 20) break; // safety guard
	}
	return rows;
}

export async function loadSearchIndex(force = false): Promise<SearchIndex> {
	if (!force && cache) return cache;
	if (!force && inflight) return inflight;

	inflight = (async () => {
		const errors: SearchIndex["errors"] = {};
		const [
			productsRes,
			servicesRes,
			centresRes,
			researchRes,
			storiesRes,
			communityRes,
			newsRes,
			spinOffsRes,
		] = await Promise.allSettled([
			fetchAllProducts(),
			fetchAllPages((page, limit) => fetchServiceFacilities({ page, limit })),
			fetchAllPages((page, limit) => fetchCentres({ page, limit })),
			fetchAllPages((page, limit) => fetchResearchGroups({ page, limit })),
			fetchAllPages((page, limit) => fetchSuccessStories({ page, limit })),
			fetchAllPages((page, limit) => fetchCommunityProducts({ page, limit })),
			fetchAllPages((page, limit) => fetchCommunityNews({ page, limit })),
			fetchAllPages((page, limit) => fetchSpinOffs({ page, limit })),
		]);

		const index: SearchIndex = {
			products:
				productsRes.status === "fulfilled" ? productsRes.value.products : [],
			productCapped:
				productsRes.status === "fulfilled" ? productsRes.value.capped : false,
			services: servicesRes.status === "fulfilled" ? servicesRes.value : [],
			centres: centresRes.status === "fulfilled" ? centresRes.value : [],
			researchGroups:
				researchRes.status === "fulfilled" ? researchRes.value : [],
			stories: storiesRes.status === "fulfilled" ? storiesRes.value : [],
			communityProducts:
				communityRes.status === "fulfilled" ? communityRes.value : [],
			communityNews: newsRes.status === "fulfilled" ? newsRes.value : [],
			spinOffs: spinOffsRes.status === "fulfilled" ? spinOffsRes.value : [],
			errors: {},
			loadedAt: Date.now(),
		};

		if (productsRes.status === "rejected")
			errors.products = "Products could not be loaded.";
		if (servicesRes.status === "rejected")
			errors.services = "Services could not be loaded.";
		if (centresRes.status === "rejected")
			errors.centres = "CoE / Institutes could not be loaded.";
		if (researchRes.status === "rejected")
			errors.researchGroups = "Research groups could not be loaded.";
		if (storiesRes.status === "rejected")
			errors.stories = "Success stories could not be loaded.";
		if (communityRes.status === "rejected")
			errors.communityProducts =
				"Community / industry product pnnovation could not be loaded.";
		if (newsRes.status === "rejected")
			errors.communityNews = "Community news could not be loaded.";
		if (spinOffsRes.status === "rejected")
			errors.spinOffs = "Spin-offs could not be loaded.";
		index.errors = errors;

		cache = index;
		return index;
	})();

	try {
		return await inflight;
	} finally {
		inflight = null;
	}
}

export function clearSearchIndex(): void {
	cache = null;
	inflight = null;
}
