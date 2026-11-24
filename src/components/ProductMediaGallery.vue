<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ChevronLeft, ChevronRight, ImageOff, Play, X } from 'lucide-vue-next';
import { resolveVideo, type ResolvedVideo } from '../data/media';

interface MediaItem {
	type: 'video' | 'image';
	src: string;
	video?: ResolvedVideo;
}

const props = defineProps<{
	images: string[];
	videoUrl?: string;
	altBase: string;
}>();

const active = ref(0);
const previewOpen = ref(false);
const failed = ref<number[]>([]);
const root = ref<HTMLElement | null>(null);
const closeBtn = ref<HTMLButtonElement | null>(null);
const videoEl = ref<HTMLVideoElement | null>(null);
let prevOverflow = '';
let touchStartX = 0;
let suppressClick = false;

const media = computed<MediaItem[]>(() => {
	const items: MediaItem[] = [];
	const video = resolveVideo(props.videoUrl);
	if (video) items.push({ type: 'video', src: video.src, video });
	props.images.forEach((src) => items.push({ type: 'image', src }));
	return items;
});

const count = computed(() => media.value.length);
const canNav = computed(() => count.value > 1);
const activeItem = computed(() => media.value[active.value]);

function markFailed(index: number) {
	if (!failed.value.includes(index)) failed.value = [...failed.value, index];
}

function pauseVideo() {
	videoEl.value?.pause();
}

function goTo(index: number) {
	if (!count.value) return;
	pauseVideo();
	active.value = (index + count.value) % count.value;
}
function prev() { if (canNav.value) goTo(active.value - 1); }
function next() { if (canNav.value) goTo(active.value + 1); }

function onKey(event: KeyboardEvent) {
	if (event.key === 'Escape') { event.preventDefault(); closePreview(); }
	else if (event.key === 'ArrowLeft') { event.preventDefault(); prev(); }
	else if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
}

function openPreview(index = active.value) {
	if (suppressClick || previewOpen.value) return;
	const item = media.value[index];
	if (!item || item.type !== 'image') return;
	active.value = index;
	previewOpen.value = true;
	prevOverflow = document.body.style.overflow;
	document.body.style.overflow = 'hidden';
	window.addEventListener('keydown', onKey);
	void nextTick(() => closeBtn.value?.focus());
}

function closePreview() {
	if (!previewOpen.value) return;
	previewOpen.value = false;
	window.removeEventListener('keydown', onKey);
	document.body.style.overflow = prevOverflow;
	prevOverflow = '';
	void nextTick(() => root.value?.focus());
}

function onTouchStart(e: TouchEvent) { touchStartX = e.touches[0]?.clientX ?? 0; }
function onTouchEnd(e: TouchEvent) {
	if (!canNav.value) return;
	const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
	if (Math.abs(dx) < 40) return;
	suppressClick = true;
	window.setTimeout(() => (suppressClick = false), 350);
	if (dx > 0) prev(); else next();
}

watch(() => [props.images, props.videoUrl], () => {
	active.value = 0;
	failed.value = [];
	if (!count.value) closePreview();
});

onMounted(() => { if (active.value >= count.value) active.value = 0; });
onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKey);
	if (previewOpen.value) document.body.style.overflow = prevOverflow;
	pauseVideo();
});
</script>

