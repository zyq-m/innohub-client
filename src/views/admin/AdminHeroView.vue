<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import {
		AlertCircle,
		ArrowDown,
		ArrowUp,
		ImageOff,
		RefreshCw,
		Trash2,
		Upload,
	} from "lucide-vue-next";
	import { contentAssetUrl } from "../../lib/contentApi";
	import { setPageTitle } from "../../lib/seo";
	import {
		fetchAdminHero,
		removeHeroImage,
		reorderHeroImages,
		uploadHeroImage,
	} from "../../services/hero";

	const MAX_IMAGES = 5;
	const images = ref<string[]>([]);
	const loading = ref(true);
	const uploading = ref(false);
	const savingOrder = ref(false);
	const error = ref("");
	const saved = ref("");

	function flash(message: string): void {
		saved.value = message;
		setTimeout(() => {
			if (saved.value === message) saved.value = "";
		}, 2500);
	}

	async function load(): Promise<void> {
		loading.value = true;
		error.value = "";
		try {
			const hero = await fetchAdminHero();
			images.value = hero.images ?? [];
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Unable to load hero images";
		} finally {
			loading.value = false;
		}
	}

	async function onFiles(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = "";
		if (!files.length) return;

		if (images.value.length + files.length > MAX_IMAGES) {
			error.value = `You can upload up to ${MAX_IMAGES} hero images.`;
			return;
		}

		error.value = "";
		uploading.value = true;
		try {
			for (const file of files) {
				const hero = await uploadHeroImage(file);
				images.value = hero.images ?? images.value;
			}
			flash("Hero images updated.");
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Unable to upload hero image";
		} finally {
			uploading.value = false;
		}
	}

	async function remove(index: number): Promise<void> {
		error.value = "";
		try {
			const hero = await removeHeroImage(index);
			images.value = hero.images ?? [];
			flash("Hero image removed.");
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : "Unable to remove hero image";
		}
	}

	async function move(index: number, direction: -1 | 1): Promise<void> {
		const nextIndex = index + direction;
		if (nextIndex < 0 || nextIndex >= images.value.length) return;

		const previous = [...images.value];
		const next = [...images.value];
		const [item] = next.splice(index, 1);
		next.splice(nextIndex, 0, item);
		images.value = next;

		savingOrder.value = true;
		error.value = "";
		try {
			const hero = await reorderHeroImages(next);
			images.value = hero.images ?? next;
			flash("Hero order updated.");
		} catch (err) {
			images.value = previous;
			error.value =
				err instanceof Error ? err.message : "Unable to reorder hero images";
		} finally {
			savingOrder.value = false;
		}
	}

	onMounted(() => {
		setPageTitle("Homepage hero · Admin");
		void load();
	});
</script>

<template>
	<div class="px-5 py-6 lg:px-8 lg:py-8">
		<header class="mb-6 flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="m-0 text-[1.4rem] font-extrabold tracking-[-.02em] text-navy">
					Homepage hero
				</h1>
				<p class="mb-0 mt-1 text-[.84rem] text-muted">
					Upload 3–5 images for the homepage hero slideshow. If none are set, the
					default hero image is used.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-[8px] border border-line bg-white px-3 py-2 text-[.78rem] font-bold text-[#3c4a60] transition hover:border-brandblue hover:text-brandblue"
					:disabled="loading"
					@click="load"
				>
					<RefreshCw class="h-4 w-4" :class="loading && 'animate-spin'" />
					Refresh
				</button>
				<label
					class="inline-flex cursor-pointer items-center gap-2 rounded-[8px] bg-navy px-4 py-2.5 text-[.8rem] font-extrabold text-white transition hover:bg-brandblue"
					:class="uploading && 'cursor-not-allowed opacity-60'"
				>
					<Upload class="h-4 w-4" />
					{{ uploading ? "Uploading…" : "Upload images" }}
					<input
						type="file"
						multiple
						accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
						class="hidden"
						:disabled="uploading"
						@change="onFiles"
					/>
				</label>
			</div>
		</header>

		<p
			v-if="error"
			class="mb-4 flex items-center gap-2 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[.8rem] text-[#b3261e]"
		>
			<AlertCircle class="h-4 w-4" />
			{{ error }}
		</p>
		<p
			v-else-if="saved"
			class="mb-4 rounded-[8px] bg-[#e4f6ec] px-3 py-2 text-[.8rem] font-semibold text-[#1c7c47]"
		>
			{{ saved }}
		</p>

		<section class="rounded-[10px] border border-line bg-white p-5 shadow-card">
			<div class="mb-4 flex items-center justify-between gap-3">
				<h2 class="m-0 text-[.95rem] font-bold text-navy">Slideshow images</h2>
				<span class="text-[.75rem] font-semibold text-muted"
					>{{ images.length }} / {{ MAX_IMAGES }}</span
				>
			</div>

			<div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
				<div
					v-for="n in 3"
					:key="n"
					class="h-48 animate-pulse rounded-[10px] bg-[#eef3fa]"
				></div>
			</div>

			<div
				v-else-if="!images.length"
				class="flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-line px-6 py-12 text-center"
			>
				<ImageOff class="h-8 w-8 text-muted" />
				<p class="m-0 text-[.88rem] font-semibold text-[#3c4a60]">
					No hero images yet
				</p>
				<p class="m-0 max-w-[420px] text-[.78rem] text-muted">
					Upload images to enable the automatic homepage slideshow. Use wide
					landscape images for the best result.
				</p>
			</div>

			<div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<article
					v-for="(image, index) in images"
					:key="image"
					class="overflow-hidden rounded-[10px] border border-line"
				>
					<img
						:src="contentAssetUrl(image)"
						alt=""
						class="h-44 w-full object-cover"
					/>
					<div class="flex items-center justify-between gap-2 px-3 py-2.5">
						<div class="min-w-0">
							<p class="m-0 text-[.74rem] font-bold text-navy">
								Slide {{ index + 1 }}
							</p>
							<p class="m-0 truncate text-[.68rem] text-muted">
								{{ image.split("/").pop() }}
							</p>
						</div>
						<div class="flex shrink-0 items-center gap-1">
							<button
								type="button"
								class="rounded-[6px] border border-line p-1.5 text-[#3c4a60] transition hover:border-brandblue hover:text-brandblue disabled:opacity-40"
								title="Move up"
								:disabled="index === 0 || savingOrder"
								@click="move(index, -1)"
							>
								<ArrowUp class="h-3.5 w-3.5" />
							</button>
							<button
								type="button"
								class="rounded-[6px] border border-line p-1.5 text-[#3c4a60] transition hover:border-brandblue hover:text-brandblue disabled:opacity-40"
								title="Move down"
								:disabled="index === images.length - 1 || savingOrder"
								@click="move(index, 1)"
							>
								<ArrowDown class="h-3.5 w-3.5" />
							</button>
							<button
								type="button"
								class="rounded-[6px] border border-line p-1.5 text-[#b3261e] transition hover:border-[#b3261e] disabled:opacity-40"
								title="Remove image"
								:disabled="savingOrder || uploading"
								@click="remove(index)"
							>
								<Trash2 class="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				</article>
			</div>

			<p class="mb-0 mt-4 text-[.73rem] text-muted">
				Images rotate automatically every 6 seconds on the homepage. Reorder
				controls change the slideshow sequence.
			</p>
		</section>
	</div>
</template>
