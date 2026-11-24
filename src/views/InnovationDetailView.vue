<script setup lang="ts">
	import dayjs from "dayjs";
	import {
		ArrowLeft,
		Cpu,
		Download,
		FileText,
		Mail,
		MessageCircle,
		Search,
		UserRound,
	} from "lucide-vue-next";
	import { computed, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import ProductMediaGallery from "../components/ProductMediaGallery.vue";
	import { useProducts } from "../composables/useProducts";
	import type { Product } from "../data/products";
	import { trlStages } from "../data/site";
	import { setPageTitle } from "../lib/seo";
	import { fetchProductById } from "../services/products";

	const route = useRoute();
	const router = useRouter();
	const { state } = useProducts();

	const product = ref<Product | null>(null);
	const loading = ref(true);
	const error = ref("");

	const SECTIONS: { key: keyof Product; label: string }[] = [
		{ key: "innovation", label: "The innovation" },
		{ key: "requirement", label: "Market need" },
		{ key: "application", label: "Applications" },
		{ key: "benefits", label: "Benefits" },
	];

	const listed = computed(() =>
		state.products.find((item) => item.id === product.value?.id),
	);

	const photos = computed(
		() => product.value?.images.map((image) => image.url) ?? [],
	);
	const documents = computed(() => product.value?.documents ?? []);
	const hasMedia = computed(
		() => photos.value.length > 0 || Boolean(product.value?.videoUrl),
	);

	function formatDate(value: string): string {
		if (!value) return "";
		const date = dayjs(value);
		return date.isValid() ? date.format("DD MMM YYYY") : "";
	}

	const researcherName = computed(
		() =>
			(listed.value?.researcher || product.value?.researcher || "").trim(),
	);
	const facultyCode = computed(
		() =>
			(listed.value?.facultyCode || product.value?.facultyCode || "").trim(),
	);
	const researcherInitials = computed(() => {
		const parts = researcherName.value.split(/\s+/).filter(Boolean);
		return parts
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase() ?? "")
			.join("");
	});

	const details = computed(() => {
		const item = product.value;
		if (!item) return [];
		return [
			{ label: "IP number", value: item.ipNo },
			{ label: "Type", value: item.typeLabel },
			{ label: "Spin-off", value: item.spinOff ? "Yes" : "No" },
			{ label: "Listed on", value: formatDate(item.createdAt) },
			{
				label: "Updated",
				value:
					item.updatedAt && item.updatedAt !== item.createdAt
						? formatDate(item.updatedAt)
						: "",
			},
		].filter((row) => Boolean(row.value));
	});

	const lead = computed(() => product.value?.description.trim() ?? "");
	const sections = computed(() => {
		const item = product.value;
		if (!item) return [];
		return SECTIONS.map((section) => ({
			...section,
			text: String(item[section.key] || "").trim(),
		})).filter((section) => section.text);
	});

	const trlLabel = computed(() => {
		const trl = product.value?.trl;
		return trl === null || trl === undefined ? "TRL n/a" : `TRL ${trl}`;
	});
	const trlStage = computed(() => {
		const trl = product.value?.trl;
		if (trl === null || trl === undefined) return "Readiness not specified";
		return trlStages[trl - 1] ?? "Readiness not specified";
	});
	const trlBackground = computed(() => {
		const trl = product.value?.trl;
		if (trl === null || trl === undefined) return "#8b97a8";
		if (trl <= 3) return "#079cc0";
		if (trl <= 6) return "#315fde";
		return "#0b9e65";
	});

	const researcherEmail = computed(() =>
		(
			product.value?.researcherEmail ||
			listed.value?.researcherEmail ||
			""
		).trim(),
	);
	const contactHref = computed(() => {
		if (!researcherEmail.value) return "";
		const subject = `Enquiry about ${product.value?.title ?? "an innovation"}`;
		const body = `Dear ${researcherName.value || "Researcher"},\n\nI am interested in learning more about "${product.value?.title ?? ""}" listed on InnoHub.\n\nKind regards,\n`;
		return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(researcherEmail.value)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	});

	function isTrlActive(level: number): boolean {
		const trl = product.value?.trl;
		return trl !== null && trl !== undefined && level <= trl;
	}

	function goBack() {
		if (window.history.state?.back) void router.back();
		else void router.push({ name: "innovations" });
	}

	async function load(id: string) {
		loading.value = true;
		error.value = "";
		product.value = null;
		setPageTitle("Innovation");
		try {
			product.value = await fetchProductById(id);
			setPageTitle(product.value.title);
		} catch {
			error.value = "This innovation could not be loaded right now.";
		} finally {
			loading.value = false;
		}
	}

	watch(
		() => route.params.id,
		(id) => {
			void load(String(id));
		},
		{ immediate: true },
	);
