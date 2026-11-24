<script setup lang="ts">
	import {
		AlertCircle,
		ArrowLeft,
		FlaskConical,
		RotateCw,
	} from "lucide-vue-next";
	import { computed, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import ResearchGroupCard from "../components/ResearchGroupCard.vue";
	import {
		groupByFaculty,
		isKlusterGroup,
		researchGroupType,
		type ResearchGroup,
	} from "../data/researchGroups";
	import { setPageTitle } from "../lib/seo";
	import {
		facultyLabel,
		fetchFaculties,
		type Faculty,
	} from "../services/faculties";
	import {
		fetchResearchGroupBySlug,
		fetchResearchGroups,
	} from "../services/researchGroups";

	const route = useRoute();
	const router = useRouter();

	const cluster = ref<ResearchGroup | null>(null);
	const children = ref<ResearchGroup[]>([]);
	const faculties = ref<Faculty[]>([]);
	const loading = ref(true);
	const notFound = ref(false);
	const error = ref("");

	const sigs = computed(() =>
		children.value
			.filter((group) => researchGroupType(group) === "sig")
			.sort((a, b) => {
				if (a.featured !== b.featured) return a.featured ? -1 : 1;
				return a.groupName.localeCompare(b.groupName);
			}),
	);

	const rgs = computed(() =>
		children.value.filter((group) => researchGroupType(group) === "rg"),
	);

	const others = computed(() =>
		children.value.filter(
			(group) => !["sig", "rg"].includes(researchGroupType(group)),
		),
	);

	const rgsByFaculty = computed(() => groupByFaculty(rgs.value));

	async function load(slug: string): Promise<void> {
		loading.value = true;
		notFound.value = false;
		error.value = "";
		cluster.value = null;
		children.value = [];

		try {
			const group = await fetchResearchGroupBySlug(slug);
			if (!isKlusterGroup(group)) {
				await router.replace({ name: "research-partner", params: { slug } });
				return;
			}

			cluster.value = group;
			setPageTitle(group.groupName);

			const [result, facultyList] = await Promise.all([
				fetchResearchGroups({ cluster: group.groupName, limit: 100 }),
				fetchFaculties().catch(() => [] as Faculty[]),
			]);

			children.value = result.rows;
			faculties.value = facultyList;
		} catch (err) {
			const status = (err as { response?: { status?: number } })?.response
				?.status;
			notFound.value = status === 404;
			error.value =
				status === 404
					? ""
					: err instanceof Error
						? err.message
						: "Unable to load cluster.";
		} finally {
			loading.value = false;
		}
	}

	watch(
		() => route.params.slug,
		(slug) => {
			if (typeof slug === "string" && slug) void load(slug);
			else {
				loading.value = false;
				notFound.value = true;
			}
		},
		{ immediate: true },
	);
</script>

<template>
	<main class="mx-auto max-w-[1180px] px-5 py-8 md:py-10">
		<RouterLink
			:to="{ name: 'research-partners' }"
			class="mb-5 inline-flex items-center gap-1.5 text-[.8rem] font-bold text-brandblue transition hover:text-navy"
		>
			<ArrowLeft class="h-4 w-4" />
			All research clusters
		</RouterLink>

		<div v-if="loading" class="space-y-4" aria-hidden="true">
			<div
				class="h-[150px] animate-pulse rounded-[12px] bg-white shadow-card"
			></div>
			<div class="h-5 w-40 animate-pulse rounded bg-white shadow-card"></div>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				<div
					v-for="card in 4"
					:key="card"
					class="h-[270px] animate-pulse rounded-[9px] bg-white shadow-card"
				></div>
			</div>
		</div>

		<div
			v-else-if="notFound"
			class="rounded-[12px] border border-line bg-white p-10 text-center"
		>
			<FlaskConical class="mx-auto mb-3 h-9 w-9 text-muted" />
			<p class="m-0 text-[.95rem] font-bold text-navy">
				Research cluster not found.
			</p>
			<p class="mb-5 mt-1 text-[.82rem] text-muted">
				It may have been unpublished or removed.
			</p>
			<RouterLink :to="{ name: 'research-partners' }" class="outline-btn">
				Browse all research clusters
			</RouterLink>
		</div>

		<div
			v-else-if="error"
			class="rounded-[12px] border border-line bg-white p-8 text-center"
		>
			<p
				class="m-0 flex items-center justify-center gap-2 text-[.85rem] text-[#b3261e]"
			>
				<AlertCircle class="h-4 w-4" />
				{{ error }}
			</p>
			<button
				type="button"
				class="outline-btn mt-4"
				@click="
					typeof route.params.slug === 'string' && void load(route.params.slug)
				"
			>
				<RotateCw class="h-3.5 w-3.5" /> Try again
			</button>
		</div>

		<template v-else-if="cluster">
			<header
				class="mb-8 rounded-[12px] bg-[linear-gradient(110deg,#061a39,#0b3b6b)] px-6 py-7 text-white shadow-card"
			>
				<p
					class="m-0 text-[.68rem] font-bold uppercase tracking-[.08em] text-white/65"
				>
					Research cluster
				</p>
				<h1
					class="mb-2 mt-1 text-[1.4rem] font-extrabold tracking-[-.02em] md:text-[1.8rem]"
				>
					{{ cluster.groupName }}
				</h1>
				<p class="m-0 text-[.8rem] text-white/75">
					{{ sigs.length }} Special Interest
					{{ sigs.length === 1 ? "Group" : "Groups" }} ·
					{{ rgs.length }} Research {{ rgs.length === 1 ? "Group" : "Groups" }}
				</p>
				<!-- <RouterLink
					:to="{ name: 'research-partner', params: { slug: cluster.slug } }"
					class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-1.5 text-[.72rem] font-bold text-white transition hover:border-white/70"
				>
					View cluster profile
				</RouterLink> -->
			</header>

			<section v-if="sigs.length" class="mb-9">
				<h2
					class="mb-3 mt-0 flex items-center gap-2 text-[.78rem] font-extrabold uppercase tracking-[.06em] text-brandblue"
				>
					Special Interest Groups (SIG)
					<span
						class="rounded-full bg-brandblue/10 px-2 py-0.5 text-[.66rem] text-brandblue"
					>
						{{ sigs.length }}
					</span>
				</h2>
				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					<ResearchGroupCard
						v-for="group in sigs"
						:key="group.id"
						:group="group"
					/>
				</div>
			</section>

			<section v-if="rgsByFaculty.length">
				<h2
					class="mb-4 mt-0 flex items-center gap-2 text-[.78rem] font-extrabold uppercase tracking-[.06em] text-navy"
				>
					Research Groups (RG)
					<span
						class="rounded-full bg-navy/10 px-2 py-0.5 text-[.66rem] text-navy"
					>
						{{ rgs.length }}
					</span>
				</h2>

				<div
					v-for="faculty in rgsByFaculty"
					:key="faculty.faculty"
					class="mb-7 last:mb-0"
				>
					<h3
						class="mb-3 mt-0 text-[.72rem] font-extrabold uppercase tracking-[.05em] text-[#0b5c6b]"
					>
						{{ facultyLabel(faculty.faculty, faculties) }}
					</h3>
					<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
						<ResearchGroupCard
							v-for="group in faculty.items"
							:key="group.id"
							:group="group"
						/>
					</div>
				</div>
			</section>

			<section v-if="others.length" class="mt-9">
				<h2
					class="mb-3 mt-0 text-[.78rem] font-extrabold uppercase tracking-[.06em] text-muted"
				>
					Other research partners
				</h2>
				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					<ResearchGroupCard
						v-for="group in others"
						:key="group.id"
						:group="group"
					/>
				</div>
			</section>

			<div
				v-if="!sigs.length && !rgsByFaculty.length && !others.length"
				class="rounded-[12px] border border-line bg-white p-8 text-center"
			>
				<FlaskConical class="mx-auto mb-3 h-8 w-8 text-muted" />
				<p class="m-0 text-[.88rem] font-semibold text-navy">
					No SIGs or RGs have been added to this cluster yet.
				</p>
			</div>
		</template>
	</main>
</template>
