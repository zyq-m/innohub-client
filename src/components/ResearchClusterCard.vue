<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ChevronRight, Network } from 'lucide-vue-next';
import { researchGroupCover, type ResearchGroup } from '../data/researchGroups';

const props = defineProps<{
	kluster: ResearchGroup;
	sigCount?: number;
	rgCount?: number;
}>();

const imageFailed = ref(false);
const cover = computed(() => researchGroupCover(props.kluster));
const showImage = computed(() => Boolean(cover.value) && !imageFailed.value);
</script>

<template>
	<component
		:is="kluster.slug ? RouterLink : 'article'"
		:to="kluster.slug ? { name: 'research-cluster', params: { slug: kluster.slug } } : undefined"
		class="group flex min-w-0 flex-col overflow-hidden rounded-[9px] bg-white shadow-card transition duration-200 hover:-translate-y-[5px] hover:shadow-[0_16px_35px_rgba(10,35,73,.13)]"
	>
		<div class="relative h-[150px] overflow-hidden">
			<img
				v-if="showImage"
				:src="cover"
				:alt="kluster.groupName"
				loading="lazy"
				class="h-full w-full object-cover"
				@error="imageFailed = true"
			/>
			<div
				v-else
				class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0b3b6b,#0b5c6b)]"
			>
				<Network class="h-9 w-9 text-white/30" />
			</div>
		</div>

		<div class="flex flex-1 flex-col p-5">
			<small class="text-[.62rem] font-bold uppercase tracking-[.06em] text-brandblue">
				Research cluster
			</small>
			<h3 class="mb-0 mt-1 text-[.95rem] font-bold leading-[1.4] text-navy">
				{{ kluster.groupName }}
			</h3>
			<p
				v-if="sigCount !== undefined || rgCount !== undefined"
				class="m-0 mt-2 text-[.75rem] text-muted"
			>
				{{ sigCount ?? 0 }} SIG · {{ rgCount ?? 0 }} RG
			</p>
			<span class="mt-4 inline-flex items-center gap-1 text-[.72rem] font-bold text-brandblue">
				Explore cluster
				<ChevronRight class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
			</span>
		</div>
	</component>
</template>
