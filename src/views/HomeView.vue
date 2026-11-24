<script setup lang="ts">
	import { onMounted } from "vue";
	import CategoryTiles from "../components/CategoryTiles.vue";
	import FeaturedInnovations from "../components/FeaturedInnovations.vue";
	import HeroSection from "../components/HeroSection.vue";
	import LowerPanels from "../components/LowerPanels.vue";
	import MetricsStrip from "../components/MetricsStrip.vue";
	import TrlPanel from "../components/TrlPanel.vue";
	import { useProducts } from "../composables/useProducts";

	const { setPageSize } = useProducts();

	onMounted(() => setPageSize(4));
</script>

<template>
	<HeroSection />
	<main>
		<MetricsStrip />
		<FeaturedInnovations />
		<CategoryTiles />
		<TrlPanel />
		<LowerPanels />
	</main>
</template>
