<script setup lang="ts">
	import {
		AlertCircle,
		ArrowLeft,
		Newspaper,
		RotateCw,
		Search,
	} from "lucide-vue-next";
	import { onMounted, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import CommunityNewsCard from "../components/CommunityNewsCard.vue";
	import {
		COMMUNITY_NEWS_LEVELS,
		COMMUNITY_NEWS_TOPICS,
		type CommunityNews,
	} from "../data/communityNews";
	import {
		fetchCommunityNews,
		type CommunityNewsListMeta,
	} from "../services/communityNews";

	const route = useRoute();
	const router = useRouter();

	const q = ref(typeof route.query.q === "string" ? route.query.q : "");
	const type = ref(
		typeof route.query.type === "string" ? route.query.type : "",
	);
	const level = ref(
		typeof route.query.level === "string" ? route.query.level : "",
	);
	const rows = ref<CommunityNews[]>([]);
	const meta = ref<CommunityNewsListMeta | null>(null);
	const loading = ref(true);
	const loadingMore = ref(false);
	const error = ref("");
	const page = ref(1);

	async function load(reset: boolean): Promise<void> {
		if (reset) {
			loading.value = true;
			error.value = "";
		} else {
			loadingMore.value = true;
		}
		const requestedPage = reset ? 1 : page.value + 1;

		try {
			const result = await fetchCommunityNews({
				q: q.value,
				type: type.value,
				level: level.value,
				page: requestedPage,
				limit: 12,
			});
			page.value = result.meta.page;
			rows.value = reset ? result.rows : [...rows.value, ...result.rows];
			meta.value = result.meta;
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Unable to load community news.";
		} finally {
			loading.value = false;
			loadingMore.value = false;
		}
	}

	function syncQuery(): void {
		const query: Record<string, string> = {};
		if (q.value) query.q = q.value;
		if (type.value) query.type = type.value;
		if (level.value) query.level = level.value;
		void router.replace({ name: "community-news", query });
	}

	let debounce: ReturnType<typeof setTimeout> | undefined;
	watch(q, () => {
		clearTimeout(debounce);
		debounce = setTimeout(() => {
			syncQuery();
			void load(true);
		}, 300);
	});

	watch([type, level], () => {
		syncQuery();
		void load(true);
	});

	onMounted(() => void load(true));
</script>

<template>
	<section
		class="bg-[linear-gradient(110deg,#061a39,#0a2854)] py-9 text-white md:py-12"
	>
		<div class="mx-auto max-w-[1180px] px-5">
			<RouterLink
				:to="{ name: 'community' }"
				class="mb-3 inline-flex items-center gap-1.5 text-[.75rem] font-bold text-white/70 transition hover:text-white"
			>
				<ArrowLeft class="h-3.5 w-3.5" />
				Community / Industry Product Innovation
			</RouterLink>
			<h1
				class="mb-1.5 mt-0 text-[1.6rem] font-extrabold tracking-[-.03em] lg:text-[2rem]"
			>
				Community News
			</h1>
			<p class="m-0 max-w-[640px] text-[.85rem] text-white/75">
				Activities, programmes and milestones from UniSZA’s community engagement
				work across Terengganu.
			</p>

			<form
				class="mt-5 flex h-11 max-w-[460px] items-center rounded-[28px] bg-white pl-4 text-ink shadow-[0_15px_35px_rgba(0,0,0,.18)]"
				role="search"
				@submit.prevent="void load(true)"
			>
				<label class="sr-only" for="community-news-search"
					>Search community news</label
				>
				<Search class="h-4 w-4 shrink-0 text-muted" />
				<input
					id="community-news-search"
					v-model="q"
					type="search"
					placeholder="Search by title, organiser or keyword…"
					class="min-w-0 flex-1 bg-transparent px-3 text-[.8rem] outline-none"
				/>
			</form>

			<div class="mt-4 space-y-2">
				<div
					class="flex flex-wrap gap-2"
					role="group"
					aria-label="Filter by topic"
				>
					<button
						v-for="option in ['', ...COMMUNITY_NEWS_TOPICS]"
						:key="`type-${option || 'all'}`"
						type="button"
						class="rounded-full border px-3.5 py-1.5 text-[.72rem] font-bold transition"
						:class="
							type === option
								? 'border-white bg-white text-navy'
								: 'border-white/30 text-white/85 hover:border-white/70'
						"
						:aria-pressed="type === option"
						@click="type = option"
					>
						{{ option || "All topics" }}
					</button>
				</div>

				<div
					class="flex flex-wrap gap-2"
					role="group"
					aria-label="Filter by level"
				>
					<button
						v-for="option in ['', ...COMMUNITY_NEWS_LEVELS]"
						:key="`level-${option || 'all'}`"
						type="button"
						class="rounded-full border px-3 py-1 text-[.68rem] font-bold transition"
						:class="
							level === option
								? 'border-gold bg-gold text-navy'
								: 'border-white/25 text-white/70 hover:border-white/60'
						"
						:aria-pressed="level === option"
						@click="level = option"
					>
						{{ option || "All levels" }}
					</button>
				</div>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-[1180px] px-5 py-8 md:py-10">
		<p class="mb-5 text-[.8rem] text-muted" aria-live="polite">
			<template v-if="loading">Loading community news…</template>
			<template v-else-if="meta">
				{{ meta.total }} {{ meta.total === 1 ? "news item" : "news items" }}
				<span v-if="type">on {{ type }}</span>
				<span v-if="level">at {{ level }} level</span>
				<span v-if="q">matching “{{ q }}”</span>
			</template>
		</p>

		<div
			v-if="error && !rows.length"
			class="flex flex-col items-start gap-3 rounded-[12px] border border-line bg-white p-6"
		>
			<p class="m-0 flex items-center gap-2 text-[.85rem] text-[#b3261e]">
				<AlertCircle class="h-4 w-4" />
				{{ error }}
			</p>
			<button type="button" class="outline-btn" @click="void load(true)">
				<RotateCw class="h-3.5 w-3.5" /> Try again
			</button>
		</div>

		<div
			v-else-if="loading"
			class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
			aria-hidden="true"
		>
			<div
				v-for="n in 8"
				:key="n"
				class="h-[290px] animate-pulse rounded-[9px] bg-white shadow-card"
			></div>
		</div>

		<div
			v-else-if="!rows.length"
			class="rounded-[12px] border border-line bg-white p-8 text-center"
		>
			<Newspaper class="mx-auto mb-3 h-8 w-8 text-muted" />
			<p class="m-0 text-[.88rem] font-semibold text-navy">
				No community news found.
			</p>
			<p class="mb-4 mt-1 text-[.8rem] text-muted">
				Try a different keyword, topic or level.
			</p>
			<button
				v-if="q || type || level"
				type="button"
				class="outline-btn"
				@click="
					q = '';
					type = '';
					level = '';
				"
			>
				Clear filters
			</button>
		</div>

		<template v-else>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<CommunityNewsCard v-for="item in rows" :key="item.id" :item="item" />
			</div>

			<div
				v-if="meta && page < meta.totalPages"
				class="mt-8 flex justify-center"
			>
				<button
					type="button"
					class="outline-btn disabled:opacity-60"
					:disabled="loadingMore"
					@click="void load(false)"
				>
					{{ loadingMore ? "Loading…" : "Load more" }}
				</button>
			</div>
		</template>
	</section>
</template>
