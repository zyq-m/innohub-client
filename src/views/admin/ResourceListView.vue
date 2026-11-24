<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { AlertCircle, Pencil, Plus, RotateCw, Search, Star, Trash2 } from 'lucide-vue-next';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import {
	formatDate,
	getResource,
	STATUSES,
	STATUS_LABELS,
	toCellText,
	type AdminRecord,
	type ResourceDef,
} from '../../admin/resources';
import { useResource } from '../../admin/useResource';
import { setPageTitle } from '../../lib/seo';

const props = defineProps<{ resource: string }>();
const def = getResource(props.resource) as ResourceDef;

const { rows, meta, loading, error, list, setStatus, update, remove } = useResource(def);

const search = ref('');
const status = ref('');
const featured = ref('');
const type = ref('');
const cluster = ref('');
const category = ref('');
const level = ref('');
const page = ref(1);
const pendingDelete = ref<number | null>(null);

const hasTypeFilter = computed(() => def.filters.includes('type'));
const hasClusterFilter = computed(() => def.filters.includes('cluster'));
const hasCategoryFilter = computed(() => def.filters.includes('category'));
const hasLevelFilter = computed(() => def.filters.includes('level'));

const typeOptions = computed(() => def.filterOptions?.type ?? []);
const categoryOptions = computed(() => def.filterOptions?.category ?? []);
const levelOptions = computed(() => def.filterOptions?.level ?? []);

function reload(): void {
	void list({
		search: search.value,
		status: status.value,
		featured: featured.value === '' ? undefined : featured.value === 'true',
		type: type.value,
		cluster: cluster.value,
		category: category.value,
		level: level.value,
		page: page.value,
		limit: 20,
	});
}

function goToPage(next: number): void {
	page.value = next;
	reload();
}

async function onStatusChange(row: AdminRecord, value: string): Promise<void> {
	await setStatus(row.id, value);
	reload();
}

async function toggleFeatured(row: AdminRecord): Promise<void> {
	await update(row.id, { featured: !row.featured });
	reload();
}

async function confirmDelete(id: number): Promise<void> {
	const ok = await remove(id);
	pendingDelete.value = null;
	if (ok) reload();
}

let debounce: ReturnType<typeof setTimeout> | undefined;
watch([search, cluster], () => {
	clearTimeout(debounce);
	debounce = setTimeout(() => {
		page.value = 1;
		reload();
	}, 300);
});

watch([status, featured, type, category, level], () => {
	page.value = 1;
	reload();
});

onMounted(() => {
	setPageTitle(`${def.label} · Admin`);
	reload();
});
</script>

