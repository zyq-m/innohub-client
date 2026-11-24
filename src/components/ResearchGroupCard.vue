<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronRight, FlaskConical } from 'lucide-vue-next';
import { researchGroupCover, type ResearchGroup } from '../data/researchGroups';

const props = defineProps<{ group: ResearchGroup }>();

const imageFailed = ref(false);
const cover = computed(() => researchGroupCover(props.group));
const showImage = computed(() => Boolean(cover.value) && !imageFailed.value);
const typeBadge = computed(() => (props.group.groupType ?? '').trim().toLowerCase());
const badgeClass = computed(() => {
	if (typeBadge.value.startsWith('kluster')) return 'bg-gold text-navy';
	if (typeBadge.value === 'sig') return 'bg-brandblue text-white';
	if (typeBadge.value === 'rg') return 'bg-[#0b5c6b] text-white';
	return 'bg-navy text-white';
});
const lead = computed(() => props.group.leads?.split(/[,;(]/)[0]?.trim() || '');
</script>

<template>
	<article
		class="flex min-w-0 flex-col overflow-hidden rounded-[9px] bg-white shadow-card transition duration-200 hover:-translate-y-[5px] hover:shadow-[0_16px_35px_rgba(10,35,73,.13)]"
	>
		<div class="relative h-[150px] overflow-hidden">
			<img
				v-if="showImage"
				:src="cover"
				:alt="group.groupName"
				loading="lazy"
				class="h-full w-full object-cover"
				@error="imageFailed = true"
			/>
			<div
				v-else
				class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0b3b6b,#0b5c6b)]"
			>
				<FlaskConical class="h-9 w-9 text-white/30" />
			</div>
			<span
				v-if="group.groupType"
				class="absolute left-[12px] top-[12px] rounded-full px-2.5 py-1 text-[.62rem] font-extrabold uppercase tracking-wide shadow-[0_5px_15px_rgba(0,0,0,.15)]"
				:class="badgeClass"
				>{{ group.groupType }}</span
			>
			<span
				v-if="group.featured"
				class="absolute right-[12px] top-[12px] rounded-full bg-white/95 px-2.5 py-1 text-[.62rem] font-extrabold uppercase tracking-wide text-gold shadow-[0_5px_15px_rgba(0,0,0,.15)]"
				>Featured</span
			>
		</div>

		<div class="flex flex-1 flex-col px-[15px] pb-[13px] pt-[13px]">
			<small v-if="group.parentCluster" class="text-[.62rem] font-normal text-brandblue">
				{{ group.parentCluster }}
			</small>
			<h3 class="my-[5px] line-clamp-2 text-[.9rem] font-bold leading-[1.45]">
				<RouterLink
					:to="{ name: 'research-partner', params: { slug: group.slug } }"
					class="hover:text-brandblue"
				>
					{{ group.groupName }}
				</RouterLink>
			</h3>
			<p class="m-0 line-clamp-2 flex-1 text-[.76rem] leading-[1.55] text-muted">
				{{ group.focus || group.expertise || '' }}
			</p>
			<div class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
				<span class="truncate text-[.68rem] font-semibold text-muted">{{ lead }}</span>
				<RouterLink
					:to="{ name: 'research-partner', params: { slug: group.slug } }"
					class="inline-flex shrink-0 items-center gap-1 text-[.7rem] font-bold text-brandblue hover:underline"
				>
					View profile
					<ChevronRight class="h-3.5 w-3.5" />
				</RouterLink>
			</div>
		</div>
	</article>
</template>
