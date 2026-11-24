export type SearchGroup =
	| "products"
	| "researchers"
	| "services"
	| "centres"
	| "research"
	| "stories"
	| "community"
	| "news"
	| "spin-offs";

export interface SearchHit {
	id: string;
	group: SearchGroup;
	title: string;
	subtitle: string;
	excerpt: string;
	image: string;
	badge: string;
	path: string;
	score: number;
}

export interface SearchGroupResult {
	group: SearchGroup;
	label: string;
	hits: SearchHit[];
	total: number;
	viewAllPath?: string;
}

export const GROUP_ORDER: SearchGroup[] = [
	"products",
	"researchers",
	"services",
	"centres",
	"research",
	"stories",
	"community",
	"news",
	"spin-offs",
];

export const GROUP_LABELS: Record<SearchGroup, string> = {
	products: "Products",
	researchers: "Researchers",
	services: "Services",
	centres: "CoE / Institutes",
	research: "Research groups",
	stories: "Success stories",
	community: "Community industry product innovation",
	news: "Community news",
	"spin-offs": "Spin-offs",
};

export function normalize(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

export function tokenize(query: string): string[] {
	return normalize(query).split(" ").filter(Boolean);
}

function fieldText(value: unknown): string {
	if (value == null) return "";
	if (typeof value === "number") return String(value);
	if (typeof value === "string") return value;
	return "";
}

export interface WeightedField {
	value: unknown;
	weight: number;
}

/** Score a record against query tokens. Returns 0 when any token is missing. */
export function scoreFields(query: string, fields: WeightedField[]): number {
	const q = normalize(query);
	const tokens = tokenize(query);
	if (!tokens.length) return 0;

	const normalized = fields.map((f) => ({
		text: normalize(fieldText(f.value)),
		weight: f.weight,
	}));
	const haystack = normalized
		.map((f) => f.text)
		.filter(Boolean)
		.join(" ");
	if (!haystack) return 0;
	if (!tokens.every((t) => haystack.includes(t))) return 0;

	let score = 0;
	for (const { text, weight } of normalized) {
		if (!text) continue;
		if (text === q) score += weight * 12;
		else if (text.startsWith(q)) score += weight * 8;
		else if (text.includes(q)) score += weight * 5;
		for (const token of tokens) {
			if (!token) continue;
			if (text === token) score += weight * 4;
			else if (new RegExp(`\\b${escapeRegExp(token)}`, "i").test(text))
				score += weight * 3;
			else if (text.includes(token)) score += weight * 1.5;
		}
	}
	return score;
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function excerpt(text: string, max = 170): string {
	const clean = text.replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	const cut = clean.slice(0, max);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 80 ? lastSpace : max).trimEnd()}…`;
}