<template>
	<div class="px-5 py-6 lg:px-8 lg:py-8">
		<header class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 class="m-0 text-[1.4rem] font-extrabold tracking-[-.02em] text-navy">{{ def.label }}</h1>
				<p class="m-0 mt-0.5 text-[.8rem] text-muted">
					<template v-if="meta">{{ meta.total }} total</template>
					<template v-else>Manage records</template>
				</p>
			</div>
			<RouterLink
				:to="{ name: 'admin-new', params: { resource: def.key } }"
				class="inline-flex items-center gap-2 rounded-[8px] bg-navy px-4 py-2.5 text-[.8rem] font-extrabold text-white transition hover:bg-brandblue"
			>
				<Plus class="h-4 w-4" />
				New {{ def.singular.toLowerCase() }}
			</RouterLink>
		</header>

		<div
			class="mb-4 flex flex-wrap items-end gap-3 rounded-[10px] border border-line bg-white p-4 shadow-card"
		>
			<label class="relative min-w-[220px] flex-1">
				<span class="sr-only">Search</span>
				<Search
					class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
				/>
				<input
					v-model="search"
					type="search"
					placeholder="Search…"
					class="w-full rounded-[8px] border border-line py-2 pl-9 pr-3 text-[.82rem] outline-none transition focus:border-brandblue"
				/>
			</label>

			<label class="min-w-[150px]">
				<span class="mb-1 block text-[.7rem] font-bold uppercase tracking-[.04em] text-muted">
					Status
				</span>
				<select
					v-model="status"
					class="w-full rounded-[8px] border border-line px-3 py-2 text-[.82rem] outline-none transition focus:border-brandblue"
				>
					<option value="">All statuses</option>
					<option v-for="value in STATUSES" :key="value" :value="value">
						{{ STATUS_LABELS[value] }}
					</option>
				</select>
			</label>

			<label class="min-w-[150px]">
				<span class="mb-1 block text-[.7rem] font-bold uppercase tracking-[.04em] text-muted">
					Featured
				</span>
				<select
					v-model="featured"
					class="w-full rounded-[8px] border border-line px-3 py-2 text-[.82rem] outline-none transition focus:border-brandblue"
				>
					<option value="">All</option>
					<option value="true">Featured only</option>
					<option value="false">Not featured</option>
				</select>
			</label>

			<label v-if="hasTypeFilter" class="min-w-[130px]">
				<span class="mb-1 block text-[.7rem] font-bold uppercase tracking-[.04em] text-muted">
					Type
				</span>
				<select
					v-model="type"
					class="w-full rounded-[8px] border border-line px-3 py-2 text-[.82rem] outline-none transition focus:border-brandblue"
				>
					<option value="">All types</option>
					<option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
				</select>
			</label>

			<label v-if="hasCategoryFilter" class="min-w-[190px]">
				<span class="mb-1 block text-[.7rem] font-bold uppercase tracking-[.04em] text-muted">
					Category
				</span>
				<select
					v-model="category"
					class="w-full rounded-[8px] border border-line px-3 py-2 text-[.82rem] outline-none transition focus:border-brandblue"
				>
					<option value="">All categories</option>
					<option v-for="option in categoryOptions" :key="option" :value="option">
						{{ option }}
					</option>
				</select>
			</label>

			<label v-if="hasLevelFilter" class="min-w-[150px]">
				<span class="mb-1 block text-[.7rem] font-bold uppercase tracking-[.04em] text-muted">
					Level
				</span>
				<select
					v-model="level"
					class="w-full rounded-[8px] border border-line px-3 py-2 text-[.82rem] outline-none transition focus:border-brandblue"
				>
					<option value="">All levels</option>
					<option v-for="option in levelOptions" :key="option" :value="option">{{ option }}</option>
				</select>
			</label>

			<label v-if="hasClusterFilter" class="min-w-[190px]">
				<span class="mb-1 block text-[.7rem] font-bold uppercase tracking-[.04em] text-muted">
					Parent cluster
				</span>
				<input
					v-model="cluster"
					type="text"
					placeholder="Exact cluster name"
					class="w-full rounded-[8px] border border-line px-3 py-2 text-[.82rem] outline-none transition focus:border-brandblue"
				/>
			</label>
		</div>

		<p
			v-if="error"
			class="mb-4 flex items-center gap-2 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[.8rem] text-[#b3261e]"
		>
			<AlertCircle class="h-4 w-4" />
			{{ error }}
		</p>

		<div v-if="loading" class="space-y-2">
			<div v-for="n in 6" :key="n" class="h-12 animate-pulse rounded-[8px] bg-white shadow-card"></div>
		</div>

		<div
			v-else-if="!rows.length"
			class="rounded-[10px] border border-line bg-white p-10 text-center shadow-card"
		>
			<p class="m-0 text-[.9rem] font-bold text-navy">No records found.</p>
			<p class="mb-4 mt-1 text-[.8rem] text-muted">Adjust the filters or create a new record.</p>
			<button type="button" class="outline-btn" @click="reload">
				<RotateCw class="h-3.5 w-3.5" /> Refresh
			</button>
		</div>

		<div v-else class="overflow-hidden rounded-[10px] border border-line bg-white shadow-card">
			<div class="overflow-x-auto">
				<table class="w-full min-w-[900px] border-collapse text-left">
					<thead>
						<tr
							class="border-b border-line bg-[#f7f9fd] text-[.7rem] uppercase tracking-[.04em] text-muted"
						>
							<th v-for="column in def.columns" :key="column.name" class="px-4 py-3 font-bold">
								{{ column.label }}
							</th>
							<th class="px-4 py-3 font-bold">Photos</th>
							<th class="px-4 py-3 font-bold">Status</th>
							<th class="px-4 py-3 font-bold">Featured</th>
							<th class="px-4 py-3 font-bold">Updated</th>
							<th class="px-4 py-3 text-right font-bold">Actions</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="row in rows"
							:key="row.id"
							class="border-b border-line last:border-b-0 hover:bg-[#fafcff]"
						>
							<td
								v-for="(column, index) in def.columns"
								:key="column.name"
								class="max-w-[240px] px-4 py-3 align-top"
								:class="
									index === 0 ? 'text-[.84rem] font-bold text-navy' : 'text-[.8rem] text-[#3c4a60]'
								"
							>
								<RouterLink
									v-if="index === 0"
									:to="{ name: 'admin-edit', params: { resource: def.key, id: row.id } }"
									class="line-clamp-2 hover:text-brandblue"
								>
									{{ toCellText(row[column.name]) || '—' }}
								</RouterLink>
								<span v-else class="line-clamp-2">{{ toCellText(row[column.name]) || '—' }}</span>
							</td>
							<td class="px-4 py-3 align-top text-[.8rem] text-[#3c4a60]">
								{{ (row.photos ?? []).length }}
							</td>
							<td class="px-4 py-3 align-top">
								<StatusBadge :status="row.status" />
								<select
									:value="row.status"
									class="mt-2 block rounded-[6px] border border-line px-2 py-1 text-[.72rem] outline-none focus:border-brandblue"
									aria-label="Change status"
									@change="onStatusChange(row, ($event.target as HTMLSelectElement).value)"
								>
									<option v-for="value in STATUSES" :key="value" :value="value">
										{{ STATUS_LABELS[value] }}
									</option>
								</select>
							</td>
							<td class="px-4 py-3 align-top">
								<button
									type="button"
									class="rounded-full p-1.5 transition hover:bg-[#fff4dd]"
									:class="row.featured ? 'text-gold' : 'text-[#c3ccda]'"
									:title="row.featured ? 'Remove from featured' : 'Mark as featured'"
									@click="toggleFeatured(row)"
								>
									<Star class="h-4 w-4" :fill="row.featured ? 'currentColor' : 'none'" />
								</button>
							</td>
							<td class="whitespace-nowrap px-4 py-3 align-top text-[.78rem] text-muted">
								{{ formatDate(row.updatedAt) }}
							</td>
							<td class="px-4 py-3 align-top">
								<div class="flex items-center justify-end gap-1.5">
									<RouterLink
										:to="{ name: 'admin-edit', params: { resource: def.key, id: row.id } }"
										class="rounded-[6px] p-1.5 text-brandblue transition hover:bg-[#eef3ff]"
										title="Edit"
									>
										<Pencil class="h-4 w-4" />
									</RouterLink>
									<template v-if="pendingDelete === row.id">
										<button
											type="button"
											class="rounded-[6px] bg-[#b3261e] px-2.5 py-1.5 text-[.72rem] font-bold text-white"
											@click="confirmDelete(row.id)"
										>
											Delete
										</button>
										<button
											type="button"
											class="rounded-[6px] border border-line px-2.5 py-1.5 text-[.72rem] font-bold text-[#3c4a60]"
											@click="pendingDelete = null"
										>
											Cancel
										</button>
									</template>
									<button
										v-else
										type="button"
										class="rounded-[6px] p-1.5 text-[#b3261e] transition hover:bg-[#fdecec]"
										title="Delete"
										@click="pendingDelete = row.id"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div
				v-if="meta && meta.totalPages > 1"
				class="flex items-center justify-between border-t border-line px-4 py-3 text-[.78rem] text-muted"
			>
				<span>Page {{ meta.page }} of {{ meta.totalPages }}</span>
				<div class="flex gap-2">
					<button type="button" class="outline-btn" :disabled="meta.page <= 1" @click="goToPage(meta.page - 1)">
						Previous
					</button>
					<button
						type="button"
						class="outline-btn"
						:disabled="meta.page >= meta.totalPages"
						@click="goToPage(meta.page + 1)"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
