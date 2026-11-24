<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AlertCircle, ArrowRight, RotateCw } from 'lucide-vue-next';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import { formatDate, getResource, recordTitle, resources, type AdminRecord } from '../../admin/resources';
import { contentApi } from '../../lib/contentApi';
import { apiError } from '../../admin/useResource';
import { setPageTitle } from '../../lib/seo';

interface ResourceStat {
	key: string;
	label: string;
	singular: string;
	total: number;
	published: number;
	draft: number;
}

const stats = ref<ResourceStat[]>([]);
const recent = ref<{ resource: string; id: number; title: string; status: string; updatedAt?: string }[]>([]);
const loading = ref(true);
const error = ref('');

const totals = computed(() =>
	stats.value.reduce(
		(acc, item) => ({
			total: acc.total + item.total,
			published: acc.published + item.published,
			draft: acc.draft + item.draft,
		}),
		{ total: 0, published: 0, draft: 0 },
	),
);

function countOf(response: { data?: { meta?: { total?: number } } }): number {
	return response.data?.meta?.total ?? 0;
}

async function load(): Promise<void> {
	loading.value = true;
	error.value = '';

	try {
		const perResource = await Promise.all(
			resources.map(async (def) => {
				const [all, published, draft, latest] = await Promise.all([
					contentApi.get(def.endpoint, { params: { limit: 1 } }),
					contentApi.get(def.endpoint, { params: { limit: 1, status: 'published' } }),
					contentApi.get(def.endpoint, { params: { limit: 1, status: 'draft' } }),
					contentApi.get(def.endpoint, { params: { limit: 5 } }),
				]);

				const recentRows = (latest.data?.data ?? []) as AdminRecord[];

				return {
					stat: {
						key: def.key,
						label: def.label,
						singular: def.singular,
						total: countOf(all),
						published: countOf(published),
						draft: countOf(draft),
					},
					recentRows,
				};
			}),
		);

		stats.value = perResource.map((item) => item.stat);
		recent.value = perResource
			.flatMap((item) =>
				item.recentRows.map((record) => ({
					resource: item.stat.key,
					id: record.id,
					title: recordTitle(record, getResource(item.stat.key) ?? resources[0]),
					status: String(record.status ?? ''),
					updatedAt: record.updatedAt,
				})),
			)
			.sort((a, b) => {
				const da = new Date(a.updatedAt ?? 0).getTime();
				const db = new Date(b.updatedAt ?? 0).getTime();
				return db - da;
			})
			.slice(0, 8);
	} catch (err) {
		error.value = apiError(err, 'Unable to load dashboard');
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	setPageTitle('Admin');
	void load();
});
</script>

<template>
	<div class="px-5 py-6 lg:px-8 lg:py-8">
		<header class="mb-6">
			<h1 class="m-0 text-[1.4rem] font-extrabold tracking-[-.02em] text-navy">Dashboard</h1>
			<p class="m-0 mt-0.5 text-[.8rem] text-muted">
				Manage spin-off companies, CoE / institutes and research partners.
			</p>
		</header>

		<p
			v-if="error"
			class="mb-4 flex items-center gap-2 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[.8rem] text-[#b3261e]"
		>
			<AlertCircle class="h-4 w-4" />
			{{ error }}
			<button type="button" class="ml-auto font-bold underline" @click="load">Retry</button>
		</p>

		<div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div v-for="n in 3" :key="n" class="h-28 animate-pulse rounded-[10px] bg-white shadow-card"></div>
		</div>

		<template v-else>
			<div class="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="rounded-[10px] border border-line bg-white p-5 shadow-card">
					<p class="m-0 text-[.72rem] font-bold uppercase tracking-[.05em] text-muted">Total records</p>
					<p class="mb-0 mt-1 text-[1.8rem] font-extrabold text-navy">{{ totals.total }}</p>
				</div>
				<div class="rounded-[10px] border border-line bg-white p-5 shadow-card">
					<p class="m-0 text-[.72rem] font-bold uppercase tracking-[.05em] text-muted">Published</p>
					<p class="mb-0 mt-1 text-[1.8rem] font-extrabold text-[#1c7c47]">{{ totals.published }}</p>
				</div>
				<div class="rounded-[10px] border border-line bg-white p-5 shadow-card">
					<p class="m-0 text-[.72rem] font-bold uppercase tracking-[.05em] text-muted">Drafts</p>
					<p class="mb-0 mt-1 text-[1.8rem] font-extrabold text-[#9a6a00]">{{ totals.draft }}</p>
				</div>
			</div>

			<section class="mb-7">
				<h2 class="mb-3 mt-0 text-[1rem] font-bold text-navy">Content types</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
					<RouterLink
						v-for="item in stats"
						:key="item.key"
						:to="{ name: 'admin-list', params: { resource: item.key } }"
						class="group rounded-[10px] border border-line bg-white p-5 shadow-card transition hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(10,35,73,.12)]"
					>
						<div class="mb-3 flex items-start justify-between gap-3">
							<strong class="text-[.95rem] font-extrabold text-navy">{{ item.label }}</strong>
							<ArrowRight class="h-4 w-4 text-muted transition group-hover:text-brandblue" />
						</div>
						<div class="flex flex-wrap gap-x-5 gap-y-1 text-[.78rem] text-[#3c4a60]">
							<span><b class="text-navy">{{ item.total }}</b> total</span>
							<span><b class="text-[#1c7c47]">{{ item.published }}</b> published</span>
							<span><b class="text-[#9a6a00]">{{ item.draft }}</b> drafts</span>
						</div>
					</RouterLink>
				</div>
			</section>

			<section>
				<h2 class="mb-3 mt-0 text-[1rem] font-bold text-navy">Recently updated</h2>
				<div
					v-if="!recent.length"
					class="rounded-[10px] border border-line bg-white p-6 text-center text-[.82rem] text-muted shadow-card"
				>
					Nothing yet — create your first record.
				</div>
				<ul v-else class="m-0 list-none divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-white p-0 shadow-card">
					<li v-for="item in recent" :key="`${item.resource}-${item.id}`">
						<RouterLink
							:to="{ name: 'admin-edit', params: { resource: item.resource, id: item.id } }"
							class="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-[#fafcff]"
						>
							<span class="min-w-[200px] flex-1 truncate text-[.84rem] font-bold text-navy">
								{{ item.title }}
							</span>
							<span class="text-[.72rem] uppercase tracking-[.04em] text-muted">{{ item.resource }}</span>
							<StatusBadge :status="item.status" />
							<span class="whitespace-nowrap text-[.74rem] text-muted">
								{{ formatDate(item.updatedAt) }}
							</span>
						</RouterLink>
					</li>
				</ul>
			</section>
		</template>

		<button
			v-if="!loading"
			type="button"
			class="outline-btn mt-6"
			@click="load"
		>
			<RotateCw class="h-3.5 w-3.5" />
			Refresh
		</button>
	</div>
</template>
