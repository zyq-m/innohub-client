<script setup lang="ts">
	import { AlertCircle, FlaskConical, RotateCw, Search } from "lucide-vue-next";
	import { computed, onMounted, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import ResearchClusterCard from "../components/ResearchClusterCard.vue";
	import ResearchGroupCard from "../components/ResearchGroupCard.vue";
	import {
		groupByClusterType,
		isKlusterGroup,
		researchGroupType,
		type ClusterTypeGroup,
		type ResearchGroup,
	} from "../data/researchGroups";
	import { fetchResearchGroups } from "../services/researchGroups";

	const route = useRoute();
	const router = useRouter();

	const q = ref(typeof route.query.q === "string" ? route.query.q : "");
	const rows = ref<ResearchGroup[]>([]);
	const total = ref(0);
	const loading = ref(true);
	const error = ref("");

	const isSearching = computed(() => Boolean(q.value.trim()));

	const clusterCards = computed(() =>
		groupByClusterType(rows.value)
			.filter((node): node is ClusterTypeGroup & { kluster: ResearchGroup } =>
				Boolean(node.kluster),
			)
			.map((node) => ({
				kluster: node.kluster,
				sigCount: node.sigs.length,
				rgCount: node.rgs.length,
			})),
	);

	const typeOrder: Record<string, number> = { kluster: 0, sig: 1, rg: 2 };
	const searchResults = computed(() =>
		[...rows.value].sort((a, b) => {
			const ra = typeOrder[researchGroupType(a)] ?? 3;
			const rb = typeOrder[researchGroupType(b)] ?? 3;
			if (ra !== rb) return ra - rb;
			return a.groupName.localeCompare(b.groupName);
		}),
	);

	async function load(): Promise<void> {
		loading.value = true;
		error.value = "";

		try {
			const result = await fetchResearchGroups({ q: q.value, limit: 100 });
			rows.value = result.rows;
			total.value = result.meta.total;
		} catch (err) {
			error.value =
				err instanceof Error
					? err.message
					: "Unable to load research partners.";
		} finally {
			loading.value = false;
		}
	}

	function syncQuery(): void {
		const query: Record<string, string> = {};
		if (q.value) query.q = q.value;
		void router.replace({ name: "research-partners", query });
	}

	let debounce: ReturnType<typeof setTimeout> | undefined;
	watch(q, () => {
		clearTimeout(debounce);
		debounce = setTimeout(() => {
			syncQuery();
			void load();
		}, 300);
	});

	onMounted(() => void load());
</script>

<template>
	<section
		class="bg-[linear-gradient(110deg,#061a39,#0b3b6b)] py-9 text-white md:py-12"
	>
		<div class="mx-auto max-w-[1180px] px-5">
			<h1
				class="mb-1.5 mt-0 text-[1.6rem] font-extrabold tracking-[-.03em] lg:text-[2rem]"
			>
				Cluster / SIG / RG
			</h1>
			<p class="m-0 max-w-[640px] text-[.85rem] text-white/75">
				Browse research clusters, then explore their Special Interest Groups
				(SIG) and Research Groups (RG).
			</p>

			<form
				class="mt-5 flex h-11 max-w-[460px] items-center rounded-[28px] bg-white pl-4 text-ink shadow-[0_15px_35px_rgba(0,0,0,.18)]"
				role="search"
				@submit.prevent="void load()"
			>
				<label class="sr-only" for="research-search"
					>Search research partners</label
				>
				<Search class="h-4 w-4 shrink-0 text-muted" />
				<input
					id="research-search"
					v-model="q"
					type="search"
					placeholder="Search cluster, SIG or RG…"
					class="min-w-0 flex-1 bg-transparent px-3 text-[.8rem] outline-none"
				/>
			</form>
		</div>
	</section>

	<section class="mx-auto max-w-[1180px] px-5 py-8 md:py-10">
		<p class="mb-5 text-[.8rem] text-muted" aria-live="polite">
			<template v-if="loading">Loading research partners…</template>
			<template v-else-if="isSearching">
				{{ total }} {{ total === 1 ? "result" : "results" }} for “{{ q }}”
			</template>
			<template v-else>
				{{ clusterCards.length }} research
				{{ clusterCards.length === 1 ? "cluster" : "clusters" }}
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
			<button type="button" class="outline-btn" @click="void load()">
				<RotateCw class="h-3.5 w-3.5" /> Try again
			</button>
		</div>

		<div
			v-else-if="loading"
			class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
			aria-hidden="true"
		>
			<div
				v-for="card in 8"
				:key="card"
				class="h-[290px] animate-pulse rounded-[9px] bg-white shadow-card"
			></div>
		</div>

		<div
			v-else-if="!rows.length"
			class="rounded-[12px] border border-line bg-white p-8 text-center"
		>
			<FlaskConical class="mx-auto mb-3 h-8 w-8 text-muted" />
			<p class="m-0 text-[.88rem] font-semibold text-navy">
				No research partners found.
			</p>
			<p class="mb-4 mt-1 text-[.8rem] text-muted">Try a different keyword.</p>
			<button v-if="q" type="button" class="outline-btn" @click="q = ''">
				Clear search
			</button>
		</div>

		<div
			v-else-if="isSearching"
			class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
		>
			<template v-for="group in searchResults" :key="group.id">
				<ResearchClusterCard v-if="isKlusterGroup(group)" :kluster="group" />
				<ResearchGroupCard v-else :group="group" />
			</template>
		</div>

		<div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<ResearchClusterCard
				v-for="card in clusterCards"
				:key="card.kluster.id"
				:kluster="card.kluster"
				:sig-count="card.sigCount"
				:rg-count="card.rgCount"
			/>
		</div>
	</section>
</template>
