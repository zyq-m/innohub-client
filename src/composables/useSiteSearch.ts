import { computed, ref } from "vue";
import type { Centre } from "../data/centres";
import { centreCover } from "../data/centres";
import type { CommunityNews } from "../data/communityNews";
import { communityNewsCover } from "../data/communityNews";
import type { CommunityProduct } from "../data/communityProducts";
import { communityProductCover } from "../data/communityProducts";
import type { Product } from "../data/products";
import type { ResearchGroup } from "../data/researchGroups";
import { researchGroupCover } from "../data/researchGroups";
import {
	GROUP_LABELS,
	GROUP_ORDER,
	excerpt,
	scoreFields,
	type SearchGroup,
	type SearchGroupResult,
	type SearchHit,
	type WeightedField,
} from "../data/search";
import type { ServiceFacility } from "../data/serviceFacilities";
import { serviceFacilityCover } from "../data/serviceFacilities";
import type { SpinOff } from "../data/spinoffs";
import { spinOffCover } from "../data/spinoffs";
import type { SuccessStory } from "../data/successStories";
import {
	formatAchievementDate,
	successStoryCover,
} from "../data/successStories";
import {
	clearSearchIndex,
	loadSearchIndex,
	type SearchIndex,
} from "../services/searchIndex";

const index = ref<SearchIndex | null>(null);
const loading = ref(false);
const loadError = ref("");

function toHit(
	hit: Omit<SearchHit, "score">,
	query: string,
	fields: WeightedField[],
	boost = 0,
): SearchHit | null {
	const score = scoreFields(query, fields) + boost;
	if (score <= 0) return null;
	return { ...hit, score };
}