</script>

<template>
	<main class="bg-[#f4f7fb] pb-24 lg:pb-10">
		<div class="mx-auto max-w-[1220px] px-4 py-5 sm:px-5">
			<nav class="mb-4 flex items-center gap-2 text-[.78rem] text-muted">
				<RouterLink to="/" class="hover:text-brandblue">Home</RouterLink>
				<span>/</span>
				<RouterLink :to="{ name: 'innovations' }" class="hover:text-brandblue"
					>Innovations</RouterLink
				>
				<span v-if="product" class="truncate text-ink/70">/ {{ product.title }}</span>
			</nav>

			<div v-if="loading" class="space-y-4" aria-busy="true">
				<div class="grid gap-4 rounded-xl bg-white p-4 shadow-card lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:p-6">
					<div class="aspect-square animate-pulse rounded-xl bg-[#e8eef6]"></div>
					<div class="space-y-4 py-2">
						<div class="h-4 w-28 animate-pulse rounded bg-[#e8eef6]"></div>
						<div class="h-8 w-4/5 animate-pulse rounded bg-[#e8eef6]"></div>
						<div class="h-4 w-2/3 animate-pulse rounded bg-[#e8eef6]"></div>
						<div class="h-28 animate-pulse rounded-xl bg-[#eef3fa]"></div>
						<div class="h-12 animate-pulse rounded-lg bg-[#e8eef6]"></div>
						<div class="h-12 animate-pulse rounded-lg bg-[#e8eef6]"></div>
					</div>
				</div>
			</div>

			<div
				v-else-if="error || !product"
				class="rounded-xl border border-line bg-white p-10 text-center shadow-card"
			>
				<Search class="mx-auto h-8 w-8 text-brandblue" />
				<h1 class="mb-1 mt-2.5 text-[1.1rem] font-bold">{{ error || "Innovation not found" }}</h1>
				<p class="m-0 text-[.85rem] text-muted">It may have been removed or the link is incorrect.</p>
				<div class="mt-4 flex justify-center gap-2">
					<button type="button" class="outline-btn" @click="goBack">Go back</button>
					<RouterLink to="/innovations" class="outline-btn">Browse innovations</RouterLink>
				</div>
			</div>

			<template v-else>
				<section class="rounded-xl bg-white p-4 shadow-card lg:p-6">
					<div class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
						<div class="lg:sticky lg:top-6 lg:self-start">
							<ProductMediaGallery
								v-if="hasMedia"
								:images="photos"
								:video-url="product.videoUrl"
								:alt-base="product.title"
							/>
							<div
								v-else
								class="flex aspect-square w-full items-center justify-center rounded-xl border border-line bg-[linear-gradient(135deg,#0a2854,#0b5c6b)]"
							>
								<Cpu class="h-14 w-14 text-white/25" />
							</div>
						</div>

						<div class="min-w-0">
							<div class="mb-3 flex flex-wrap items-center gap-2">
								<span class="text-[.72rem] font-bold uppercase tracking-[.06em] text-brandblue">
									{{ product.categoryLabel || "Innovation" }}
								</span>
								<span
									v-if="product.trl !== null"
									class="rounded px-2 py-0.5 text-[.64rem] font-extrabold uppercase text-white"
									:style="{ background: trlBackground }"
									>{{ trlLabel }}</span
								>
								<span
									v-if="product.spinOff"
									class="rounded bg-gold px-2 py-0.5 text-[.64rem] font-extrabold uppercase text-navy"
									>Spin-off</span
								>
							</div>

							<h1 class="m-0 text-[1.45rem] font-extrabold leading-[1.25] tracking-[-.02em] text-navy sm:text-[1.7rem] lg:text-[1.95rem]">
								{{ product.title }}
							</h1>

							<div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-4 text-[.8rem] text-muted">
								<span v-if="researcherName"><strong class="font-semibold text-navy/75">Researcher:</strong> {{ researcherName }}</span>
								<span v-if="facultyCode"><strong class="font-semibold text-navy/75">Faculty:</strong> {{ facultyCode }}</span>
								<span v-if="product.typeLabel"><strong class="font-semibold text-navy/75">Type:</strong> {{ product.typeLabel }}</span>
							</div>

							<div class="mt-4 rounded-xl bg-[#f7f9fc] p-4">
								<div class="flex items-center justify-between gap-3">
									<div>
										<p class="m-0 text-[.68rem] font-bold uppercase tracking-[.05em] text-muted">Technology readiness</p>
										<p class="m-0 mt-1 text-[1rem] font-bold text-navy">{{ trlStage }}</p>
									</div>
									<span class="rounded-md px-3 py-1.5 text-[.78rem] font-extrabold text-white" :style="{ background: trlBackground }">{{ trlLabel }}</span>
								</div>
								<div class="mt-3 flex gap-1" role="img" :aria-label="`${trlLabel}: ${trlStage}`">
									<span
										v-for="n in 9"
										:key="`trl-${n}`"
										class="h-2 flex-1 rounded-full"
										:class="isTrlActive(n) ? '' : 'bg-[#dce5f1]'"
										:style="isTrlActive(n) ? { background: trlBackground } : undefined"
									></span>
								</div>
								<p class="mb-0 mt-2 text-[.74rem] text-muted">
									<template v-if="product.trl !== null">Level {{ product.trl }} of 9 in the technology readiness scale.</template>
									<template v-else>This innovation has not been assigned a TRL yet.</template>
								</p>
							</div>

							<div class="mt-5 hidden gap-3 lg:flex">
								<a
									v-if="contactHref"
									:href="contactHref"
									target="_blank"
									rel="noopener noreferrer"
									class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brandblue px-4 py-3 text-[.82rem] font-bold text-white transition hover:bg-navy"
								>
									<Mail class="h-4 w-4" />
									Contact researcher
								</a>
								<button
									v-else
									type="button"
									class="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-brandblue/50 px-4 py-3 text-[.82rem] font-bold text-white"
									disabled
									title="Researcher email is not available"
								>
									<Mail class="h-4 w-4" />
									Contact researcher
								</button>
								<RouterLink
									to="/contact"
									class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brandblue px-4 py-3 text-[.82rem] font-bold text-brandblue transition hover:bg-brandblue/5"
								>
									<MessageCircle class="h-4 w-4" />
									Collaborate with us
								</RouterLink>
							</div>

							<div class="mt-5 rounded-xl border border-line p-4">
								<p class="mb-3 mt-0 text-[.68rem] font-bold uppercase tracking-[.05em] text-muted">Researcher</p>
								<div class="flex items-center gap-3">
									<div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eaf0ff] text-[.78rem] font-extrabold text-brandblue">
										<span v-if="researcherInitials">{{ researcherInitials }}</span>
										<UserRound v-else class="h-5 w-5" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="m-0 truncate text-[.88rem] font-bold text-navy">{{ researcherName || "Researcher information unavailable" }}</p>
										<p class="m-0 mt-0.5 truncate text-[.76rem] text-muted">{{ facultyCode || "UniSZA" }}</p>
									</div>
								</div>
							</div>

							<div v-if="details.length" class="mt-5">
								<p class="mb-3 mt-0 text-[.68rem] font-bold uppercase tracking-[.05em] text-muted">Innovation details</p>
								<dl class="m-0 divide-y divide-line rounded-xl border border-line">
									<div v-for="item in details" :key="item.label" class="grid grid-cols-[140px_1fr] gap-3 px-4 py-3 text-[.8rem]">
										<dt class="text-muted">{{ item.label }}</dt>
										<dd class="m-0 break-words font-medium text-[#33415b]">{{ item.value }}</dd>
									</div>
								</dl>
							</div>
						</div>
					</div>
				</section>

				<section class="mt-4 rounded-xl bg-white p-5 shadow-card sm:p-6">
					<h2 class="mb-5 mt-0 text-[1.05rem] font-bold text-navy">Product description</h2>
					<p v-if="lead" class="m-0 whitespace-pre-line text-[.92rem] leading-[1.8] text-[#4a5870]">{{ lead }}</p>
					<p v-else-if="!sections.length" class="m-0 text-[.9rem] leading-[1.7] text-muted">Detailed information for this innovation is not available yet.</p>

					<div v-if="sections.length" class="mt-6 space-y-6">
						<section v-for="(section, index) in sections" :key="String(section.key)" class="border-t border-line pt-6 first:mt-0">
							<h3 class="mb-2 mt-0 flex items-center gap-2 text-[.95rem] font-bold text-navy">
								<span class="grid h-6 w-6 place-items-center rounded-full bg-[#eaf0ff] text-[.68rem] font-extrabold text-brandblue">{{ index + 1 }}</span>
								{{ section.label }}
							</h3>
							<p class="m-0 whitespace-pre-line text-[.9rem] leading-[1.8] text-[#4a5870]">{{ section.text }}</p>
						</section>
					</div>
				</section>

				<section v-if="documents.length" class="mt-4 rounded-xl bg-white p-5 shadow-card sm:p-6">
					<h2 class="mb-4 mt-0 text-[1.05rem] font-bold text-navy">Documents</h2>
					<div class="grid gap-3 sm:grid-cols-2">
						<a
							v-for="(doc, index) in documents"
							:key="`doc-${doc.id ?? index}`"
							:href="doc.url"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-start gap-3 rounded-lg border border-line bg-[#f8fafc] p-3 transition hover:border-brandblue hover:bg-white"
						>
							<FileText class="mt-0.5 h-4 w-4 shrink-0 text-brandblue" />
							<span class="min-w-0 flex-1">
								<span class="block break-words text-[.82rem] font-semibold text-navy">{{ doc.name }}</span>
								<span v-if="doc.description" class="mt-0.5 block text-[.75rem] leading-[1.5] text-muted">{{ doc.description }}</span>
							</span>
							<Download class="mt-0.5 h-4 w-4 shrink-0 text-muted" />
						</a>
					</div>
				</section>

				<div class="mt-5 hidden flex-wrap items-center gap-3 lg:flex">
					<RouterLink :to="{ name: 'innovations' }" class="inline-flex items-center gap-1.5 text-[.8rem] font-semibold text-brandblue transition hover:text-navy">
						<ArrowLeft class="h-4 w-4" /> Browse all innovations
					</RouterLink>
				</div>

				<div class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/96 p-3 shadow-[0_-4px_20px_rgba(6,26,57,.08)] backdrop-blur lg:hidden">
					<div class="mx-auto flex max-w-[1220px] gap-2">
						<a
							v-if="contactHref"
							:href="contactHref"
							target="_blank"
							rel="noopener noreferrer"
							class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brandblue px-4 py-3 text-[.8rem] font-bold text-white"
						>
							<Mail class="h-4 w-4" /> Contact researcher
						</a>
						<button
							v-else
							type="button"
							class="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-brandblue/50 px-4 py-3 text-[.8rem] font-bold text-white"
							disabled
						>
							<Mail class="h-4 w-4" /> Contact researcher
						</button>
						<RouterLink
							to="/contact"
							class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brandblue px-4 py-3 text-[.8rem] font-bold text-brandblue"
						>
							<MessageCircle class="h-4 w-4" /> Collaborate
						</RouterLink>
					</div>
				</div>
			</template>
		</div>
	</main>
</template>
