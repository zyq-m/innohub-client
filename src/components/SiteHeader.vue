<script setup lang="ts">
	import { Menu, Search, X } from "lucide-vue-next";
	import { useRoute } from "vue-router";
	import logo from "../assets/logo.png";
	import { useMarketplace } from "../composables/useMarketplace";
	import { content, navLinks } from "../data/site";

	const emit = defineEmits<{ (e: "search"): void }>();

	const route = useRoute();
	const { state, closeMobileMenu } = useMarketplace();

	function onNavClick(event: MouseEvent) {
		if ((event.target as HTMLElement).closest("a")) closeMobileMenu();
	}

	function isActive(hash: string) {
		return route.path === hash;
	}
</script>

<template>
	<header
		class="relative z-20 border-b border-[#334052] bg-[linear-gradient(110deg,#021528,#071d3d)]"
	>
		<nav
			class="mx-auto flex min-h-[74px] max-w-[1180px] items-center justify-between gap-4 px-5 md:min-h-[86px]"
			aria-label="Main navigation"
		>
			<RouterLink
				class="flex shrink-0 items-center gap-3 text-white md:gap-[13px]"
				to="/"
				aria-label="InnoHub home"
			>
				<img
					:src="logo"
					alt=""
					class="h-[45px] w-[35px] shrink-0 object-contain"
				/>
				<span>
					<strong
						class="block text-[1.35rem] font-extrabold leading-none tracking-[-.035em] md:text-[1.65rem]"
						>{{ content.brand }}</strong
					>
					<small
						class="mt-[5px] block text-[.6rem] tracking-[.14em] text-gold md:text-[.67rem] md:tracking-[.04em]"
						>{{ content.tagline }}</small
					>
				</span>
			</RouterLink>

			<button
				class="text-[1.45rem] text-white md:hidden"
				type="button"
				@click="state.mobileMenu = !state.mobileMenu"
				:aria-expanded="state.mobileMenu"
				aria-label="Toggle navigation"
			>
				<X v-if="state.mobileMenu" class="h-7 w-7" />
				<Menu v-else class="h-7 w-7" />
			</button>

			<div
				class="absolute left-0 right-0 top-[74px] z-30 hidden flex-col gap-1 border-b border-[#334052] bg-[linear-gradient(110deg,#021528,#071d3d)] px-5 pb-6 pt-2 md:top-auto md:relative md:z-auto md:flex md:flex-row md:items-center md:gap-4 md:border-0 md:bg-transparent md:pb-0 md:pt-0 lg:gap-[23px]"
				:class="{ '!flex': state.mobileMenu }"
				@click="onNavClick"
			>
				<RouterLink
					v-for="link in navLinks"
					:key="link.label"
					:to="{ path: link.path, hash: link.hash }"
					class="group relative py-2 text-[.85rem] font-normal text-white/80 transition hover:text-white md:text-[.7rem] lg:text-[.8rem]"
					:class="{ 'font-bold text-white': isActive(link.path) }"
				>
					<span
						class="absolute -bottom-[9px] left-0 h-0.5 w-full origin-left scale-x-0 bg-gold transition group-hover:scale-x-100 md:-bottom-[23px]"
						:class="{ 'scale-x-100': isActive(link.path) }"
					></span>
					{{ link.label }}
				</RouterLink>
				<button
					class="flex h-9 w-9 items-center justify-center self-start text-white transition hover:text-gold md:self-auto"
					type="button"
					@click="emit('search')"
					aria-label="Search"
				>
					<Search class="h-[1.05rem] w-[1.05rem]" />
				</button>
			</div>
		</nav>
	</header>
</template>
