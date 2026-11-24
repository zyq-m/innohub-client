<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { escapeRegExp, tokenize, type SearchHit } from '../data/search';

const props = defineProps<{ hit: SearchHit; query: string }>();

function parts(text: string): { text: string; mark: boolean }[] {
	const tokens = tokenize(props.query).filter((t) => t.length > 1);
	if (!tokens.length || !text) return [{ text, mark: false }];
	const re = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'ig');
	const out: { text: string; mark: boolean }[] = [];
	let last = 0;
	for (const match of text.matchAll(re)) {
		const i = match.index ?? 0;
		if (i > last) out.push({ text: text.slice(last, i), mark: false });
		out.push({ text: match[0], mark: true });
		last = i + match[0].length;
	}
	if (last < text.length) out.push({ text: text.slice(last), mark: false });
	return out.length ? out : [{ text, mark: false }];
}

const titleParts = computed(() => parts(props.hit.title));
const excerptParts = computed(() => parts(props.hit.excerpt));
</script>

<template>
	<RouterLink
		:to="hit.path"
		class="group flex gap-4 rounded-xl border border-line bg-white p-4 transition hover:border-navy/25 hover:shadow-sm"
	>
		<div class="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-ice">
			<img v-if="hit.image" :src="hit.image" :alt="hit.title" class="h-full w-full object-cover" loading="lazy" />
			<div v-else class="flex h-full w-full items-center justify-center text-[.65rem] font-bold uppercase tracking-[.1em] text-navy/30">
				{{ hit.group }}
			</div>
		</div>
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex flex-wrap items-center gap-2">
				<span class="rounded-full bg-navy/6 px-2 py-0.5 text-[.62rem] font-semibold uppercase tracking-[.08em] text-navy/70">{{ hit.badge }}</span>
			</div>
			<h3 class="text-[.98rem] font-bold leading-snug text-navy group-hover:text-blue">
				<template v-for="(part, i) in titleParts" :key="i">
					<mark v-if="part.mark" class="rounded bg-gold/35 px-0.5 text-inherit">{{ part.text }}</mark>
					<template v-else>{{ part.text }}</template>
				</template>
			</h3>
			<p v-if="hit.subtitle" class="mt-0.5 text-[.76rem] text-ink/60">{{ hit.subtitle }}</p>
			<p v-if="hit.excerpt" class="mt-1.5 line-clamp-2 text-[.8rem] leading-relaxed text-ink/75">
				<template v-for="(part, i) in excerptParts" :key="i">
					<mark v-if="part.mark" class="rounded bg-gold/35 px-0.5 text-inherit">{{ part.text }}</mark>
					<template v-else>{{ part.text }}</template>
				</template>
			</p>
		</div>
	</RouterLink>
</template>
