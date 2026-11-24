<script setup lang="ts">
	import { computed, onMounted } from "vue";
	import { RouterView, useRoute } from "vue-router";
	import SiteFooter from "./components/SiteFooter.vue";
	import SiteHeader from "./components/SiteHeader.vue";
	import { useMarketplace } from "./composables/useMarketplace";

	const { hydrate } = useMarketplace();
	const route = useRoute();

	const isAdmin = computed(() => route.path.startsWith("/admin"));

	onMounted(hydrate);
</script>

<template>
	<template v-if="isAdmin">
		<RouterView />
	</template>
	<template v-else>
		<SiteHeader />

		<div class="flex flex-1 flex-col">
			<RouterView />
		</div>

		<!-- <NewsletterBar /> -->
		<SiteFooter />
	</template>
</template>
