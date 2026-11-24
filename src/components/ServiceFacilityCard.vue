<script setup lang="ts">
	import { ChevronRight, Wrench } from "lucide-vue-next";
	import { computed, ref } from "vue";
	import {
		serviceFacilityCover,
		type ServiceFacility,
	} from "../data/serviceFacilities";

	const props = defineProps<{ service: ServiceFacility }>();

	const imageFailed = ref(false);
	const cover = computed(() => serviceFacilityCover(props.service));
	const showImage = computed(() => Boolean(cover.value) && !imageFailed.value);
</script>

<template>
	<article
		class="flex min-w-0 flex-col overflow-hidden rounded-[9px] bg-white shadow-card transition duration-200 hover:-translate-y-[5px] hover:shadow-[0_16px_35px_rgba(10,35,73,.13)]"
	>
		<div class="relative h-[170px] overflow-hidden">
			<img
				v-if="showImage"
				:src="cover"
				:alt="service.serviceName"
				loading="lazy"
				class="h-full w-full object-cover"
				@error="imageFailed = true"
			/>
			<div
				v-else
				class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a2854,#0b5c6b)]"
			>
				<Wrench class="h-9 w-9 text-white/30" />
			</div>
			<span
				v-if="service.featured"
				class="absolute right-[10px] top-[14px] rounded-[99px] bg-gold px-[13px] py-1 text-[.7rem] font-extrabold text-navy shadow-[0_5px_15px_rgba(0,0,0,.18)]"
				>Featured</span
			>
		</div>

		<div class="flex flex-1 flex-col px-[15px] pb-[13px] pt-[13px]">
			<small class="text-[.62rem] font-normal text-brandblue">
				{{ service.category || "Services & facilities" }}
			</small>
			<h3 class="my-[5px] line-clamp-2 text-[.9rem] font-bold leading-[1.45]">
				<RouterLink
					:to="{ name: 'service-facility', params: { slug: service.slug } }"
					class="hover:text-brandblue"
				>
					{{ service.serviceName }}
				</RouterLink>
			</h3>
			<p
				class="m-0 line-clamp-2 flex-1 text-[.76rem] leading-[1.55] text-muted"
			>
				{{ service.description || "" }}
			</p>
			<div
				class="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5"
			>
				<span class="truncate text-[.68rem] font-semibold text-muted">
					{{ service.providerUnit || "" }}
				</span>
				<RouterLink
					:to="{ name: 'service-facility', params: { slug: service.slug } }"
					class="inline-flex shrink-0 items-center gap-1 text-[.7rem] font-bold text-brandblue hover:underline"
				>
					View details
					<ChevronRight class="h-3.5 w-3.5" />
				</RouterLink>
			</div>
		</div>
	</article>
</template>
