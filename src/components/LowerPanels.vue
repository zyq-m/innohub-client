<script setup lang="ts">
	import { ArrowRight, ChevronRight, Users } from "lucide-vue-next";
	import { onMounted, ref } from "vue";
	import type { ServiceFacility } from "../data/serviceFacilities";
	import {
		content,
		services as serviceCategories,
		storyStats,
	} from "../data/site";
	import { fetchServiceFacilities } from "../services/serviceFacilities";

	const services = ref<ServiceFacility[]>([]);
	const loading = ref(true);
	const failed = ref(false);

	onMounted(async () => {
		try {
			const result = await fetchServiceFacilities({ limit: 4 });
			services.value = result.rows;
		} catch {
			failed.value = true;
		} finally {
			loading.value = false;
		}
	});
</script>

<template>
	<section
		id="services"
		class="mx-auto max-w-[1180px] px-5 pb-5 pt-6 md:px-3 md:pb-5 md:pt-[18px] grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1.08fr_.95fr] md:gap-[18px]"
	>
		<article
			class="min-h-0 rounded-[10px] bg-white p-6 shadow-[0_8px_25px_rgba(6,30,64,.06)] md:min-h-[265px] md:p-[18px] lg:p-5"
		>
			<div class="flex flex-wrap items-start justify-between gap-2">
				<div>
					<h2
						class="mb-1 mt-0 text-[1.3rem] font-extrabold tracking-[-.03em] md:text-[1.08rem] lg:text-[1.2rem]"
					>
						{{ content.services_title }}
					</h2>
					<p class="m-0 text-[.73rem] text-[#536073]">
						{{ content.services_description }}
					</p>
				</div>
				<RouterLink
					to="/services"
					class="text-[.75rem] font-bold text-brandblue transition hover:text-navy"
					>View All</RouterLink
				>
			</div>
			<ul class="m-0 list-none p-0 pt-3">
				<li
					v-for="service in serviceCategories"
					:key="service.label"
					class="border-t border-line"
				>
					<RouterLink
						:to="{ name: 'services', query: { category: service.label } }"
						class="group grid grid-cols-[26px_1fr_16px] items-center gap-2 py-2.5 text-[.88rem] capitalize transition hover:text-brandblue md:text-[.71rem]"
					>
						<component :is="service.icon" class="h-4 w-4 text-brandblue" />
						<div class="line-clamp-1">{{ service.label }}</div>
						<ChevronRight
							class="h-3 w-3 text-[#9ba7b8] transition group-hover:translate-x-0.5 group-hover:text-brandblue"
						/>
					</RouterLink>
				</li>
			</ul>
		</article>

		<article
			class="min-h-0 rounded-[10px] bg-white p-6 shadow-[0_8px_25px_rgba(6,30,64,.06)] md:min-h-[265px] md:p-[18px] lg:p-5"
		>
			<div class="flex flex-wrap items-start justify-between gap-2">
				<div>
					<h2
						class="mb-1 mt-0 text-[1.3rem] font-extrabold tracking-[-.03em] md:text-[1.08rem] lg:text-[1.2rem]"
					>
						{{ content.story_title }}
					</h2>
					<p class="m-0 text-[.73rem] text-[#536073]">
						{{ content.story_subtitle }}
					</p>
				</div>
				<RouterLink
					to="/stories"
					class="text-[.75rem] font-bold text-brandblue transition hover:text-navy"
					>View All</RouterLink
				>
			</div>
			<blockquote
				class="my-3 rounded-[4px_10px_10px_4px] bg-[linear-gradient(110deg,#f3f7fa,#e8eff5)] p-4 text-[1rem] leading-[1.5] text-[#48566c] md:text-[.78rem]"
			>
				{{ content.story_text }}
			</blockquote>
			<div class="grid grid-cols-3 gap-2">
				<span
					v-for="stat in storyStats"
					:key="stat.label"
					class="border-r border-line pl-1.5 text-[.72rem] text-muted last:border-0"
				>
					<b class="block text-[1.3rem] text-navy">{{ stat.value }}</b
					>{{ stat.label }}
				</span>
			</div>
		</article>

		<article
			id="collaborate"
			class="relative min-h-0 overflow-hidden rounded-[10px] bg-[radial-gradient(at_top_right,#06b2a8,transparent_60%),linear-gradient(145deg,#082652,#075e71)] p-6 text-white shadow-[0_8px_25px_rgba(6,30,64,.06)] md:min-h-[265px] md:p-[18px] lg:p-5"
		>
			<h2
				class="relative z-10 mb-2 mt-0 max-w-[280px] text-[1.3rem] font-extrabold leading-[1.08] tracking-[-.03em] md:text-[1.08rem] lg:text-[1.2rem]"
			>
				{{ content.collaborate_title }}
			</h2>
			<p class="relative z-10 max-w-[285px] text-[.78rem] text-white/70">
				{{ content.collaborate_text }}
			</p>
			<RouterLink
				to="/contact"
				class="relative z-10 mt-4 inline-flex items-center gap-3 rounded-full bg-gold px-4 py-2.5 text-[.78rem] font-extrabold text-navy transition hover:bg-[#ffd76a]"
			>
				{{ content.contact_label }}
				<ChevronRight class="h-3 w-3" />
			</RouterLink>
			<p class="relative z-10 mb-0 mt-3 text-[.7rem] text-white/60">
				{{ content.partner_caption }}
				<ArrowRight class="h-3 w-3 align-[-1px]" />
			</p>
			<Users
				class="pointer-events-none absolute -bottom-8 -right-6 h-40 w-40 text-white/[.07]"
			/>
		</article>
	</section>
</template>
