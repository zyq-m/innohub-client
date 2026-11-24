<script setup lang="ts">
import { content, metrics, metricIconColors } from '../data/site';
</script>

<template>
	<section class="bg-[linear-gradient(110deg,#061a39,#0a2854)] py-9 text-white md:py-12">
		<div class="mx-auto max-w-[1180px] px-5">
			<h1 class="mb-1.5 mt-0 text-[1.6rem] font-extrabold tracking-[-.03em] lg:text-[2rem]">
				{{ content.about_heading }}
			</h1>
			<p class="m-0 max-w-[680px] text-[.85rem] text-white/75">{{ content.about_lead }}</p>
		</div>
	</section>

	<main class="mx-auto max-w-[1180px] px-5 py-8">
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div
				v-for="(metric, i) in metrics"
				:key="metric.label"
				class="rounded-[12px] bg-white p-5 text-center shadow-card"
			>
				<component
					:is="metric.icon"
					class="mx-auto mb-2 h-6 w-6"
					:style="{ color: metricIconColors[i] }"
				/>
				<b class="block text-[1.35rem] text-navy">{{ metric.value }}</b>
				<span class="text-[.75rem] text-muted">{{ metric.label }}</span>
			</div>
		</div>

		<section class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
			<article class="rounded-[12px] bg-white p-6 shadow-card">
				<h2 class="mb-2 mt-0 text-[1.05rem] font-bold">What we do</h2>
				<p class="m-0 text-[.85rem] leading-[1.65] text-[#4a5870]">
					{{ content.story_text }} InnoHub curates the marketplace, supports licensing
					discussions, connects partners with researchers and helps innovations reach the people
					who benefit from them.
				</p>
			</article>
			<article class="rounded-[12px] bg-white p-6 shadow-card">
				<h2 class="mb-2 mt-0 text-[1.05rem] font-bold">Who we work with</h2>
				<p class="m-0 text-[.85rem] leading-[1.65] text-[#4a5870]">
					Industry partners, investors, government agencies, research groups and communities —
					anyone looking for research-led solutions or looking to offer them.
				</p>
				<RouterLink to="/contact" class="outline-btn mt-4">Get in touch</RouterLink>
			</article>
		</section>

		<section class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[12px] bg-white p-6 shadow-card">
			<div>
				<h2 class="mb-1 mt-0 text-[1.05rem] font-bold">Ready to collaborate?</h2>
				<p class="m-0 text-[.83rem] text-muted">{{ content.collaborate_text }}</p>
			</div>
			<RouterLink
				to="/innovations"
				class="rounded-[6px] bg-navy px-5 py-2.5 text-[.8rem] font-bold text-white transition hover:bg-brandblue"
				>Explore innovations</RouterLink
			>
		</section>
	</main>
</template>
