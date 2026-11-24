<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AlertCircle, RotateCw, Search, Wrench } from 'lucide-vue-next';
import ServiceFacilityCard from '../components/ServiceFacilityCard.vue';
import { SERVICE_CATEGORIES, type ServiceFacility } from '../data/serviceFacilities';
import { fetchServiceFacilities, type ServiceFacilityListMeta } from '../services/serviceFacilities';
import { content } from '../data/site';

const route = useRoute();
const router = useRouter();

const q = ref(typeof route.query.q === 'string' ? route.query.q : '');
const category = ref(typeof route.query.category === 'string' ? route.query.category : '');
const rows = ref<ServiceFacility[]>([]);
const meta = ref<ServiceFacilityListMeta | null>(null);
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
		const result = await fetchServiceFacilities({
			q: q.value,
			category: category.value,
			page: requestedPage,
			limit: 12,
		});
		page.value = result.meta.page;
		rows.value = reset ? result.rows : [...rows.value, ...result.rows];
		meta.value = result.meta;
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'Unable to load services & facilities.';
	} finally {
		loading.value = false;
		loadingMore.value = false;
	}
}

function syncQuery(): void {
	const query: Record<string, string> = {};
	if (q.value) query.q = q.value;
	if (category.value) query.category = category.value;
	void router.replace({ name: 'services', query });
}

let debounce: ReturnType<typeof setTimeout> | undefined;
watch(q, () => {
	clearTimeout(debounce);
	debounce = setTimeout(() => {
		syncQuery();
		void load(true);
	}, 300);
});

watch(category, () => {
	syncQuery();
	void load(true);
});

onMounted(() => void load(true));
</script>

<template>
	<section class="bg-[linear-gradient(110deg,#061a39,#0a2854)] py-9 text-white md:py-12">
		<div class="mx-auto max-w-[1180px] px-5">
			<h1 class="mb-1.5 mt-0 text-[1.6rem] font-extrabold tracking-[-.03em] lg:text-[2rem]">
				{{ content.services_title }}
			</h1>
			<p class="m-0 max-w-[640px] text-[.85rem] text-white/75">
				{{ content.services_description }} — browse the laboratories, equipment and expert
				services available to industry, government and community partners.
			</p>

			<form
				class="mt-5 flex h-11 max-w-[460px] items-center rounded-[28px] bg-white pl-4 text-ink shadow-[0_15px_35px_rgba(0,0,0,.18)]"
				role="search"
				@submit.prevent="void load(true)"
			>
				<label class="sr-only" for="service-search">Search services & facilities</label>
				<Search class="h-4 w-4 shrink-0 text-muted" />
				<input
					id="service-search"
					v-model="q"
					type="search"
					placeholder="Search by service, facility or equipment…"
					class="min-w-0 flex-1 bg-transparent px-3 text-[.8rem] outline-none"
				/>
			</form>

			<div class="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
				<button
					v-for="option in ['', ...SERVICE_CATEGORIES]"
					:key="option || 'all'"
					type="button"
					class="rounded-full border px-3.5 py-1.5 text-[.72rem] font-bold transition"
					:class="
						category === option
							? 'border-white bg-white text-navy'
							: 'border-white/30 text-white/85 hover:border-white/70'
					"
					:aria-pressed="category === option"
					@click="category = option"
				>
					{{ option || 'All' }}
				</button>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-[1180px] px-5 py-8 md:py-10">
		<p class="mb-5 text-[.8rem] text-muted" aria-live="polite">
			<template v-if="loading">Loading services & facilities…</template>
			<template v-else-if="meta">
				{{ meta.total }} {{ meta.total === 1 ? 'service' : 'services' }}
				<span v-if="category">in {{ category }}</span>
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

		<div v-else-if="!rows.length" class="rounded-[12px] border border-line bg-white p-8 text-center">
			<Wrench class="mx-auto mb-3 h-8 w-8 text-muted" />
			<p class="m-0 text-[.88rem] font-semibold text-navy">No services or facilities found.</p>
			<p class="mb-4 mt-1 text-[.8rem] text-muted">Try a different keyword or category.</p>
			<button
				v-if="q || category"
				type="button"
				class="outline-btn"
				@click="
					q = '';
					category = '';
				"
			>
				Clear filters
			</button>
		</div>

		<template v-else>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<ServiceFacilityCard v-for="service in rows" :key="service.id" :service="service" />
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
