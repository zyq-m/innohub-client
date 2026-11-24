import { reactive } from 'vue';

const SAVED_KEY = 'innohub-saved';

const state = reactive({
	saved: [] as string[],
	mobileMenu: false,
});

function hydrate(): void {
	try {
		const stored: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
		state.saved = Array.isArray(stored) ? stored.map(String) : [];
	} catch {
		state.saved = [];
	}
}

function isSaved(id: string): boolean {
	return state.saved.indexOf(id) !== -1;
}

function toggleSaved(id: string): void {
	state.saved = isSaved(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id];
	try {
		localStorage.setItem(SAVED_KEY, JSON.stringify(state.saved));
	} catch {
		/* Saving still works for this visit. */
	}
}

function closeMobileMenu(): void {
	state.mobileMenu = false;
}

export function useMarketplace() {
	return { state, hydrate, isSaved, toggleSaved, closeMobileMenu };
}
