<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
</script>

<template>
	<main
		class="mx-auto flex min-h-[60vh] max-w-[1180px] flex-col items-center justify-center px-5 py-16 text-center"
	>
		<p class="mb-0 mt-0 text-[3rem] font-extrabold leading-none tracking-[-.03em] text-brandblue">404</p>
		<h1 class="mb-2 mt-3 text-[1.3rem] font-bold lg:text-[1.5rem]">This page could not be found</h1>
		<p class="mb-5 max-w-[440px] text-[.85rem] text-muted">
			The link may be outdated or the page may have moved. Browse the marketplace instead.
		</p>
		<div class="flex flex-wrap justify-center gap-2">
			<RouterLink to="/" class="outline-btn">
				<ChevronRight class="h-3 w-3 rotate-180" />
				Back to home
			</RouterLink>
			<RouterLink to="/innovations" class="rounded-[6px] bg-navy px-4 py-2.5 text-[.78rem] font-bold text-white transition hover:bg-brandblue">
				Explore innovations
			</RouterLink>
		</div>
	</main>
</template>
