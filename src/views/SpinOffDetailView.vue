<script setup lang="ts">
	import { ArrowLeft, Briefcase, ExternalLink } from "lucide-vue-next";
	import { computed, ref, watch } from "vue";
	import { useRoute } from "vue-router";
	import ImageCarousel from "../components/ImageCarousel.vue";
	import {
		spinOffCover,
		spinOffGallery,
		spinOffInfo,
		spinOffSections,
		type SpinOff,
	} from "../data/spinoffs";
	import { setPageTitle } from "../lib/seo";
	import { fetchSpinOffBySlug } from "../services/spinoffs";

	const route = useRoute();

	const spinOff = ref<SpinOff | null>(null);
	const loading = ref(true);
	const notFound = ref(false);
	const error = ref("");
	const cover = computed(() =>
		spinOff.value ? spinOffCover(spinOff.value) : "",
	);
	const gallery = computed(() =>
		spinOff.value ? spinOffGallery(spinOff.value) : [],
	);
	const photos = computed(() =>
		[cover.value, ...gallery.value].filter(Boolean),
	);
	const info = computed(() =>
		spinOff.value ? spinOffInfo(spinOff.value) : [],
	);
	const sections = computed(() =>
		spinOff.value ? spinOffSections(spinOff.value) : [],
	);

	async function load(slug: string): Promise<void> {
		loading.value = true;
		notFound.value = false;
		error.value = "";
		spinOff.value = null;

		try {
			spinOff.value = await fetchSpinOffBySlug(slug);
			setPageTitle(spinOff.value.companyName);
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
			:to="{ name: 'spin-offs' }"
			class="mb-5 inline-flex items-center gap-1.5 text-[.8rem] font-bold text-brandblue transition hover:text-navy"
		>
			<ArrowLeft class="h-4 w-4" />
			All spin-off companies
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
			<Briefcase class="mx-auto mb-3 h-9 w-9 text-muted" />
			<p class="m-0 text-[.95rem] font-bold text-navy">
				Spin-off company not found.
			</p>
			<p class="mb-5 mt-1 text-[.82rem] text-muted">
				It may have been unpublished or removed.
			</p>
			<RouterLink :to="{ name: 'spin-offs' }" class="outline-btn"
				>Browse all companies</RouterLink
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
				@click="spinOff && load(spinOff.slug)"
			>
				Try again
			</button>
		</div>

		<template v-else-if="spinOff">
			<ImageCarousel
				v-if="photos.length"
				:images="photos"
				:alt-base="spinOff.companyName"
				class="mb-7"
			/>
			<span
				v-else
				class="mb-7 grid h-[210px] w-full place-items-center overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,#0a2854,#0b5c6b)] shadow-card md:h-[320px]"
			>
				<Briefcase class="h-12 w-12 text-white/30" />
			</span>

			<div class="mb-5 flex flex-wrap items-center gap-2">
				<span
					class="text-[.7rem] font-bold uppercase tracking-[.06em] text-brandblue"
				>
					{{ spinOff.technologyField || "Spin-off company" }}
				</span>
				<span
					v-if="spinOff.featured"
					class="rounded-full bg-gold px-2.5 py-0.5 text-[.62rem] font-extrabold uppercase text-navy"
					>Featured</span
				>
			</div>

			<h1
				class="mb-4 mt-0 text-[1.5rem] font-extrabold leading-[1.2] tracking-[-.02em] md:text-[2rem]"
			>
				{{ spinOff.companyName }}
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
						<p class="m-0 text-[.95rem] leading-[1.7] text-[#4a5870]">
							{{ section.body }}
						</p>
					</section>

					<div class="flex flex-wrap gap-3">
						<a
							v-if="spinOff.websiteUrl"
							:href="spinOff.websiteUrl"
							target="_blank"
							rel="noopener"
							class="outline-btn"
						>
							Visit website
							<ExternalLink class="h-3.5 w-3.5" />
						</a>
					</div>
				</div>

				<aside
					class="rounded-[12px] border border-line bg-white p-5 shadow-card lg:max-w-[360px] lg:justify-self-end"
				>
					<h2 class="mb-4 mt-0 text-[.95rem] font-bold text-navy">
						Company profile
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
