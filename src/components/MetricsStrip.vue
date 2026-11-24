<script setup lang="ts">
	import { metricIconColors, metrics } from "../data/site";
	</script>

<template>
	<section class="mx-auto max-w-[1180px] sm:max-w-[912px] lg:max-w-[1115px]">
		<div
			class="metrics relative z-10 -mt-8 grid grid-cols-2 rounded-2xl bg-white p-3 shadow-panel sm:mx-5 sm:-mt-8 sm:grid-cols-4 lg:-mt-[47px] lg:px-[15px] lg:py-5"
			aria-label="Marketplace statistics"
		>
			<div
				v-for="(metric, i) in metrics"
				:key="metric.label"
				class="flex items-center gap-3.5 sm:gap-[15px]"
			>
				<component
					:is="metric.icon"
					class="h-7 w-7 shrink-0 sm:h-9 sm:w-9"
					:style="{ color: metricIconColors[i] }"
				/>
				<span>
					<strong
						class="block text-[1.35rem] font-extrabold leading-none text-navy sm:text-[1.4rem] lg:text-[1.65rem]"
						>{{ metric.value }}</strong
					>
					<small
						class="mt-1 block text-[.67rem] leading-[1.35] text-[#161e2a] sm:text-[.7rem] lg:text-[.78rem]"
						>{{ metric.label }}</small
					>
				</span>
			</div>
		</div>
	</section>
</template>
