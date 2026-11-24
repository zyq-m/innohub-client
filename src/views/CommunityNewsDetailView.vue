<script setup lang="ts">
	import { ArrowLeft, ExternalLink, Newspaper, Quote } from "lucide-vue-next";
	import { computed, ref, watch } from "vue";
	import { useRoute } from "vue-router";
	import ImageCarousel from "../components/ImageCarousel.vue";
	import {
		communityNewsCover,
		communityNewsGallery,
		communityNewsInfo,
		communityNewsSections,
		formatActivityDate,
		type CommunityNews,
	} from "../data/communityNews";
	import { setPageTitle } from "../lib/seo";
	import { fetchCommunityNewsBySlug } from "../services/communityNews";

	const route = useRoute();

	const item = ref<CommunityNews | null>(null);
	const loading = ref(true);
	const notFound = ref(false);
	const error = ref("");
	const cover = computed(() =>
		item.value ? communityNewsCover(item.value) : "",
	);
	const gallery = computed(() =>
		item.value ? communityNewsGallery(item.value) : [],
	);
	const photos = computed(() =>
		[cover.value, ...gallery.value].filter(Boolean),
	);
	const info = computed(() =>
		item.value ? communityNewsInfo(item.value) : [],
	);
	const sections = computed(() =>
		item.value ? communityNewsSections(item.value) : [],
	);
	const date = computed(() =>
		item.value ? formatActivityDate(item.value.activityDate) : "",
	);

	async function load(slug: string): Promise<void> {
		loading.value = true;
		notFound.value = false;
		error.value = "";
		item.value = null;

		try {
			item.value = await fetchCommunityNewsBySlug(slug);
			setPageTitle(item.value.newsTitle);
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
			:to="{ name: 'community-news' }"
			class="mb-5 inline-flex items-center gap-1.5 text-[.8rem] font-bold text-brandblue transition hover:text-navy"
		>
			<ArrowLeft class="h-4 w-4" />
			All community news
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
			<Newspaper class="mx-auto mb-3 h-9 w-9 text-muted" />
			<p class="m-0 text-[.95rem] font-bold text-navy">
				Community news not found.
			</p>
			<p class="mb-5 mt-1 text-[.82rem] text-muted">
				It may have been unpublished or removed.
			</p>
			<RouterLink :to="{ name: 'community-news' }" class="outline-btn"
				>Browse all news</RouterLink
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
				@click="item && load(item.slug)"
			>
				Try again
			</button>
		</div>

		<template v-else-if="item">
			<ImageCarousel
				v-if="photos.length"
				:images="photos"
				:alt-base="item.newsTitle"
				class="mb-7"
			/>
			<span
				v-else
				class="mb-7 grid h-[210px] w-full place-items-center overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,#0b3a2e,#0b5c6b)] shadow-card md:h-[320px]"
			>
				<Newspaper class="h-12 w-12 text-white/30" />
			</span>

			<div class="mb-5 flex flex-wrap items-center gap-2">
				<span
					class="text-[.7rem] font-bold uppercase tracking-[.06em] text-brandblue"
				>
					{{ item.topic || "Community news" }}
				</span>
				<span
					v-if="item.level"
					class="rounded-full bg-navy px-2.5 py-0.5 text-[.62rem] font-extrabold uppercase text-white"
					>{{ item.level }}</span
				>
				<span v-if="date" class="text-[.72rem] text-muted">{{ date }}</span>
				<span
					v-if="item.featured"
					class="rounded-full bg-gold px-2.5 py-0.5 text-[.62rem] font-extrabold uppercase text-navy"
					>Featured</span
				>
			</div>

			<h1
				class="mb-4 mt-0 text-[1.5rem] font-extrabold leading-[1.2] tracking-[-.02em] md:text-[2rem]"
			>
				{{ item.newsTitle }}
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

					<blockquote
						v-if="item.quote"
						class="mb-6 rounded-[10px] border-l-4 border-gold bg-[#fffaf0] px-5 py-4"
					>
						<Quote class="mb-2 h-5 w-5 text-gold" />
						<p class="m-0 text-[.95rem] italic leading-[1.7] text-[#33415b]">
							{{ item.quote }}
						</p>
					</blockquote>

					<div class="flex flex-wrap gap-3">
						<a
							v-if="item.newsUrl"
							:href="item.newsUrl"
							target="_blank"
							rel="noopener"
							class="outline-btn"
						>
							Read the full news
							<ExternalLink class="h-3.5 w-3.5" />
						</a>
						<RouterLink to="/contact" class="outline-btn"
							>Collaborate with us</RouterLink
						>
					</div>
				</div>

				<aside
					class="rounded-[12px] border border-line bg-white p-5 shadow-card lg:max-w-[360px] lg:justify-self-end"
				>
					<h2 class="mb-4 mt-0 text-[.95rem] font-bold text-navy">
						News details
					</h2>
					<dl class="m-0 space-y-3.5">
						<div v-for="entry in info" :key="entry.label">
							<dt
								class="text-[.68rem] font-bold uppercase tracking-[.05em] text-muted"
							>
								{{ entry.label }}
							</dt>
							<dd class="m-0 mt-0.5 break-words text-[.85rem] text-[#33415b]">
								<a
									v-if="entry.href"
									:href="entry.href"
									class="font-semibold text-brandblue hover:text-navy"
									>{{ entry.value }}</a
								>
								<template v-else>{{ entry.value }}</template>
							</dd>
						</div>
					</dl>
				</aside>
			</div>
		</template>
	</main>
</template>
