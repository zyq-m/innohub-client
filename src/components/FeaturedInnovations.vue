<script setup lang="ts">
import { useRouter } from 'vue-router';
import { content } from '../data/site';
import { DEFAULT_TRL_MAX, DEFAULT_TRL_MIN, useProducts } from '../composables/useProducts';
import { ArrowRight, Search } from 'lucide-vue-next';
import InnovationCard from './InnovationCard.vue';

const router = useRouter();
const { state, filters, total, isFiltered, visibleProducts, resetFilters, reload } = useProducts();

function viewAll() {
	resetFilters();
	void router.push({ name: 'innovations' });
}
</script>

<template>
	<section
		id="innovations"
		class="mx-auto max-w-[1180px] px-5 pb-[10px] pt-[30px] md:pb-[14px] md:pt-[29px]"
	>
		<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<div class="relative md:pl-[44px]">
				<span class="absolute left-[3px] top-[4px] h-1 w-[22px] bg-gold md:left-0"></span>
				<h2
					class="mb-[7px] mt-0 text-[1.15rem] font-bold leading-[1.3] tracking-[-.02em] lg:text-[1.2rem]"
				>
					{{ content.featured_title }}
				</h2>
				<p class="m-0 text-[.8rem] text-[#444]">{{ content.featured_description }}</p>
			</div>
			<div class="flex items-center gap-3">
				<span v-if="isFiltered" class="text-[.78rem] text-muted"
					>{{ total }} matching results</span
				>
				<button type="button" class="outline-btn" @click="viewAll">
					View all innovations
					<ArrowRight class="h-3.5 w-3.5" />
				</button>
			</div>
		</div>

		<div
			v-if="state.error"
			role="alert"
			class="mb-[18px] flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#f0c6c6] bg-[#fdf3f3] px-4 py-3 text-[.82rem] text-[#a32b2b]"
		>
			<span>{{ state.error }}</span>
			<button
				type="button"
				class="rounded-md border border-[#d79b9b] px-3 py-1.5 text-[.75rem] font-semibold"
				@click="reload"
			>
				Retry
			</button>
		</div>

		<div
			v-if="!state.error && visibleProducts.length === 0 && !state.loading"
			class="mb-[18px] rounded-[14px] border border-dashed border-[#bac7d8] p-10 text-center md:p-[50px]"
		>
			<Search class="mx-auto h-8 w-8 text-brandblue" />
			<h3 class="mb-1 mt-2.5 text-[1.05rem] font-bold">No matching innovations</h3>
			<p class="text-[.85rem] text-muted">
				Try another keyword or adjust the readiness range.
			</p>
			<button
				type="button"
				class="mt-4 rounded-lg bg-navy px-4 py-2.5 text-[.8rem] font-semibold text-white"
				@click="resetFilters"
			>
				Reset filters
			</button>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-4 md:gap-5">
			<template v-if="state.loading && !state.products.length">
				<div
					v-for="n in 4"
					:key="`skeleton-${n}`"
					class="flex flex-col overflow-hidden rounded-[9px] bg-white shadow-card"
					aria-hidden="true"
				>
					<div class="h-[230px] animate-pulse bg-[#e8eef6] sm:h-[200px] md:h-[150px] lg:h-[166px]"></div>
					<div class="flex-1 px-[15px] pb-[11px] pt-[13px]">
						<div class="h-[9px] w-1/3 animate-pulse rounded bg-[#e8eef6]"></div>
						<div class="my-[7px] h-[13px] w-4/5 animate-pulse rounded bg-[#e8eef6]"></div>
						<div class="h-[10px] w-full animate-pulse rounded bg-[#e8eef6]"></div>
						<div class="mt-1.5 h-[10px] w-2/3 animate-pulse rounded bg-[#e8eef6]"></div>
					</div>
					<div class="border-t border-[#edf0f4] px-[15px] py-[11px]">
						<div class="h-[10px] w-20 animate-pulse rounded bg-[#e8eef6]"></div>
					</div>
				</div>
			</template>

			<InnovationCard
				v-for="item in visibleProducts"
				:key="item.id"
				:product="item"
			/>
		</div>

		<p
			v-if="
				filters.trl_min !== DEFAULT_TRL_MIN ||
				filters.trl_max !== DEFAULT_TRL_MAX
			"
			class="mb-0 mt-4 text-center text-[.7rem] text-muted"
		>
			Showing TRL {{ filters.trl_min }}–{{ filters.trl_max }}. Innovations without a
			TRL are always listed.
		</p>
	</section>
</template>