function productHits(products: Product[], query: string): SearchHit[] {
	return products
		.map((p) =>
			toHit(
				{
					id: `product-${p.id}`,
					group: "products",
					title: p.title,
					subtitle: [p.researcher, p.facultyCode].filter(Boolean).join(" · "),
					excerpt:
						p.summary ||
						excerpt(
							[p.description, p.innovation, p.application]
								.filter(Boolean)
								.join(" "),
						),
					image: p.image,
					badge: p.typeLabel || "Product",
					path: `/innovations/${p.id}`,
				},
				query,
				[
					{ value: p.title, weight: 5 },
					{ value: p.researcher, weight: 4 },
					{ value: p.ipNo, weight: 3 },
					{ value: p.categoryLabel, weight: 2 },
					{ value: p.facultyCode, weight: 2 },
					{ value: p.typeLabel, weight: 2 },
					{ value: p.description, weight: 1 },
					{ value: p.innovation, weight: 1 },
					{ value: p.requirement, weight: 1 },
					{ value: p.application, weight: 1 },
					{ value: p.benefits, weight: 1 },
				],
				(p.trl ?? 0) * 0.5,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function researcherHits(products: Product[], query: string): SearchHit[] {
	const map = new Map<
		string,
		{
			name: string;
			no: string;
			faculties: Set<string>;
			count: number;
			image: string;
		}
	>();
	for (const p of products) {
		const name = p.researcher.trim();
		if (!name) continue;
		const key = p.researcherNo || name.toLowerCase();
		const existing = map.get(key);
		if (existing) {
			existing.count += 1;
			if (p.facultyCode) existing.faculties.add(p.facultyCode);
			if (!existing.image && p.image) existing.image = p.image;
		} else {
			map.set(key, {
				name,
				no: p.researcherNo,
				faculties: new Set(p.facultyCode ? [p.facultyCode] : []),
				count: 1,
				image: p.image,
			});
		}
	}
	return [...map.values()]
		.map((r) =>
			toHit(
				{
					id: `researcher-${r.no || r.name}`,
					group: "researchers",
					title: r.name,
					subtitle: [...r.faculties].join(", "),
					excerpt: `${r.count} innovation${r.count === 1 ? "" : "s"}${r.no ? ` · Staff no. ${r.no}` : ""}`,
					image: r.image,
					badge: "Researcher",
					path: `/innovations?researcher_name=${encodeURIComponent(r.name)}`,
				},
				query,
				[
					{ value: r.name, weight: 5 },
					{ value: r.no, weight: 4 },
					{ value: [...r.faculties].join(" "), weight: 2 },
				],
				r.count * 0.2,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function serviceHits(items: ServiceFacility[], query: string): SearchHit[] {
	return items
		.map((s) =>
			toHit(
				{
					id: `service-${s.id}`,
					group: "services",
					title: s.serviceName,
					subtitle: [s.category, s.providerUnit].filter(Boolean).join(" · "),
					excerpt: excerpt(s.description || s.expertise || ""),
					image: serviceFacilityCover(s),
					badge: s.category || "Service",
					path: `/services/${s.slug}`,
				},
				query,
				[
					{ value: s.serviceName, weight: 5 },
					{ value: s.category, weight: 3 },
					{ value: s.providerUnit, weight: 3 },
					{ value: s.description, weight: 1 },
					{ value: s.expertise, weight: 1 },
					{ value: s.clientTypes, weight: 1 },
					{ value: s.scope, weight: 1 },
					{ value: s.location, weight: 1 },
				],
				s.featured ? 2 : 0,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function centreHits(items: Centre[], query: string): SearchHit[] {
	return items
		.map((c) =>
			toHit(
				{
					id: `centre-${c.id}`,
					group: "centres",
					title: c.officialName,
					subtitle: c.director || c.contactEmail || "",
					excerpt: excerpt(c.expertise || c.mission || ""),
					image: centreCover(c),
					badge: "CoE / Institute",
					path: `/centres/${c.slug}`,
				},
				query,
				[
					{ value: c.officialName, weight: 5 },
					{ value: c.expertise, weight: 3 },
					{ value: c.director, weight: 2 },
					{ value: c.mission, weight: 1 },
					{ value: c.services, weight: 1 },
					{ value: c.facilities, weight: 1 },
					{ value: c.projects, weight: 1 },
					{ value: c.outcomes, weight: 1 },
					{ value: c.partners, weight: 1 },
				],
				c.featured ? 2 : 0,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function researchHits(items: ResearchGroup[], query: string): SearchHit[] {
	return items
		.map((r) =>
			toHit(
				{
					id: `research-${r.id}`,
					group: "research",
					title: r.groupName,
					subtitle: [r.groupType, r.parentCluster || r.faculty]
						.filter(Boolean)
						.join(" · "),
					excerpt: excerpt(r.focus || r.expertise || ""),
					image: researchGroupCover(r),
					badge: r.groupType || "Research group",
					path: `/research-partners/${r.slug}`,
				},
				query,
				[
					{ value: r.groupName, weight: 5 },
					{ value: r.groupType, weight: 3 },
					{ value: r.parentCluster, weight: 3 },
					{ value: r.faculty, weight: 2 },
					{ value: r.leads, weight: 2 },
					{ value: r.projects, weight: 2 },
					{ value: r.outcomes, weight: 2 },
					{ value: r.expertise, weight: 1 },
					{ value: r.focus, weight: 1 },
					{ value: r.facilities, weight: 1 },
					{ value: r.collaboration, weight: 1 },
				],
				r.featured ? 2 : 0,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function storyHits(items: SuccessStory[], query: string): SearchHit[] {
	return items
		.map((s) =>
			toHit(
				{
					id: `story-${s.id}`,
					group: "stories",
					title: s.achievementTitle,
					subtitle: [formatAchievementDate(s.achievementDate), s.team]
						.filter(Boolean)
						.join(" · "),
					excerpt: excerpt(s.summary || s.impact || ""),
					image: successStoryCover(s),
					badge: s.achievementType || "Success story",
					path: `/stories/${s.slug}`,
				},
				query,
				[
					{ value: s.achievementTitle, weight: 5 },
					{ value: s.team, weight: 4 },
					{ value: s.achievementType, weight: 2 },
					{ value: s.level, weight: 2 },
					{ value: s.summary, weight: 1 },
					{ value: s.impact, weight: 1 },
				],
				s.featured ? 2 : 0,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function communityProductHits(
	items: CommunityProduct[],
	query: string,
): SearchHit[] {
	return items
		.map((p) =>
			toHit(
				{
					id: `community-${p.id}`,
					group: "community",
					title: p.productName,
					subtitle: p.innovator || p.developmentStatus || "",
					excerpt: excerpt(p.description || p.communityProblem || ""),
					image: communityProductCover(p),
					badge:
						p.developmentStatus || "Community / Industry Product Innovation",
					path: `/community/${p.slug}`,
				},
				query,
				[
					{ value: p.productName, weight: 5 },
					{ value: p.innovator, weight: 3 },
					{ value: p.description, weight: 1 },
					{ value: p.communityProblem, weight: 1 },
					{ value: p.beneficiaries, weight: 1 },
					{ value: p.impact, weight: 1 },
					{ value: p.partners, weight: 1 },
				],
				p.featured ? 2 : 0,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function communityNewsHits(items: CommunityNews[], query: string): SearchHit[] {
	return items
		.map((n) =>
			toHit(
				{
					id: `news-${n.id}`,
					group: "news",
					title: n.newsTitle,
					subtitle: [n.activityLocation, n.organiser]
						.filter(Boolean)
						.join(" · "),
					excerpt: excerpt(n.summary || n.objectives || ""),
					image: communityNewsCover(n),
					badge: n.topic || n.level || "Community news",
					path: `/community/news/${n.slug}`,
				},
				query,
				[
					{ value: n.newsTitle, weight: 5 },
					{ value: n.organiser, weight: 3 },
					{ value: n.activityLocation, weight: 3 },
					{ value: n.topic, weight: 2 },
					{ value: n.level, weight: 2 },
					{ value: n.summary, weight: 1 },
					{ value: n.objectives, weight: 1 },
					{ value: n.beneficiaries, weight: 1 },
					{ value: n.quote, weight: 1 },
				],
				n.featured ? 2 : 0,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

function spinOffHits(items: SpinOff[], query: string): SearchHit[] {
	return items
		.map((s) =>
			toHit(
				{
					id: `spinoff-${s.id}`,
					group: "spin-offs",
					title: s.companyName,
					subtitle: [
						s.technologyField,
						s.yearEstablished ? String(s.yearEstablished) : "",
					]
						.filter(Boolean)
						.join(" · "),
					excerpt: excerpt(s.productSolutions || s.marketProblem || ""),
					image: spinOffCover(s),
					badge: s.technologyField || "Spin-off",
					path: `/spin-offs/${s.slug}`,
				},
				query,
				[
					{ value: s.companyName, weight: 5 },
					{ value: s.technologyField, weight: 3 },
					{ value: s.productSolutions, weight: 1 },
					{ value: s.marketProblem, weight: 1 },
					{ value: s.targetMarket, weight: 1 },
					{ value: s.traction, weight: 1 },
					{ value: s.ipStatus, weight: 1 },
					{ value: s.collaborationContact, weight: 1 },
				],
				s.featured ? 2 : 0,
			),
		)
		.filter((h): h is SearchHit => h !== null)
		.sort((a, b) => b.score - a.score);
}

export function buildSearchGroups(
	idx: SearchIndex,
	query: string,
): SearchGroupResult[] {
	const q = query.trim();
	if (!q) return [];
	const byGroup: Record<SearchGroup, SearchHit[]> = {
		products: productHits(idx.products, q),
		researchers: researcherHits(idx.products, q),
		services: serviceHits(idx.services, q),
		centres: centreHits(idx.centres, q),
		research: researchHits(idx.researchGroups, q),
		stories: storyHits(idx.stories, q),
		community: communityProductHits(idx.communityProducts, q),
		news: communityNewsHits(idx.communityNews, q),
		"spin-offs": spinOffHits(idx.spinOffs, q),
	};

	const viewAll: Partial<Record<SearchGroup, string>> = {
		services: `/services?q=${encodeURIComponent(q)}`,
		centres: `/centres?q=${encodeURIComponent(q)}`,
		research: `/research-partners?q=${encodeURIComponent(q)}`,
		stories: `/stories?q=${encodeURIComponent(q)}`,
		community: `/community?q=${encodeURIComponent(q)}`,
		news: `/community/news?q=${encodeURIComponent(q)}`,
		"spin-offs": `/spin-offs?q=${encodeURIComponent(q)}`,
	};

	return GROUP_ORDER.map((group) => ({
		group,
		label: GROUP_LABELS[group],
		hits: byGroup[group],
		total: byGroup[group].length,
		viewAllPath: viewAll[group],
	})).filter((g) => g.total > 0);
}

export function useSiteSearch() {
	async function ensureIndex(force = false) {
		loading.value = true;
		loadError.value = "";
		try {
			index.value = await loadSearchIndex(force);
		} catch (error) {
			loadError.value =
				error instanceof Error
					? error.message
					: "Search index could not be loaded.";
		} finally {
			loading.value = false;
		}
	}

	function refresh() {
		clearSearchIndex();
		return ensureIndex(true);
	}

	const errors = computed(
		() => Object.values(index.value?.errors ?? {}).filter(Boolean) as string[],
	);
	const productCapped = computed(() => index.value?.productCapped ?? false);

	return {
		index,
		loading,
		loadError,
		errors,
		productCapped,
		ensureIndex,
		refresh,
		buildSearchGroups,
	};
}
