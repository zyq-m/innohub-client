<script setup lang="ts">
	import { ArrowLeft, ExternalLink, Trophy } from "lucide-vue-next";
import ImageCarousel from "../components/ImageCarousel.vue";
	import { computed, ref, watch } from "vue";
	import { useRoute } from "vue-router";
	import {
		formatAchievementDate,
		successStoryCover,
		successStoryGallery,
		successStoryInfo,
		successStorySections,
		type SuccessStory,
	} from "../data/successStories";
	import { setPageTitle } from "../lib/seo";
	import { fetchSuccessStoryBySlug } from "../services/successStories";

	const route = useRoute();

	const story = ref<SuccessStory | null>(null);
	const loading = ref(true);
	const notFound = ref(false);
	const error = ref("");
	const cover = computed(() =>
		story.value ? successStoryCover(story.value) : "",
	);
	const gallery = computed(() =>
		story.value ? successStoryGallery(story.value) : [],
	);
	const photos = computed(() => [cover.value, ...gallery.value].filter(Boolean));
	const info = computed(() =>
		story.value ? successStoryInfo(story.value) : [],
	);
	const sections = computed(() =>
		story.value ? successStorySections(story.value) : [],
	);
	const date = computed(() =>
		story.value ? formatAchievementDate(story.value.achievementDate) : "",
	);

	async function load(slug: string): Promise<void> {
		loading.value = true;
		notFound.value = false;
		error.value = "";
		story.value = null;

		try {
			story.value = await fetchSuccessStoryBySlug(slug);
			setPageTitle(story.value.achievementTitle);
		} catch (err) {
			const status = (err as { response?: { status?: number } })?.response
				?.status;
			notFound.value = status === 404;
			error.value =
				status === 404
					? ""
					: err instanceof Error
						? err.message
						: "Unable to load.";
		} finally {
			loading.value = false;
		}
	}

	watch(
		() => route.params.slug,
		(slug) => {
			if (typeof slug === "string" && slug) void load(slug);
			else {
				loading.value = false;
				notFound.value = true;
			}
		},
		{ immediate: true },
	);
</script>

<template>
	<main class="mx-auto max-w-[1000px] px-5 py-8">
		<RouterLink
			:to="{ name: 'stories' }"
			class="mb-5 inline-flex items-center gap-1.5 text-[.8rem] font-bold text-brandblue transition hover:text-navy"
		>
			<ArrowLeft class="h-4 w-4" />
			All success stories
		</RouterLink>

		<div v-if="loading" class="space-y-4" aria-hidden="true">
			<div
				class="h-[240px] animate-pulse rounded-[12px] bg-white shadow-card md:h-[320px]"
			></div>
			<div class="h-6 w-2/3 animate-pulse rounded bg-white shadow-card"></div>
			<div class="h-4 w-1/3 animate-pulse rounded bg-white shadow-card"></div>
		</div>

		<div
			v-else-if="notFound"
			class="rounded-[12px] border border-line bg-white p-10 text-center"
		>
			<Trophy class="mx-auto mb-3 h-9 w-9 text-muted" />
			<p class="m-0 text-[.95rem] font-bold text-navy">
				Success story not found.
			</p>
			<p class="mb-5 mt-1 text-[.82rem] text-muted">
				It may have been unpublished or removed.
			</p>
			<RouterLink :to="{ name: 'stories' }" class="outline-btn"
				>Browse all stories</RouterLink
			>
		</div>

		<div
			v-else-if="error"
			class="rounded-[12px] border border-line bg-white p-8 text-center"
		>
			<p class="m-0 text-[.85rem] text-[#b3261e]">{{ error }}</p>
			<button
				type="button"
				class="outline-btn mt-4"
				@click="story && load(story.slug)"
			>
				Try again
			</button>
		</div>

		<template v-else-if="story">
			<ImageCarousel
				v-if="photos.length"
				:images="photos"
				:alt-base="story.achievementTitle"
				class="mb-7"
			/>
			<span
				v-else
				class="mb-7 grid h-[210px] w-full place-items-center overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,#082652,#3a2a63)] shadow-card md:h-[320px]"
			>
				<Trophy class="h-12 w-12 text-white/30" />
			</span>

			<div class="mb-5 flex flex-wrap items-center gap-2">
				<span
					class="text-[.7rem] font-bold uppercase tracking-[.06em] text-brandblue"
				>
					{{ story.achievementType || "Success story" }}
				</span>
				<span
					v-if="story.level"
					class="rounded-full bg-navy px-2.5 py-0.5 text-[.62rem] font-extrabold uppercase text-white"
					>{{ story.level }}</span
				>
				<span v-if="date" class="text-[.72rem] text-muted">{{ date }}</span>
				<span
					v-if="story.featured"
					class="rounded-full bg-gold px-2.5 py-0.5 text-[.62rem] font-extrabold uppercase text-navy"
					>Featured</span
				>
			</div>

			<h1
				class="mb-4 mt-0 text-[1.5rem] font-extrabold leading-[1.2] tracking-[-.02em] md:text-[2rem]"
			>
				{{ story.achievementTitle }}
			</h1>

			<div
				class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_max-content] lg:items-start"
			>
				<div>
					<section
						v-for="section in sections"
						:key="section.title"
						class="mb-6"
					>
						<h2 class="mb-2 mt-0 text-[1.05rem] font-bold text-navy">
							{{ section.title }}
						</h2>
						<p
							class="m-0 whitespace-pre-line text-[.95rem] leading-[1.7] text-[#4a5870]"
						>
							{{ section.body }}
						</p>
					</section>

					<div class="flex flex-wrap gap-3">
						<a
							v-if="story.evidenceUrl"
							:href="story.evidenceUrl"
							target="_blank"
							rel="noopener"
							class="outline-btn"
						>
							View evidence / reference
							<ExternalLink class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>

				<aside
					class="rounded-[12px] border border-line bg-white p-5 shadow-card lg:max-w-[360px] lg:justify-self-end"
				>
					<h2 class="mb-4 mt-0 text-[.95rem] font-bold text-navy">
						Achievement profile
					</h2>
					<dl class="m-0 space-y-3.5">
						<div v-for="item in info" :key="item.label">
							<dt
								class="text-[.68rem] font-bold uppercase tracking-[.05em] text-muted"
							>
								{{ item.label }}
							</dt>
							<dd class="m-0 mt-0.5 break-words text-[.85rem] text-[#33415b]">
								<a
									v-if="item.href"
									:href="item.href"
									class="font-semibold text-brandblue hover:text-navy"
									>{{ item.value }}</a
								>
								<template v-else>{{ item.value }}</template>
							</dd>
						</div>
					</dl>
				</aside>
			</div>

		</template>
	</main>
</template>
