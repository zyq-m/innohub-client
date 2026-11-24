<script setup lang="ts">
	import { ChevronRight, Search } from "lucide-vue-next";
	import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from "vue";
	import { RouterLink } from "vue-router";
	import heroFallback from "../assets/hero.png";
	import { registerHeroSearch } from "../composables/useHeroSearch";
	import { useMarketplace } from "../composables/useMarketplace";
	import { useProducts } from "../composables/useProducts";
	import { content, pathwayIconColors, pathways, popular } from "../data/site";
	import { contentAssetUrl } from "../lib/contentApi";
	import { fetchHeroSetting } from "../services/hero";

	const { filters, setFilters } = useProducts();
	const { closeMobileMenu } = useMarketplace();

	const searchInput = ref<HTMLInputElement | null>(null);
	watchEffect(() => registerHeroSearch(searchInput.value));

	const uploadedImages = ref<string[]>([]);
	const activeSlide = ref(0);
	let slideTimer: number | undefined;

	const slides = computed(() =>
		uploadedImages.value.length > 0 ? uploadedImages.value : [heroFallback],
	);

	function startSlideshow(): void {
		if (slideTimer) window.clearInterval(slideTimer);
		if (slides.value.length < 2) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		slideTimer = window.setInterval(() => {
			activeSlide.value = (activeSlide.value + 1) % slides.value.length;
		}, 6000);
	}

	onMounted(async () => {
		const hero = await fetchHeroSetting();
		if (hero?.images?.length) {
			uploadedImages.value = hero.images.map((image) => contentAssetUrl(image));
			activeSlide.value = 0;
		}
		startSlideshow();
	});

	onBeforeUnmount(() => {
		if (slideTimer) window.clearInterval(slideTimer);
	});

	function goToResults() {
		document
			.getElementById("innovations")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	function searchFor(term: string) {
		setFilters({ name: term });
		closeMobileMenu();
		goToResults();
	}
</script>

<template>
	<section
		class="relative flex min-h-0 items-center overflow-hidden bg-[center_53%] text-white md:min-h-[435px]"
	>
		<div class="absolute inset-0">
			<div
				v-for="(src, i) in slides"
				:key="`${src}-${i}`"
				class="absolute inset-0 bg-cover bg-[center_53%] transition-opacity duration-1000 ease-in-out"
				:class="i === activeSlide ? 'opacity-100' : 'opacity-0'"
				:style="{ backgroundImage: `url(${src})` }"
				aria-hidden="true"
			></div>
		</div>
		<div class="hero-shade"></div>
		<div
			class="relative mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-8 px-6 py-[30px] md:grid-cols-[minmax(0,1fr)_265px] md:gap-10 md:px-5 md:py-[31px] lg:grid-cols-[minmax(0,1fr)_275px] lg:gap-[75px] lg:pb-[72px] lg:pr-[70px] lg:pt-[31px]"
		>
			<div class="max-w-[600px] md:self-center">
				<h1
					class="my-0 text-[2.15rem] font-extrabold leading-[1.13] tracking-[-.022em] sm:text-[2.8rem] md:text-[2.65rem] lg:text-[3rem]"
				>
					{{ content.hero_heading }}<br /><span class="hero-title-accent">{{
						content.hero_accent
					}}</span>
				</h1>
				<p
					class="mb-[19px] max-w-[540px] text-[.9rem] leading-[1.55] text-white/85 sm:text-[1rem]"
				>
					{{ content.hero_description }}
				</p>

				<form
					class="flex h-12 max-w-[510px] items-center rounded-[28px] bg-white pl-2 text-ink shadow-[0_15px_35px_rgba(0,0,0,.18)]"
					@submit.prevent="goToResults"
					role="search"
				>
					<label class="sr-only" for="hero-search"
						>Search the marketplace</label
					>
					<input
						id="hero-search"
						ref="searchInput"
						v-model.trim="filters.name"
						type="search"
						placeholder="Search innovations, technologies, services…"
						aria-label="Search the marketplace"
						class="min-w-0 flex-1 bg-transparent px-3 text-[.75rem] outline-none sm:text-[.84rem]"
					/>
					<button
						class="mx-0 flex h-12 w-[61px] shrink-0 items-center justify-center rounded-[10px_26px_26px_10px] bg-gold text-[1.2rem] transition hover:bg-[#ffe175]"
						type="submit"
						aria-label="Show search results"
					>
						<Search class="h-5 w-5" />
					</button>
				</form>

				<div
					class="mt-[15px] flex flex-wrap items-center gap-2 text-[.75rem]"
					aria-label="Popular searches"
				>
					<span class="mr-1 text-[.7rem] font-bold text-white">{{
						content.popular_label
					}}</span>
					<button
						v-for="(term, i) in popular"
						:key="term"
						type="button"
						@click="searchFor(term)"
						class="rounded-[5px] bg-white/10 px-2.5 py-[5px] text-[.65rem] text-white transition hover:bg-white/20"
						:class="{ 'hidden sm:inline-block': i > 2 }"
					>
						{{ term }}
					</button>
				</div>
			</div>

			<aside
				class="mt-6 max-w-[520px] self-stretch rounded-[10px] p-4 shadow-[0_7px_24px_rgba(0,0,0,.2)] md:mt-0 md:max-w-none md:self-center md:bg-[linear-gradient(155deg,rgba(11,46,99,.88),rgba(2,21,34,.91))]"
				aria-labelledby="pathway-title"
			>
				<p id="pathway-title" class="mb-[11px] mt-0 text-[.94rem] font-bold">
					I am looking for
				</p>
				<component
					:is="path.route ? RouterLink : 'a'"
					v-for="(path, i) in pathways"
					:key="path.title"
					:to="path.route || undefined"
					:href="path.route ? undefined : '#' + path.target"
					class="grid grid-cols-[29px_1fr_10px] items-center gap-2.5 border-t border-white/[.13] py-2.5 text-white first-of-type:border-t-0 cursor-pointer"
				>
					<component
						:is="path.icon"
						class="h-6 w-6"
						:style="{ color: pathwayIconColors[i] }"
					/>
					<span>
						<b class="block text-[.8rem] sm:text-[.9rem]">{{ path.title }}</b>
						<small
							class="block text-[.65rem] leading-[1.4] text-white sm:text-[.76rem]"
							>{{ path.description }}</small
						>
					</span>
					<ChevronRight class="h-3 w-3 text-white/70" />
				</component>
			</aside>
		</div>
	</section>
</template>
