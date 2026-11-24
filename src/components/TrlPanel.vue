<script setup lang="ts">
	import { onBeforeUnmount, onMounted } from "vue";
	import { useRouter } from "vue-router";
	import { CircleHelp } from "lucide-vue-next";
	import {
		DEFAULT_TRL_MAX,
		DEFAULT_TRL_MIN,
		useProducts,
	} from "../composables/useProducts";
	import { content, trlStages } from "../data/site";

	const router = useRouter();
	const { filters, setFilters, setTrlMin } = useProducts();

	onMounted(() => {
		if (filters.trl_max !== DEFAULT_TRL_MAX) {
			setFilters({ trl_max: DEFAULT_TRL_MAX });
		}
	});

	let navigateTimer: ReturnType<typeof setTimeout> | undefined;

	function scheduleNavigate(): void {
		clearTimeout(navigateTimer);
		navigateTimer = setTimeout(() => {
			const query: Record<string, string> = {};

			if (filters.trl_min !== DEFAULT_TRL_MIN) {
				query.trl_min = String(filters.trl_min);
			}

			void router.push({ name: "innovations", query });
		}, 500);
	}

	function onMinInput(event: Event): void {
		setTrlMin(Number((event.target as HTMLInputElement).value));
		scheduleNavigate();
	}

	onBeforeUnmount(() => clearTimeout(navigateTimer));
</script>

<template>
	<section
		class="mx-auto max-w-[1180px] px-5 pb-5 pt-6 md:px-3 md:pb-5 md:pt-[18px]"
	>
		<div
			class="rounded-[10px] bg-[linear-gradient(100deg,#061d42,#04152f)] p-6 text-white shadow-[0_4px_12px_rgba(5,32,63,.06)] md:max-w-[936px] md:grid md:grid-cols-[260px_1fr] md:gap-[25px] md:p-[25px] lg:max-w-[1156px] lg:grid-cols-[285px_1fr] lg:gap-[38px] lg:px-8 lg:py-[25px]"
		>
			<div>
				<span class="text-[.7rem] text-[#e1e6f2]">Find innovations by</span>
				<h2 class="mb-2 mt-[3px] text-[1rem] font-bold leading-[1.5]">
					{{ content.trl_title }}
				</h2>
				<p class="text-[.7rem] text-[#d7deeb]">{{ content.trl_text }}</p>
				<details class="group text-[.7rem]">
					<summary
						class="w-fit cursor-pointer list-none rounded-[5px] border border-[#ae9039] px-[13px] py-2 text-white"
					>
						Learn more about TRL
						<CircleHelp class="ml-1 h-3.5 w-3.5 align-[-2px]" />
					</summary>
					<p class="mb-0 mt-2.5">{{ content.trl_help }}</p>
				</details>
			</div>
			<div class="min-w-0">
				<div class="trl-stages">
					<div
						v-for="(label, i) in trlStages"
						:key="label"
						class="trl-stage z-10"
						:class="{ ready: i + 1 >= filters.trl_min }"
					>
						<b>{{ i + 1 }}</b
						><small>{{ label }}</small>
					</div>
				</div>
				<div class="mt-5 space-y-2">
					<label class="block text-[.68rem] text-white/70">
						<input
							:value="filters.trl_min"
							type="range"
							min="1"
							max="9"
							step="1"
							aria-label="Minimum technology readiness level"
							class="accent-trl mt-1 block w-full"
							@input="onMinInput"
						/>
					</label>
				</div>
				<p class="mb-0 mt-2 text-center text-[.68rem] text-white/70">
					Showing innovations from
					<b class="text-[#13bbad]">TRL {{ filters.trl_min }}</b> and above
				</p>
			</div>
		</div>
	</section>
</template>
