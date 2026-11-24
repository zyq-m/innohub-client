<script setup lang="ts">
	import { ArrowRight, Search } from "lucide-vue-next";
	import { computed, nextTick, onMounted, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import InnovationCard from "../components/InnovationCard.vue";
	import {
		DEFAULT_TRL_MAX,
		DEFAULT_TRL_MIN,
		TRL_MAX,
		TRL_MIN,
		useProducts,
	} from "../composables/useProducts";
	import { PRODUCT_CATEGORY } from "../data/products";

	const route = useRoute();
	const router = useRouter();
	const {
		state,
		filters,
		total,
		hasMore,
		visibleProducts,
		loadMore,
		reload,
		resetFilters,
		setPageSize,
		setTrlMin,
		setTrlMax,
	} = useProducts();

	const SEARCH_FIELDS = [
		"name",
		"researcher_name",
		"category",
		"faculty",
		"spinOff",
		"trl_min",
		"trl_max",
	] as const;

	let applying = false;

	function toText(value: unknown): string {
		return typeof value === "string"
			? value
			: Array.isArray(value)
				? String(value[0] ?? "")
				: "";
	}

	function buildQuery() {
		const query: Record<string, string> = {};
		for (const field of SEARCH_FIELDS) {
			const value = filters[field];
			if (value === "") continue;
			if (field === "trl_min" && Number(value) === DEFAULT_TRL_MIN) continue;
			if (field === "trl_max" && Number(value) === DEFAULT_TRL_MAX) continue;
			query[field] = String(value);
		}
		return query;
	}

	function parseTrl(value: unknown, fallback: number): number {
		const parsed = Number(toText(value));
		return Number.isFinite(parsed) && parsed >= TRL_MIN && parsed <= TRL_MAX
			? parsed
			: fallback;
	}

	function onTrlMinChange(event: Event): void {
		setTrlMin(Number((event.target as HTMLSelectElement).value));
	}

	function onTrlMaxChange(event: Event): void {
		setTrlMax(Number((event.target as HTMLSelectElement).value));
	}

	watch(
		() => route.query,
		(query) => {
			applying = true;
			filters.name = toText(query.name);
			filters.researcher_name = toText(query.researcher_name);
			filters.category = toText(query.category);
			filters.faculty = toText(query.faculty);
			filters.spinOff = toText(query.spinOff);
			const min = parseTrl(query.trl_min ?? query.trl, DEFAULT_TRL_MIN);
			const max = parseTrl(query.trl_max, DEFAULT_TRL_MAX);
			filters.trl_min = Math.min(min, max);
			filters.trl_max = Math.max(min, max);
			void nextTick(() => {
				applying = false;
			});
		},
		{ immediate: true },
	);

	watch(
		() => buildQuery(),
		(query) => {
			if (applying) return;
			void router.replace({ name: "innovations", query });
		},
		{ deep: true },
	);

	const facultyOptions = computed(() =>
		state.faculty
			.slice()
			.sort((a, b) => a.code.localeCompare(b.code))
			.map((item) => ({ label: item.code, value: item.id })),
	);

	onMounted(() => setPageSize(8));
</script>

<template>
	<section
		class="bg-[linear-gradient(110deg,#061a39,#0a2854)] py-9 text-white md:py-12"
	>
		<div class="mx-auto max-w-[1180px] px-5">
			<h1
				class="mb-1.5 mt-0 text-[1.6rem] font-extrabold tracking-[-.03em] lg:text-[2rem]"
			>
				Innovation Marketplace
			</h1>
			<p class="m-0 max-w-[620px] text-[.85rem] text-white/75">
				Browse every research-driven innovation by keyword, category, faculty,
				spin-off status or readiness range.
			</p>
		</div>
	</section>

	<main class="mx-auto max-w-[1180px] px-5 py-7">
		<form
			class="mb-6 rounded-[12px] bg-white p-4 shadow-card md:p-5"
			role="search"
			aria-label="Filter innovations"
			@submit.prevent
		>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
				<label class="field">
					<span>Keyword</span>
					<input
						v-model.trim="filters.name"
						type="search"
						placeholder="Search title"
					/>
				</label>
				<label class="field">
					<span>Researcher</span>
					<input
						v-model.trim="filters.researcher_name"
						type="search"
						placeholder="Search researcher"
					/>
				</label>
				<label class="field">
					<span>Category</span>
					<select v-model="filters.category">
						<option value="">All categories</option>
						<option
							v-for="c in PRODUCT_CATEGORY"
							:key="c.value"
							:value="c.value"
						>
							{{ c.label }}
						</option>
					</select>
				</label>
				<label class="field">
					<span>Faculty</span>
					<select v-model="filters.faculty">
						<option value="">All faculties</option>
						<option v-for="f in facultyOptions" :key="f.value" :value="f.value">
							{{ f.label }}
						</option>
					</select>
				</label>
			</div>

			<div
				class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3"
			>
				<div class="flex flex-wrap items-center gap-3">
					<label class="flex items-center gap-2 text-[.78rem] text-muted">
						Spin-off
						<select
							v-model="filters.spinOff"
							class="h-9 rounded-md border border-line px-2 text-[.78rem]"
						>
							<option value="">All</option>
							<option value="1">Yes</option>
							<option value="0">No</option>
						</select>
					</label>
					<label class="flex items-center gap-2 text-[.78rem] text-muted">
						TRL from
						<select
							:value="filters.trl_min"
							class="h-9 rounded-md border border-line px-2 text-[.78rem]"
							@change="onTrlMinChange"
						>
							<option v-for="n in TRL_MAX" :key="`min-${n}`" :value="n">
								{{ n }}
							</option>
						</select>
					</label>
					<label class="flex items-center gap-2 text-[.78rem] text-muted">
						to
						<select
							:value="filters.trl_max"
							class="h-9 rounded-md border border-line px-2 text-[.78rem]"
							@change="onTrlMaxChange"
						>
							<option v-for="n in TRL_MAX" :key="`max-${n}`" :value="n">
								{{ n }}
							</option>
						</select>
					</label>
					<button
						type="button"
						class="text-[.75rem] font-semibold text-brandblue"
						@click="resetFilters"
					>
						Clear all
					</button>
				</div>
				<p class="m-0 text-[.78rem] text-muted">
					<template v-if="state.loading">Loading…</template>
					<template v-else>
						<b class="text-navy">{{ total }}</b> result{{
							total === 1 ? "" : "s"
						}}
						found
					</template>
				</p>
			</div>
		</form>

		<div
			v-if="state.error"
			role="alert"
			class="mb-[18px] flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#f0c6c6] bg-[#fdf3f3] px-4 py-3 text-[.82rem] text-[#a32b2b]"
		>
			<span>{{ state.error }}</span>
			<button type="button" class="load-btn" @click="reload">Retry</button>
		</div>

		<div
			v-if="!state.error && !state.loading && visibleProducts.length === 0"
			class="rounded-[14px] border border-dashed border-[#bac7d8] p-10 text-center md:p-[50px]"
		>
			<Search class="mx-auto h-8 w-8 text-brandblue" />
			<h2 class="mb-1 mt-2.5 text-[1.05rem] font-bold">
				No matching innovations
			</h2>
			<p class="m-0 text-[.85rem] text-muted">
				Try a different keyword, category, faculty or readiness range.
			</p>
			<button type="button" class="load-btn mt-4" @click="resetFilters">
				Reset filters
			</button>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
			<template v-if="state.loading && !state.products.length">
				<div
					v-for="n in 8"
					:key="`skeleton-${n}`"
					class="h-[352px] animate-pulse rounded-[9px] bg-white shadow-card"
					aria-hidden="true"
				></div>
			</template>
			<InnovationCard
				v-for="item in visibleProducts"
				:key="item.id"
				:product="item"
			/>
		</div>

		<div
			v-if="hasMore && visibleProducts.length"
			class="mt-7 flex justify-center"
		>
			<button
				type="button"
				class="outline-btn"
				:disabled="state.loadingMore"
				@click="loadMore"
			>
				{{ state.loadingMore ? "Loading…" : "Load more" }}
				<ArrowRight class="h-3.5 w-3.5" />
			</button>
		</div>
	</main>
</template>

<style scoped>
	.field {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.field span {
		font-size: 0.7rem;
		font-weight: 700;
		color: #63708a;
	}
	.field input,
	.field select {
		height: 40px;
		border: 1px solid #dce4ef;
		border-radius: 6px;
		padding: 0 10px;
		font-size: 0.8rem;
		background: #fff;
	}
	.field input:focus,
	.field select:focus {
		outline: 2px solid #315fde33;
		border-color: #315fde;
	}
	.load-btn {
		border: 1px solid #9cadc5;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 0.75rem;
		font-weight: 700;
		color: #061a39;
	}
	.load-btn:hover {
		border-color: #315fde;
		color: #315fde;
	}
</style>
