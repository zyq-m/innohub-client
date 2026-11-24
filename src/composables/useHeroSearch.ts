import { ref } from 'vue';

const heroSearchInput = ref<HTMLInputElement | null>(null);

export function registerHeroSearch(el: unknown): void {
	heroSearchInput.value = el instanceof HTMLInputElement ? el : null;
}

export function focusHeroSearch(): void {
	const el = heroSearchInput.value;
	if (!el) return;
	el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	el.focus({ preventScroll: true });
}
