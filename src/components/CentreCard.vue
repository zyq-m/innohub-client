<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronRight, Landmark } from 'lucide-vue-next';
import { centreCover, type Centre } from '../data/centres';

const props = defineProps<{ centre: Centre }>();

const imageFailed = ref(false);
const cover = computed(() => centreCover(props.centre));
const showImage = computed(() => Boolean(cover.value) && !imageFailed.value);
</script>

<template>
	<article
		class="flex min-w-0 flex-col overflow-hidden rounded-[9px] bg-white shadow-card transition duration-200 hover:-translate-y-[5px] hover:shadow-[0_16px_35px_rgba(10,35,73,.13)]"
	>
		<div class="relative h-[170px] overflow-hidden">
			<img
				v-if="showImage"
				:src="cover"
				:alt="centre.officialName"
				loading="lazy"
				class="h-full w-full object-cover"
				@error="imageFailed = true"
			/>
			<div
				v-else
				class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a2854,#0b5c6b)]"
			>
				<Landmark class="h-9 w-9 text-white/30" />
			</div>
			<span
				v-if="centre.featured"
				class="absolute right-[10px] top-[14px] rounded-[99px] bg-gold px-[13px] py-1 text-[.7rem] font-extrabold text-navy shadow-[0_5px_15px_rgba(0,0,0,.18)]"
				>Featured</span
			>
		</div>

		<div class="flex flex-1 flex-col px-[15px] pb-[13px] pt-[13px]">
			<small class="text-[.62rem] font-normal text-brandblue">
				{{ centre.expertise ? centre.expertise.split(',')[0] : 'CoE / Institute' }}
			</small>
			<h3 class="my-[5px] line-clamp-2 text-[.9rem] font-bold leading-[1.45]">
				<RouterLink
					:to="{ name: 'centre', params: { slug: centre.slug } }"
					class="hover:text-brandblue"
				>
					{{ centre.officialName }}
				</RouterLink>
			</h3>
			<p class="m-0 line-clamp-2 flex-1 text-[.76rem] leading-[1.55] text-muted">
				{{ centre.mission || '' }}
			</p>
			<div class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
				<span class="truncate text-[.68rem] font-semibold text-muted">
					{{ centre.director || '' }}
				</span>
				<RouterLink
					:to="{ name: 'centre', params: { slug: centre.slug } }"
					class="inline-flex shrink-0 items-center gap-1 text-[.7rem] font-bold text-brandblue hover:underline"
				>
					View profile
					<ChevronRight class="h-3.5 w-3.5" />
				</RouterLink>
			</div>
		</div>
	</article>
</template>
