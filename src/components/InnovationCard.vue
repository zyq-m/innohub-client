<script setup lang="ts">
import { computed, ref } from 'vue';
import { Bookmark, Cpu } from 'lucide-vue-next';
import { useMarketplace } from '../composables/useMarketplace';
import type { Product } from '../data/products';

const props = defineProps<{ product: Product }>();

const { isSaved, toggleSaved } = useMarketplace();

const imageFailed = ref(false);

const showImage = computed(() => Boolean(props.product.image) && !imageFailed.value);

const trlLabel = computed(() => (props.product.trl === null ? 'TRL n/a' : `TRL ${props.product.trl}`));

const trlBackground = computed(() => {
	const trl = props.product.trl;
	if (trl === null) return '#8b97a8';
	if (trl <= 3) return '#079cc0';
	if (trl <= 6) return '#315fde';
	return '#0b9e65';
});
</script>

<template>
	<article
		class="flex min-w-0 flex-col overflow-hidden rounded-[9px] bg-white shadow-card transition duration-200 hover:-translate-y-[5px] hover:shadow-[0_16px_35px_rgba(10,35,73,.13)]"
	>
		<div class="relative h-[230px] overflow-hidden sm:h-[200px] md:h-[150px] lg:h-[166px]">
			<img
				v-if="showImage"
				:src="product.image"
				:alt="product.title"
				loading="lazy"
				class="h-full w-full object-cover"
				@error="imageFailed = true"
			/>
			<div
				v-else
				class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a2854,#0b5c6b)]"
			>
				<Cpu class="h-9 w-9 text-white/30" />
			</div>
			<span
				class="absolute right-[10px] top-[14px] rounded-[99px] px-[13px] py-1 text-[.7rem] font-extrabold text-white shadow-[0_5px_15px_rgba(0,0,0,.18)]"
				:style="{ background: trlBackground }"
				>{{ trlLabel }}</span
			>
		</div>

		<div class="flex-1 px-[15px] pb-[11px] pt-[13px]">
			<small class="text-[.62rem] font-normal text-brandblue">{{
				product.categoryLabel || 'Uncategorised'
			}}</small>
			<h3 class="my-[5px] line-clamp-2 text-[.9rem] font-bold leading-[1.45]">
				<RouterLink :to="{ name: 'innovation-detail', params: { id: product.id } }" class="hover:text-brandblue">{{
					product.title
				}}</RouterLink>
			</h3>
			<p class="m-0 line-clamp-2 text-[.74rem] leading-[1.55] text-muted">{{ product.summary }}</p>
		</div>

		<div
			class="flex items-center justify-between border-t border-[#edf0f4] px-[15px] py-[11px]"
		>
			<RouterLink
				:to="{ name: 'innovation-detail', params: { id: product.id } }"
				class="text-[.72rem] font-bold text-navy transition hover:text-brandblue"
				>View Details</RouterLink
			>
			<button
				class="px-0.5 text-navy transition hover:text-brandblue"
				type="button"
				@click="toggleSaved(product.id)"
				:aria-label="isSaved(product.id) ? 'Remove from saved' : 'Save innovation'"
			>
				<Bookmark
					:fill="isSaved(product.id) ? 'currentColor' : 'none'"
					class="h-[1.15rem] w-[1.15rem]"
				/>
			</button>
		</div>
	</article>
</template>
