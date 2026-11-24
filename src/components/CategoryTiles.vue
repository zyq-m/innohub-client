<script setup lang="ts">
	import { Globe, X } from "lucide-vue-next";
	import { useRouter } from "vue-router";
	import { useProducts } from "../composables/useProducts";
	import {
		CATEGORY_COLORS,
		CATEGORY_ICONS,
		PRODUCT_CATEGORY,
	} from "../data/products";
	import { content } from "../data/site";

	const router = useRouter();
	const { filters, setFilters } = useProducts();

	function selectCategory(value: string) {
		setFilters({ category: value });
		void router.push({ path: "/innovations", query: { category: value } });
	}

	function clearCategory() {
		setFilters({ category: "" });
	}
</script>

<template>
	<section
		id="categories"
		class="mx-auto max-w-[1180px] px-5 pb-5 pt-6 md:px-3 md:pb-5 md:pt-[18px]"
	>
		<div class="mb-3 flex flex-wrap items-center justify-between gap-4">
			<h2
				class="my-0 text-[1.15rem] font-bold leading-[1.3] tracking-[-.02em] lg:text-[1.2rem]"
			>
				<Globe class="mr-3 h-5 w-5 align-[-3px] text-[#15956e]" />
				{{ content.categories_title }}
			</h2>
			<button
				v-if="filters.category"
				type="button"
				class="outline-btn"
				@click="clearCategory"
			>
				{{ content.categories_all_label }}
				<X class="h-3 w-3" />
			</button>
		</div>

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
			<button
				v-for="(category, i) in PRODUCT_CATEGORY"
				:key="category.value"
				type="button"
				class="flex min-h-[122px] flex-col items-center justify-center gap-[13px] rounded-[10px] border bg-white/[.85] px-[11px] pb-3 pt-[15px] text-center text-[#08172e] shadow-[0_4px_12px_rgba(18,50,74,.03)] transition hover:-translate-y-[3px] hover:shadow-[0_5px_16px_rgba(24,56,92,.09)] md:min-h-[108px] md:px-2 lg:min-h-[122px] lg:px-[11px]"
				:class="
					filters.category === category.value
						? 'border-[#089b95] shadow-[0_5px_16px_rgba(24,56,92,.14)]'
						: 'border-white'
				"
				:aria-pressed="filters.category === category.value"
				@click="selectCategory(category.value)"
			>
				<component
					:is="CATEGORY_ICONS[category.value] || Globe"
					class="h-8 w-8 lg:h-[2rem] lg:w-[2rem]"
					:style="{ color: CATEGORY_COLORS[i] }"
				/>
				<span
					class="text-[.75rem] leading-[1.5] md:text-[.67rem] lg:text-[.77rem]"
					>{{ category.label }}</span
				>
			</button>
		</div>
	</section>
</template>
