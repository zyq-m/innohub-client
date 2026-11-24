<script setup lang="ts">
	import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-vue-next";
	import {
		computed,
		nextTick,
		onBeforeUnmount,
		onMounted,
		ref,
		watch,
	} from "vue";

	const props = defineProps<{
		images: string[];
		altBase: string;
	}>();

	const AUTOPLAY_MS = 5000;

	const active = ref(0);
	const count = computed(() => props.images.length);
	const canNavigate = computed(() => count.value > 1);
	const previewOpen = ref(false);
	const failedImages = ref<number[]>([]);
	const carouselRoot = ref<HTMLElement | null>(null);
	const previewCloseButton = ref<HTMLButtonElement | null>(null);
	let timer: number | null = null;
	let suppressClick = false;
	let previousBodyOverflow = "";

	function stopAutoplay(): void {
		if (timer !== null) {
			window.clearInterval(timer);
			timer = null;
		}
	}

	function startAutoplay(): void {
		stopAutoplay();
		if (previewOpen.value) return;
		if (!canNavigate.value) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		timer = window.setInterval(() => {
			active.value = (active.value + 1) % count.value;
		}, AUTOPLAY_MS);
	}

	function onPreviewKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			event.preventDefault();
			closePreview();
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			previous();
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			next();
		}
	}

	function openPreview(index: number = active.value): void {
		if (suppressClick || !count.value || previewOpen.value) return;
		stopAutoplay();
		active.value = index;
		previewOpen.value = true;
		previousBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onPreviewKeydown);
		void nextTick(() => previewCloseButton.value?.focus());
	}

	function closePreview(): void {
		if (!previewOpen.value) return;
		previewOpen.value = false;
		window.removeEventListener("keydown", onPreviewKeydown);
		document.body.style.overflow = previousBodyOverflow;
		previousBodyOverflow = "";
		void nextTick(() => {
			carouselRoot.value?.focus();
			startAutoplay();
		});
	}

	function restoreBodyScroll(): void {
		if (!previewOpen.value) return;
		document.body.style.overflow = previousBodyOverflow;
		previousBodyOverflow = "";
	}

	watch(
		() => props.images,
		() => {
			active.value = 0;
			failedImages.value = [];
			if (!count.value) closePreview();
			else startAutoplay();
		},
	);

	onMounted(startAutoplay);
	onBeforeUnmount(() => {
		stopAutoplay();
		window.removeEventListener("keydown", onPreviewKeydown);
		restoreBodyScroll();
	});

	function markImageFailed(index: number): void {
		if (!failedImages.value.includes(index)) {
			failedImages.value = [...failedImages.value, index];
		}
	}

	function goTo(index: number): void {
		if (!count.value) return;
		active.value = (index + count.value) % count.value;
	}

	function previous(): void {
		if (canNavigate.value) goTo(active.value - 1);
	}

	function next(): void {
		if (canNavigate.value) goTo(active.value + 1);
	}

	let touchStartX = 0;

	function onTouchStart(event: TouchEvent): void {
		stopAutoplay();
		touchStartX = event.touches[0]?.clientX ?? 0;
	}

	function onTouchEnd(event: TouchEvent): void {
		if (canNavigate.value) {
			const touchEndX = event.changedTouches[0]?.clientX ?? 0;
			const delta = touchEndX - touchStartX;

			if (Math.abs(delta) >= 40) {
				suppressClick = true;
				window.setTimeout(() => {
					suppressClick = false;
				}, 350);

				if (delta > 0) previous();
				else next();
			}
		}

		startAutoplay();
	}
</script>

