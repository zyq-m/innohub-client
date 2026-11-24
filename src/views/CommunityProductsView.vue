<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AlertCircle, Newspaper, RotateCw, Search, Users } from 'lucide-vue-next';
import CommunityProductCard from '../components/CommunityProductCard.vue';
import { fetchCommunityProducts, type CommunityProductListMeta } from '../services/communityProducts';
import type { CommunityProduct } from '../data/communityProducts';

const route = useRoute();
const router = useRouter();

const q = ref(typeof route.query.q === 'string' ? route.query.q : '');
const rows = ref<CommunityProduct[]>([]);
const meta = ref<CommunityProductListMeta | null>(null);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref('');
const page = ref(1);

async function load(reset: boolean): Promise<void> {
	if (reset) {
		loading.value = true;
		error.value = '';
	} else {
		loadingMore.value = true;
	}
	const requestedPage = reset ? 1 : page.value + 1;

	try {
		const result = await fetchCommunityProducts({ q: q.value, page: requestedPage, limit: 12 });
		page.value = result.meta.page;
		rows.value = reset ? result.rows : [...rows.value, ...result.rows];
		meta.value = result.meta;
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Unable to load community products.';
	} finally {
		loading.value = false;
		loadingMore.value = false;
	}
}

function retry(): void {
	void load(true);
}

let debounce: ReturnType<typeof setTimeout> | undefined;
watch(q, () => {
	clearTimeout(debounce);
	debounce = setTimeout(() => {
		void router.replace({ name: 'community', query: q.value ? { q: q.value } : {} });
		void load(true);
	}, 300);
});

onMounted(() => void load(true));
</script>

<template>
	<section class="bg-[linear-gradient(110deg,#061a39,#0a2854)] py-9 text-white md:py-12">
		<div class="mx-auto max-w-[1180px] px-5">
			<h1 class="mb-1.5 mt-0 text-[1.6rem] font-extrabold tracking-[-.03em] lg:text-[2rem]">
				Community Innovation
			</h1>
			<p class="m-0 max-w-[640px] text-[.85rem] text-white/75">
				Community-driven products and solutions from UniSZA that address local needs and
				improve livelihoods across Terengganu.
			</p>

			<RouterLink
				:to="{ name: 'community-news' }"
				class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[.75rem] font-bold text-white/90 transition hover:border-white/70 hover:text-white"
			>
				<Newspaper class="h-3.5 w-3.5" />
				Community news
			</RouterLink>

			<form
				class="mt-5 flex h-11 max-w-[460px] items-center rounded-[28px] bg-white pl-4 text-ink shadow-[0_15px_35px_rgba(0,0,0,.18)]"
				role="search"
				@submit.prevent="void load(true)"
			>
				<label class="sr-only" for="community-search">Search community products</label>
				<Search class="h-4 w-4 shrink-0 text-muted" />
				<input
					id="community-search"
					v-model="q"
					type="search"
					placeholder="Search by product, innovator or community…"
					class="min-w-0 flex-1 bg-transparent px-3 text-[.8rem] outline-none"
				/>
			</form>
		</div>
	</section>

	<section class="mx-auto max-w-[1180px] px-5 py-8 md:py-10">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<p class="m-0 text-[.8rem] text-muted" aria-live="polite">
				<template v-if="loading">Loading products…</template>
				<template v-else-if="meta">
					{{ meta.total }} {{ meta.total === 1 ? 'product' : 'products' }}
					<span v-if="q">matching “{{ q }}”</span>
				</template>
			</p>
		</div>

		<div
			v-if="error && !rows.length"
			class="flex flex-col items-start gap-3 rounded-[12px] border border-line bg-white p-6"
		>
			<p class="m-0 flex items-center gap-2 text-[.85rem] text-[#b3261e]">
				<AlertCircle class="h-4 w-4" />
				{{ error }}
			</p>
			<button type="button" class="outline-btn" @click="retry">
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

		<div v-else-if="!rows.length" class="rounded-[12px] border border-line bg-white p-8 text-center">
			<Users class="mx-auto mb-3 h-8 w-8 text-muted" />
			<p class="m-0 text-[.88rem] font-semibold text-navy">No community products found.</p>
			<p class="mb-4 mt-1 text-[.8rem] text-muted">Try a different keyword.</p>
			<button v-if="q" type="button" class="outline-btn" @click="q = ''">Clear search</button>
		</div>

		<template v-else>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<CommunityProductCard v-for="product in rows" :key="product.id" :product="product" />
			</div>

			<div v-if="meta && page < meta.totalPages" class="mt-8 flex justify-center">
				<button
					type="button"
					class="outline-btn disabled:opacity-60"
					:disabled="loadingMore"
					@click="void load(false)"
				>
					{{ loadingMore ? 'Loading…' : 'Load more' }}
				</button>
			</div>
		</template>
	</section>
</template>
