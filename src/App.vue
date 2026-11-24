<script setup lang="ts">
	import { computed, onMounted } from "vue";
	import { RouterView, useRoute, useRouter } from "vue-router";
	import SiteFooter from "./components/SiteFooter.vue";
	import SiteHeader from "./components/SiteHeader.vue";
	import { focusHeroSearch } from "./composables/useHeroSearch";
	import { useMarketplace } from "./composables/useMarketplace";

	const { hydrate } = useMarketplace();
	const route = useRoute();
	const router = useRouter();

	const isAdmin = computed(() => route.path.startsWith("/admin"));

	onMounted(hydrate);

	async function focusSearch() {
		if (route.path !== "/") await router.push({ path: "/", hash: "" });
		focusHeroSearch();
	}
</script>

<template>
	<template v-if="isAdmin">
		<RouterView />
	</template>
	<template v-else>
		<SiteHeader @search="focusSearch" />

		<RouterView />

		<!-- <NewsletterBar /> -->
		<SiteFooter />
	</template>
</template>
