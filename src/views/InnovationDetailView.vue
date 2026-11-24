<script setup lang="ts">
	import dayjs from "dayjs";
	import {
		ArrowLeft,
		ArrowRight,
		Cpu,
		Download,
		FileText,
		Mail,
		Play,
		Search,
	} from "lucide-vue-next";
	import { computed, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import ImageCarousel from "../components/ImageCarousel.vue";
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

	/** The list endpoint returns the researcher and faculty; the detail endpoint does not. */
	const listed = computed(() =>
		state.products.find((item) => item.id === product.value?.id),
	);

	const photos = computed(
		() => product.value?.images.map((image) => image.url) ?? [],
	);

	const documents = computed(() => product.value?.documents ?? []);

	function formatDate(value: string): string {
		if (!value) return "";
		const date = dayjs(value);
		return date.isValid() ? date.format("DD MMM YYYY") : "";
	}

	const details = computed(() => {
		const item = product.value;
		if (!item) return [];
		const rows = [
			{
				label: "Researcher",
				value: listed.value?.researcher || item.researcher,
			},
			{
				label: "Faculty",
				value: listed.value?.facultyCode || item.facultyCode,
			},
			{ label: "Type", value: item.typeLabel },
			{ label: "IP number", value: item.ipNo },
			{ label: "Spin-off", value: item.spinOff ? "Yes" : "" },
			{ label: "Listed on", value: formatDate(item.createdAt) },
			{
				label: "Updated",
				value:
					item.updatedAt && item.updatedAt !== item.createdAt
						? formatDate(item.updatedAt)
						: "",
			},
		];
		return rows.filter((row) => Boolean(row.value));
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
		const body = `Dear ${product.value?.researcher || "Researcher"},\n\nI am interested in learning more about "${product.value?.title ?? ""}" listed on InnoHub.\n\nKind regards,\n`;
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
	<main class="mx-auto min-h-[60vh] max-w-[1180px] px-5 py-8">
		<RouterLink
			:to="{ name: 'innovations' }"
			class="mb-5 inline-flex items-center gap-1.5 text-[.8rem] font-bold text-brandblue transition hover:text-navy"
		>
			<ArrowLeft class="h-4 w-4" />
			All innovations
		</RouterLink>

		<div v-if="loading" class="space-y-6" aria-busy="true">
			<div
				class="h-56 animate-pulse rounded-[10px] bg-[#e8eef6] sm:h-80 lg:h-[420px]"
			></div>
			<div class="space-y-3">
				<div class="h-3 w-32 animate-pulse rounded bg-[#e8eef6]"></div>
				<div class="h-8 w-3/4 animate-pulse rounded bg-[#e8eef6]"></div>
				<div class="h-4 w-full animate-pulse rounded bg-[#e8eef6]"></div>
				<div class="h-4 w-4/5 animate-pulse rounded bg-[#e8eef6]"></div>
			</div>
			<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div class="space-y-4">
					<div
						class="h-4 w-full animate-pulse rounded bg-white shadow-card"
					></div>
					<div
						class="h-4 w-11/12 animate-pulse rounded bg-white shadow-card"
					></div>
					<div
						class="h-4 w-4/5 animate-pulse rounded bg-white shadow-card"
					></div>
					<div
						class="h-48 animate-pulse rounded-[12px] bg-white shadow-card"
					></div>
				</div>
				<div
					class="h-[360px] animate-pulse rounded-[12px] bg-white shadow-card"
				></div>
			</div>
		</div>

		<div
			v-else-if="error || !product"
			class="rounded-[12px] border border-line bg-white p-10 text-center"
		>
			<Search class="mx-auto h-8 w-8 text-brandblue" />
			<h1 class="mb-1 mt-2.5 text-[1.1rem] font-bold">
				{{ error || "Innovation not found" }}
			</h1>
			<p class="m-0 text-[.85rem] text-muted">
				It may have been removed or the link is incorrect.
			</p>
			<div class="mt-4 flex justify-center gap-2">
				<button type="button" class="outline-btn" @click="goBack">
					Go back
				</button>
				<RouterLink to="/innovations" class="outline-btn"
					>Browse innovations</RouterLink
				>
			</div>
		</div>

		<template v-else>
			<ImageCarousel
				v-if="photos.length"
				:images="photos"
				:alt-base="product.title"
				class="mb-7"
			/>
			<div
				v-else
				class="mb-7 flex h-56 w-full items-center justify-center overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,#0a2854,#0b5c6b)] shadow-card sm:h-80 lg:h-[420px]"
			>
				<Cpu class="h-12 w-12 text-white/25" />
			</div>

			<div class="mb-5 flex flex-wrap items-center gap-2">
				<span
					class="text-[.7rem] font-bold uppercase tracking-[.06em] text-brandblue"
				>
					{{ product.categoryLabel || "Innovation" }}
				</span>
				<span
					v-if="product.trl !== null"
					class="rounded-full px-2.5 py-0.5 text-[.62rem] font-extrabold uppercase text-white"
					:style="{ background: trlBackground }"
				>
					{{ trlLabel }}
				</span>
				<span
					v-if="product.spinOff"
					class="rounded-full bg-gold px-2.5 py-0.5 text-[.62rem] font-extrabold uppercase text-navy"
				>
					Spin-off
				</span>
			</div>

			<h1
				class="mb-4 mt-0 max-w-[900px] text-[1.6rem] font-extrabold leading-[1.15] tracking-[-.03em] text-navy md:text-[2.15rem]"
			>
				{{ product.title }}
			</h1>

			<div
				class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start"
			>
				<div class="min-w-0">
					<p
						v-if="lead"
						class="m-0 whitespace-pre-line text-[.95rem] leading-[1.75] text-[#4a5870]"
					>
						{{ lead }}
					</p>
					<p
						v-if="!lead && !sections.length"
						class="m-0 text-[.9rem] leading-[1.7] text-muted"
					>
						Detailed information for this innovation is not available yet.
					</p>

					<div v-if="sections.length" class="mt-7 space-y-5">
						<section
							v-for="(section, index) in sections"
							:key="String(section.key)"
							class="rounded-[12px] border border-line bg-white p-5 shadow-card sm:p-6"
						>
							<h2
								class="mb-2 mt-0 flex items-center gap-2 text-[1.02rem] font-bold text-navy"
							>
								<span
									class="grid h-6 w-6 place-items-center rounded-full bg-[#eaf0ff] text-[.68rem] font-extrabold text-brandblue"
									>{{ index + 1 }}</span
								>
								{{ section.label }}
							</h2>
							<p
								class="m-0 whitespace-pre-line text-[.92rem] leading-[1.75] text-[#4a5870]"
							>
								{{ section.text }}
							</p>
						</section>
					</div>

					<a
						v-if="product.videoUrl"
						:href="product.videoUrl"
						target="_blank"
						rel="noopener noreferrer"
						class="mt-6 flex items-center gap-4 rounded-[12px] border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-panel"
					>
						<span
							class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brandblue text-white"
						>
							<Play class="h-5 w-5" />
						</span>
						<span class="min-w-0">
							<span class="block text-[.9rem] font-bold text-navy"
								>Watch the innovation video</span
							>
							<span class="mt-0.5 block text-[.78rem] text-muted"
								>Open the product video in a new tab.</span
							>
						</span>
						<ArrowRight class="ml-auto h-4 w-4 shrink-0 text-brandblue" />
					</a>

					<section
						v-if="documents.length"
						class="mt-6 rounded-[12px] border border-line bg-white p-5 shadow-card sm:p-6"
					>
						<h2 class="mb-4 mt-0 text-[1.02rem] font-bold text-navy">
							Documents
						</h2>
						<div class="space-y-2.5">
							<a
								v-for="(doc, index) in documents"
								:key="`doc-${doc.id ?? index}`"
								:href="doc.url"
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-start gap-3 rounded-[9px] border border-line bg-[#f8fafc] p-3 transition hover:border-brandblue hover:bg-white"
							>
								<FileText class="mt-0.5 h-4 w-4 shrink-0 text-brandblue" />
								<span class="min-w-0 flex-1">
									<span
										class="block break-words text-[.82rem] font-semibold text-navy"
									>
										{{ doc.name }}
									</span>
									<span
										v-if="doc.description"
										class="mt-0.5 block text-[.75rem] leading-[1.5] text-muted"
									>
										{{ doc.description }}
									</span>
								</span>
								<Download class="mt-0.5 h-4 w-4 shrink-0 text-muted" />
							</a>
						</div>
					</section>

					<div class="mt-7 flex flex-wrap items-center gap-3">
						<RouterLink to="/contact" class="outline-btn"
							>Collaborate with us</RouterLink
						>
						<RouterLink
							:to="{ name: 'innovations' }"
							class="inline-flex items-center gap-1.5 text-[.8rem] font-semibold text-brandblue transition hover:text-navy"
						>
							Browse all innovations
							<ArrowRight class="h-3.5 w-3.5" />
						</RouterLink>
					</div>
				</div>

				<aside class="space-y-5 lg:sticky lg:top-6">
					<section
						class="rounded-[12px] border border-line bg-white p-5 shadow-card"
					>
						<h2 class="mb-4 mt-0 text-[.95rem] font-bold text-navy">
							Innovation profile
						</h2>
						<dl class="m-0 space-y-3.5">
							<div v-for="item in details" :key="item.label">
								<dt
									class="text-[.66rem] font-bold uppercase tracking-[.05em] text-muted"
								>
									{{ item.label }}
								</dt>
								<dd class="m-0 mt-0.5 break-words text-[.83rem] text-[#33415b]">
									{{ item.value }}
								</dd>
							</div>
						</dl>
					</section>

					<section
						class="rounded-[12px] border border-line bg-white p-5 shadow-card"
					>
						<div class="flex items-center justify-between gap-3">
							<h2 class="m-0 text-[.95rem] font-bold text-navy">
								Technology readiness
							</h2>
							<span
								class="rounded-full px-2.5 py-1 text-[.65rem] font-extrabold text-white"
								:style="{ background: trlBackground }"
							>
								{{ trlLabel }}
							</span>
						</div>
						<div
							class="mt-4 flex gap-1"
							role="img"
							:aria-label="`${trlLabel}: ${trlStage}`"
						>
							<span
								v-for="n in 9"
								:key="`trl-${n}`"
								class="h-1.5 flex-1 rounded-full"
								:class="isTrlActive(n) ? '' : 'bg-[#e8eef6]'"
								:style="
									isTrlActive(n) ? { background: trlBackground } : undefined
								"
							></span>
						</div>
						<p class="mb-0 mt-3 text-[.82rem] font-semibold text-navy">
							{{ trlStage }}
						</p>
						<p class="mb-0 mt-1 text-[.75rem] leading-[1.55] text-muted">
							<template v-if="product.trl !== null"
								>Level {{ product.trl }} of 9 in the technology readiness
								scale.</template
							>
							<template v-else
								>This innovation has not been assigned a TRL yet.</template
							>
						</p>
					</section>

					<div class="space-y-2.5">
						<a
							v-if="contactHref"
							:href="contactHref"
							target="_blank"
							rel="noopener noreferrer"
							class="outline-btn w-full justify-center"
						>
							<Mail class="h-4 w-4" />
							Contact researcher
						</a>
						<button
							v-else
							type="button"
							class="outline-btn w-full cursor-not-allowed justify-center opacity-60"
							disabled
							title="Researcher email is not available"
						>
							<Mail class="h-4 w-4" />
							Contact researcher
						</button>
						<RouterLink
							to="/contact"
							class="flex w-full items-center justify-center gap-2 rounded-[6px] bg-brandblue px-4 py-2.5 text-[.78rem] font-bold text-white transition hover:bg-navy"
						>
							Collaborate with us
							<ArrowRight class="h-3.5 w-3.5" />
						</RouterLink>
					</div>
				</aside>
			</div>
		</template>
	</main>
</template>