<template>
	<div
		v-if="images.length"
		ref="carouselRoot"
		class="relative overflow-hidden rounded-[10px] bg-[#e8eef6] shadow-card mb-7"
		role="region"
		aria-roledescription="carousel"
		:aria-label="`${altBase} image gallery`"
		aria-haspopup="dialog"
		tabindex="0"
		@keydown.left.prevent="previous"
		@keydown.right.prevent="next"
		@keydown.enter.prevent="openPreview(active)"
		@mouseenter="stopAutoplay"
		@mouseleave="startAutoplay"
		@focusin="stopAutoplay"
		@focusout="startAutoplay"
		@touchstart.passive="onTouchStart"
		@touchend.passive="onTouchEnd"
	>
		<div class="h-56 overflow-hidden sm:h-80 lg:h-[420px]">
			<div
				class="flex h-full cursor-zoom-in transition-transform duration-500 ease-out"
				:style="{ transform: `translateX(-${active * 100}%)` }"
				@click="openPreview(active)"
			>
				<div
					v-for="(photo, index) in images"
					:key="`${photo}-${index}`"
					class="h-full w-full shrink-0"
					:aria-hidden="index !== active ? 'true' : undefined"
				>
					<img
						v-if="!failedImages.includes(index)"
						:src="photo"
						:alt="`${altBase} photo ${index + 1}`"
						loading="lazy"
						class="h-full w-full object-cover"
						@error="markImageFailed(index)"
					/>
					<div
						v-else
						class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a2854,#0b5c6b)]"
						role="img"
						:aria-label="`${altBase} photo ${index + 1} unavailable`"
					>
						<ImageOff class="h-10 w-10 text-white/35" />
					</div>
				</div>
			</div>
		</div>

		<template v-if="canNavigate">
			<button
				type="button"
				class="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-card transition hover:bg-white"
				aria-label="Previous image"
				@click="previous"
			>
				<ChevronLeft class="h-5 w-5" />
			</button>
			<button
				type="button"
				class="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-card transition hover:bg-white"
				aria-label="Next image"
				@click="next"
			>
				<ChevronRight class="h-5 w-5" />
			</button>
			<span
				class="absolute right-3 top-3 rounded-full bg-[#061a39]/80 px-2.5 py-1 text-[.7rem] font-semibold text-white"
				aria-live="polite"
			>
				{{ active + 1 }} / {{ count }}
			</span>
		</template>

		<div
			v-if="canNavigate"
			class="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5"
		>
			<button
				v-for="(_, index) in images"
				:key="`dot-${index}`"
				type="button"
				class="h-2.5 w-2.5 rounded-full transition"
				:class="index === active ? 'bg-white' : 'bg-white/50 hover:bg-white/75'"
				:aria-label="`Go to photo ${index + 1}`"
				:aria-current="index === active ? 'true' : undefined"
				@click="goTo(index)"
			/>
		</div>
	</div>

	<Teleport to="body">
		<Transition
			enter-active-class="transition-opacity duration-200 ease-out"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-opacity duration-150 ease-in"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="previewOpen"
				class="fixed inset-0 z-[100] flex items-center justify-center bg-[#061a39]/95 p-4 backdrop-blur-sm"
				role="dialog"
				aria-modal="true"
				:aria-label="`${altBase} image preview`"
				@click="closePreview"
			>
				<button
					ref="previewCloseButton"
					type="button"
					class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
					aria-label="Close image preview"
					@click.stop="closePreview"
				>
					<X class="h-5 w-5" />
				</button>

				<button
					v-if="canNavigate"
					type="button"
					class="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
					aria-label="Previous image"
					@click.stop="previous"
				>
					<ChevronLeft class="h-6 w-6" />
				</button>

				<img
					v-if="!failedImages.includes(active)"
					:src="images[active]"
					:alt="`${altBase} photo ${active + 1}`"
					class="max-h-[calc(100vh-8rem)] max-w-full rounded-[8px] object-contain shadow-2xl"
					@click.stop
					@error="markImageFailed(active)"
				/>
				<div
					v-else
					class="flex h-64 w-full max-w-[720px] flex-col items-center justify-center gap-3 rounded-[8px] bg-[linear-gradient(135deg,#0a2854,#0b5c6b)] text-white/60 shadow-2xl sm:h-80"
					@click.stop
				>
					<ImageOff class="h-16 w-16" />
					<span class="text-[.8rem] font-semibold">Image unavailable</span>
				</div>

				<button
					v-if="canNavigate"
					type="button"
					class="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
					aria-label="Next image"
					@click.stop="next"
				>
					<ChevronRight class="h-6 w-6" />
				</button>

				<span
					v-if="canNavigate"
					class="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[.75rem] font-semibold text-white"
				>
					{{ active + 1 }} / {{ count }}
				</span>
			</div>
		</Transition>
	</Teleport>
</template>
