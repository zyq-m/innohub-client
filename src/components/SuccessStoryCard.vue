<script setup lang="ts">
	import { CalendarDays, ChevronRight, Trophy } from "lucide-vue-next";
	import { computed, ref } from "vue";
	import {
		formatAchievementDate,
		successStoryCover,
		type SuccessStory,
	} from "../data/successStories";

	const props = defineProps<{ story: SuccessStory }>();

	const imageFailed = ref(false);
	const cover = computed(() => successStoryCover(props.story));
	const showImage = computed(() => Boolean(cover.value) && !imageFailed.value);
	const date = computed(() =>
		formatAchievementDate(props.story.achievementDate),
	);
</script>

<template>
	<article
		class="flex min-w-0 overflow-hidden rounded-[9px] bg-white shadow-card transition duration-200 hover:-translate-y-[5px] hover:shadow-[0_16px_35px_rgba(10,35,73,.13)]"
	>
		<div class="flex flex-1 flex-col px-[15px] pb-[13px] pt-[13px]">
			<small class="text-[.62rem] font-normal text-brandblue">
				{{ story.achievementType || "Success story" }}
			</small>
			<div class="flex gap-4 items-center">
				<div class="flex-4">
					<h3 class="my-[5px] line-clamp-2 text-2xl font-bold leading-[1.45]">
						<RouterLink
							:to="{ name: 'story', params: { slug: story.slug } }"
							class="hover:text-brandblue"
						>
							{{ story.achievementTitle }}
						</RouterLink>
					</h3>
					<p
						class="m-0 line-clamp-2 flex-1 text-[.76rem] leading-[1.55] text-muted"
					>
						{{ story.summary || "" }}
					</p>
				</div>

				<div class="flex-1 h-[150px] overflow-hidden rounded">
					<img
						v-if="showImage"
						:src="cover"
						:alt="story.achievementTitle"
						loading="lazy"
						class="h-full w-full object-cover"
						@error="imageFailed = true"
					/>
					<div
						v-else
						class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#082652,#3a2a63)]"
					>
						<Trophy class="h-9 w-9 text-white/30" />
					</div>
					<!-- <span
						v-if="story.level"
						class="absolute left-[12px] top-[12px] rounded-full bg-navy/85 px-2.5 py-1 text-[.62rem] font-extrabold uppercase tracking-wide text-white shadow-[0_5px_15px_rgba(0,0,0,.15)]"
						>{{ story.level }}</span
					>
					<span
						v-if="story.featured"
						class="absolute right-[12px] top-[12px] rounded-full bg-gold px-2.5 py-1 text-[.62rem] font-extrabold uppercase tracking-wide text-navy shadow-[0_5px_15px_rgba(0,0,0,.15)]"
						>Featured</span
					> -->
				</div>
			</div>

			<div
				class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5"
			>
				<span
					v-if="date"
					class="inline-flex shrink-0 items-center gap-1 text-[.66rem] font-semibold text-muted"
				>
					<CalendarDays class="h-3.5 w-3.5" />
					{{ date }}
				</span>
				<span v-else class="truncate text-[.68rem] font-semibold text-muted">
					{{ story.team || "" }}
				</span>
				<RouterLink
					:to="{ name: 'story', params: { slug: story.slug } }"
					class="inline-flex shrink-0 items-center gap-1 text-[.7rem] font-bold text-brandblue hover:underline"
				>
					View story
					<ChevronRight class="h-3.5 w-3.5" />
				</RouterLink>
			</div>
		</div>
	</article>
</template>
