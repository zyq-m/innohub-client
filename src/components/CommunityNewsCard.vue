<script setup lang="ts">
import { computed, ref } from 'vue';
import { CalendarDays, ChevronRight, Newspaper } from 'lucide-vue-next';
import {
	communityNewsCover,
	formatActivityDate,
	type CommunityNews,
} from '../data/communityNews';

const props = defineProps<{ item: CommunityNews }>();

const imageFailed = ref(false);
const cover = computed(() => communityNewsCover(props.item));
const showImage = computed(() => Boolean(cover.value) && !imageFailed.value);
const date = computed(() => formatActivityDate(props.item.activityDate));
</script>

<template>
	<article
		class="flex min-w-0 flex-col overflow-hidden rounded-[9px] bg-white shadow-card transition duration-200 hover:-translate-y-[5px] hover:shadow-[0_16px_35px_rgba(10,35,73,.13)]"
	>
		<div class="relative h-[170px] overflow-hidden">
			<img
				v-if="showImage"
				:src="cover"
				:alt="item.newsTitle"
				loading="lazy"
				class="h-full w-full object-cover"
				@error="imageFailed = true"
			/>
			<div
				v-else
				class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0b3a2e,#0b5c6b)]"
			>
				<Newspaper class="h-9 w-9 text-white/30" />
			</div>
			<span
				v-if="item.level"
				class="absolute left-[12px] top-[12px] rounded-full bg-navy/85 px-2.5 py-1 text-[.62rem] font-extrabold uppercase tracking-wide text-white shadow-[0_5px_15px_rgba(0,0,0,.15)]"
				>{{ item.level }}</span
			>
			<span
				v-if="item.featured"
				class="absolute right-[12px] top-[12px] rounded-full bg-gold px-2.5 py-1 text-[.62rem] font-extrabold uppercase tracking-wide text-navy shadow-[0_5px_15px_rgba(0,0,0,.15)]"
				>Featured</span
			>
		</div>

		<div class="flex flex-1 flex-col px-[15px] pb-[13px] pt-[13px]">
			<small class="text-[.62rem] font-normal text-brandblue">
				{{ item.topic || 'Community news' }}
			</small>
			<h3 class="my-[5px] line-clamp-2 text-[.9rem] font-bold leading-[1.45]">
				<RouterLink
					:to="{ name: 'community-news-item', params: { slug: item.slug } }"
					class="hover:text-brandblue"
				>
					{{ item.newsTitle }}
				</RouterLink>
			</h3>
			<p class="m-0 line-clamp-2 flex-1 text-[.76rem] leading-[1.55] text-muted">
				{{ item.summary || '' }}
			</p>
			<div class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
				<span v-if="date" class="inline-flex shrink-0 items-center gap-1 text-[.66rem] font-semibold text-muted">
					<CalendarDays class="h-3.5 w-3.5" />
					{{ date }}
				</span>
				<span v-else class="truncate text-[.68rem] font-semibold text-muted">
					{{ item.activityLocation || '' }}
				</span>
				<RouterLink
					:to="{ name: 'community-news-item', params: { slug: item.slug } }"
					class="inline-flex shrink-0 items-center gap-1 text-[.7rem] font-bold text-brandblue hover:underline"
				>
					Read news
					<ChevronRight class="h-3.5 w-3.5" />
				</RouterLink>
			</div>
		</div>
	</article>
</template>
