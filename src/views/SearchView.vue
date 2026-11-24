<script setup lang="ts">
	import { RefreshCw, Search } from "lucide-vue-next";
	import { computed, onMounted, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import SearchResultItem from "../components/SearchResultItem.vue";
	import { useSiteSearch } from "../composables/useSiteSearch";
	import {
		GROUP_LABELS,
		GROUP_ORDER,
		type SearchGroup,
		type SearchGroupResult,
	} from "../data/search";

	const route = useRoute();
	const router = useRouter();
	const {
		index,
		loading,
		loadError,
		errors,
		productCapped,
		ensureIndex,
		refresh,
		buildSearchGroups,
	} = useSiteSearch();

	const input = ref("");
	const activeType = ref<"all" | SearchGroup>("all");
	const expanded = ref<Set<SearchGroup>>(new Set());
	let timer: ReturnType<typeof setTimeout> | undefined;

	const query = computed(() =>
		(typeof route.query.q === "string" ? route.query.q : "").trim(),
	);
	const routeType = computed(() =>
		typeof route.query.type === "string" ? route.query.type : "all",
	);

	const groups = computed<SearchGroupResult[]>(() => {
		if (!index.value || !query.value) return [];
		return buildSearchGroups(index.value, query.value);
	});

	const visibleGroups = computed(() => {
		if (activeType.value === "all") return groups.value;
		return groups.value.filter((g) => g.group === activeType.value);
	});

	const totalHits = computed(() =>
		groups.value.reduce((n, g) => n + g.total, 0),
	);

	const chips = computed(() => {
		const all = [{ key: "all" as const, label: "All", count: totalHits.value }];
		const rest = GROUP_ORDER.filter((g) =>
			groups.value.some((r) => r.group === g),
		).map((g) => ({
			key: g,
			label: GROUP_LABELS[g],
			count: groups.value.find((r) => r.group === g)?.total ?? 0,
		}));
		return [...all, ...rest];
	});

	function syncFromRoute() {
		input.value = query.value;
		const t = routeType.value;
		activeType.value =
			t === "all" || GROUP_ORDER.includes(t as SearchGroup)
				? (t as "all" | SearchGroup)
				: "all";
	}

	function pushSearch(q: string, type: "all" | SearchGroup = activeType.value) {
		const nextQ = q.trim();
		const queryObj: Record<string, string> = {};
		if (nextQ) queryObj.q = nextQ;
		if (type !== "all") queryObj.type = type;
		router.replace({ name: "search", query: queryObj });
	}

	function submit() {
		clearTimeout(timer);
		pushSearch(input.value);
	}

	function onInput() {
		clearTimeout(timer);
		timer = setTimeout(() => pushSearch(input.value), 300);
	}

	function setType(type: "all" | SearchGroup) {
		activeType.value = type;
		pushSearch(input.value || query.value, type);
	}

	function shownHits(group: SearchGroupResult) {
		if (group.group === "products")
			return expanded.value.has("products")
				? group.hits
				: group.hits.slice(0, 8);
		return group.hits.slice(0, 5);
	}

	function toggleExpanded(group: SearchGroup) {
		const next = new Set(expanded.value);
		if (next.has(group)) next.delete(group);
		else next.add(group);
		expanded.value = next;
	}

	const suggestions = [
		"Water treatment",
		"Palm oil",
		"IoT",
		"AI",
		"Healthcare",
		"Energy",
	];

	watch(query, async (q) => {
		syncFromRoute();
		if (q) await ensureIndex();
	});

	onMounted(async () => {
		syncFromRoute();
		if (query.value) await ensureIndex();
	});
</script>

<template>
	<main class="bg-ice/30 pb-16">
		<section
			class="border-b border-line bg-[linear-gradient(135deg,#021528,#0a2748)] text-white"
		>
			<div class="mx-auto max-w-[1180px] px-5 py-10 md:py-14">
				<p class="text-[.72rem] font-bold uppercase tracking-[.18em] text-gold">
					InnoHub Search
				</p>
				<h1
					class="mt-2 text-[2rem] font-extrabold tracking-[-.03em] md:text-[2.7rem]"
				>
					Search the innovation ecosystem
				</h1>
				<p class="mt-2 max-w-[680px] text-[.92rem] text-white/75">
					Find products, researchers, services, centres, research groups,
					success stories, community / industry product innovation, news, and
					spin-offs.
				</p>

				<form
					class="mt-6 flex h-12 max-w-[720px] items-center rounded-[28px] bg-white pl-2 text-ink shadow-[0_15px_35px_rgba(0,0,0,.18)]"
					@submit.prevent="submit"
					role="search"
				>
					<label class="sr-only" for="site-search">Search InnoHub</label>
					<Search class="ml-2 h-4 w-4 shrink-0 text-ink/35" />
					<input
						id="site-search"
						v-model="input"
						type="search"
						placeholder="Search products, researchers, CoE, services, keywords…"
						class="min-w-0 flex-1 bg-transparent px-3 text-[.88rem] outline-none"
						@input="onInput"
					/>
					<button
						class="mx-0 h-12 shrink-0 rounded-[10px_26px_26px_10px] bg-gold px-6 text-[.82rem] font-bold text-navy transition hover:bg-[#ffe175]"
						type="submit"
					>
						Search
					</button>
				</form>

				<div
					v-if="!query"
					class="mt-4 flex flex-wrap items-center gap-2 text-[.75rem]"
				>
					<span class="mr-1 font-semibold text-white/70">Try:</span>
					<button
						v-for="s in suggestions"
						:key="s"
						type="button"
						class="rounded-full bg-white/10 px-3 py-1 text-white/85 transition hover:bg-white/20"
						@click="pushSearch(s)"
					>
						{{ s }}
					</button>
				</div>
			</div>
		</section>

		<div class="mx-auto max-w-[1180px] px-5 pt-6">
			<div
				v-if="loadError"
				class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[.85rem] text-red-700"
			>
				{{ loadError }}
				<button
					type="button"
					class="ml-2 font-semibold underline"
					@click="refresh()"
				>
					Retry
				</button>
			</div>
			<div
				v-if="errors.length"
				class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[.8rem] text-amber-800"
			>
				Some sources could not be loaded: {{ errors.join(" ") }}
			</div>
			<div
				v-if="productCapped"
				class="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[.8rem] text-blue-800"
			>
				Showing the first 1000 products. Narrow your search for more specific
				results.
			</div>

			<div
				v-if="query"
				class="mb-5 flex flex-wrap items-center justify-between gap-3"
			>
				<p class="text-[.88rem] text-ink/70">
					<span v-if="loading">Searching…</span>
					<span v-else
						><strong class="text-navy">{{ totalHits }}</strong> result{{
							totalHits === 1 ? "" : "s"
						}}
						for <strong class="text-navy">“{{ query }}”</strong></span
					>
				</p>
				<button
					type="button"
					class="inline-flex items-center gap-1.5 text-[.76rem] font-semibold text-navy/65 hover:text-navy"
					@click="refresh()"
					:disabled="loading"
				>
					<RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': loading }" />
					Refresh
				</button>
			</div>

			<div
				v-if="query && chips.length > 1"
				class="mb-6 flex gap-2 overflow-x-auto pb-1"
			>
				<button
					v-for="chip in chips"
					:key="chip.key"
					type="button"
					class="shrink-0 rounded-full border px-3 py-1.5 text-[.74rem] font-semibold transition"
					:class="
						activeType === chip.key
							? 'border-navy bg-navy text-white'
							: 'border-line bg-white text-ink/75 hover:border-navy/30'
					"
					@click="setType(chip.key)"
				>
					{{ chip.label }}
					<span class="ml-0.5 opacity-70">{{ chip.count }}</span>
				</button>
			</div>

			<div v-if="loading && !index" class="space-y-4">
				<div
					v-for="i in 6"
					:key="i"
					class="h-28 animate-pulse rounded-xl bg-white/80"
				></div>
			</div>

			<div
				v-else-if="query && !loading && totalHits === 0"
				class="rounded-xl border border-line bg-white px-6 py-12 text-center"
			>
				<p class="text-[1rem] font-bold text-navy">
					No results found for “{{ query }}”
				</p>
				<p class="mt-2 text-[.86rem] text-ink/65">
					Try a broader keyword, researcher name, faculty, or category.
				</p>
			</div>

			<div v-else class="space-y-10">
				<section v-for="group in visibleGroups" :key="group.group">
					<div class="mb-3 flex items-end justify-between gap-3">
						<div>
							<h2
								class="text-[1.15rem] font-extrabold tracking-[-.02em] text-navy"
							>
								{{ group.label }}
							</h2>
							<p class="text-[.76rem] text-ink/55">
								{{ group.total }} result{{ group.total === 1 ? "" : "s" }}
							</p>
						</div>
						<RouterLink
							v-if="group.viewAllPath && group.total > shownHits(group).length"
							:to="group.viewAllPath"
							class="text-[.76rem] font-semibold text-blue hover:underline"
						>
							View all {{ group.label.toLowerCase() }}
						</RouterLink>
						<button
							v-else-if="group.group === 'products' && group.total > 8"
							type="button"
							class="text-[.76rem] font-semibold text-blue hover:underline"
							@click="toggleExpanded('products')"
						>
							{{
								expanded.has("products")
									? "Show less"
									: `Show all ${group.total} products`
							}}
						</button>
					</div>
					<div class="grid gap-3">
						<SearchResultItem
							v-for="hit in shownHits(group)"
							:key="hit.id"
							:hit="hit"
							:query="query"
						/>
					</div>
				</section>
			</div>
		</div>
	</main>
</template>