<template>
	<div v-if="count" ref="root" class="select-none" tabindex="0" @keydown.left.prevent="prev" @keydown.right.prevent="next">
		<div
			class="relative overflow-hidden rounded-xl border border-line bg-[#f5f5f5]"
			@touchstart.passive="onTouchStart"
			@touchend.passive="onTouchEnd"
		>
			<div class="aspect-[4/3] w-full sm:aspect-square lg:max-h-[520px]">
				<div class="flex h-full transition-transform duration-300 ease-out" :style="{ transform: 'translateX(-' + active * 100 + '%)' }">
					<div v-for="(item, i) in media" :key="item.type + '-' + item.src + '-' + i" class="h-full w-full shrink-0">
						<div v-if="item.type === 'video'" class="h-full w-full bg-black">
							<video
								v-if="item.video?.kind === 'file'"
								:ref="(el) => { if (i === active) videoEl = el as HTMLVideoElement | null; }"
								:src="item.src"
								:poster="images[0] || undefined"
								controls
								playsinline
								preload="metadata"
								class="h-full w-full object-contain"
							/>
							<iframe
								v-else-if="item.video?.embedSrc"
								:src="item.video.embedSrc"
								class="h-full w-full"
								title="Product video"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
								loading="lazy"
							/>
							<a
								v-else
								:href="item.src"
								target="_blank"
								rel="noopener noreferrer"
								class="relative flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a2854,#061a39)] text-white"
							>
								<img v-if="images[0]" :src="images[0]" :alt="altBase" class="absolute inset-0 h-full w-full object-cover opacity-35" />
								<span class="relative grid h-16 w-16 place-items-center rounded-full bg-white/20 ring-1 ring-white/40"><Play class="ml-1 h-7 w-7" /></span>
								<span class="absolute bottom-4 text-[.78rem] font-semibold">Open video</span>
							</a>
						</div>

						<button
							v-else-if="!failed.includes(i)"
							type="button"
							class="block h-full w-full cursor-zoom-in"
							:aria-label="'Preview ' + altBase + ' image ' + (i + 1)"
							@click="openPreview(i)"
						>
							<img :src="item.src" :alt="altBase + ' photo ' + (i + 1)" class="h-full w-full object-cover" loading="lazy" @error="markFailed(i)" />
						</button>
						<div v-else class="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a2854,#0b5c6b)]">
							<ImageOff class="h-10 w-10 text-white/35" />
						</div>
					</div>
				</div>
			</div>

			<template v-if="canNav">
				<button type="button" class="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-navy shadow-card hover:bg-white" aria-label="Previous media" @click="prev"><ChevronLeft class="h-5 w-5" /></button>
				<button type="button" class="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-navy shadow-card hover:bg-white" aria-label="Next media" @click="next"><ChevronRight class="h-5 w-5" /></button>
				<span class="absolute bottom-3 right-3 rounded-full bg-[#061a39]/75 px-2.5 py-1 text-[.7rem] font-semibold text-white">{{ active + 1 }} / {{ count }}</span>
			</template>
		</div>

		<div v-if="canNav" class="mt-3 flex gap-2 overflow-x-auto pb-1">
			<button
				v-for="(item, i) in media"
				:key="'thumb-' + item.type + '-' + i"
				type="button"
				class="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-[72px] sm:w-[72px]"
				:class="i === active ? 'border-brandblue' : 'border-transparent hover:border-line'"
				:aria-label="item.type === 'video' ? 'Show video' : 'Show image ' + (i + 1)"
				@click="goTo(i)"
			>
				<img v-if="item.type === 'image' && !failed.includes(i)" :src="item.src" alt="" class="h-full w-full object-cover" loading="lazy" @error="markFailed(i)" />
				<img v-else-if="images[0] && !failed.includes(0)" :src="images[0]" alt="" class="h-full w-full object-cover" />
				<div v-else class="h-full w-full bg-[linear-gradient(135deg,#0a2854,#0b5c6b)]"></div>
				<span v-if="item.type === 'video'" class="absolute inset-0 grid place-items-center bg-black/20">
					<span class="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-navy"><Play class="ml-0.5 h-3.5 w-3.5" /></span>
				</span>
			</button>
		</div>

		<Teleport to="body">
			<div v-if="previewOpen && activeItem?.type === 'image'" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#061a39]/95 p-4" role="dialog" aria-modal="true" :aria-label="altBase + ' image preview'" @click="closePreview">
				<button ref="closeBtn" type="button" class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close preview" @click.stop="closePreview"><X class="h-5 w-5" /></button>
				<button v-if="canNav" type="button" class="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous image" @click.stop="prev"><ChevronLeft class="h-6 w-6" /></button>
				<img v-if="!failed.includes(active)" :src="activeItem.src" :alt="altBase + ' photo'" class="max-h-[calc(100vh-7rem)] max-w-full rounded-lg object-contain shadow-2xl" @click.stop @error="markFailed(active)" />
				<div v-else class="flex h-64 w-full max-w-[720px] flex-col items-center justify-center gap-3 rounded-lg bg-[linear-gradient(135deg,#0a2854,#0b5c6b)] text-white/60" @click.stop><ImageOff class="h-16 w-16" /><span class="text-[.8rem] font-semibold">Image unavailable</span></div>
				<button v-if="canNav" type="button" class="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next image" @click.stop="next"><ChevronRight class="h-6 w-6" /></button>
				<span v-if="canNav" class="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[.75rem] font-semibold text-white">{{ active + 1 }} / {{ count }}</span>
			</div>
		</Teleport>
	</div>
</template>
