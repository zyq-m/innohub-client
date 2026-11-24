import { contentAssetUrl } from "../lib/contentApi";

export type CommunityNewsStatus =
	| "draft"
	| "pending"
	| "approved"
	| "published"
	| "rejected";

/** Fixed T05 topic tags (innohub.md). */
export const COMMUNITY_NEWS_TOPICS = [
	"Patent Granted",
	"Research Grant",
	"Commercialisation",
] as const;

/** Fixed T05 levels / geographic tags (innohub.md). */
export const COMMUNITY_NEWS_LEVELS = [
	"State",
	"National",
	"International",
	"Not applicable",
] as const;

/** Row returned by `/api/public/community-news` and `/api/admin/community-news` (template T05). */
export interface CommunityNews {
	id: number;
	slug: string;
	newsTitle: string;
	activityDate: string | null;
	activityLocation: string | null;
	organiser: string | null;
	summary: string | null;
	objectives: string | null;
	beneficiaries: string | null;
	quote: string | null;
	mediaCredit: string | null;
	newsUrl: string | null;
	level: string | null;
	topic: string | null;
	photos: string[];
	status: CommunityNewsStatus;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/** Resolve an uploaded photo path (`/uploads/x.png`) against the content origin. */
export function communityNewsPhotoUrl(path: string): string {
	return contentAssetUrl(path);
}

export function communityNewsCover(item: CommunityNews): string {
	return item.photos?.length ? communityNewsPhotoUrl(item.photos[0]) : "";
}

export function communityNewsGallery(item: CommunityNews): string[] {
	return (item.photos ?? []).slice(1).map(communityNewsPhotoUrl);
}

/** `2026-06-23` → `23 Jun 2026` (returns '' for empty/invalid input). */
export function formatActivityDate(value: string | null | undefined): string {
	if (!value) return "";
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export interface CommunityNewsInfo {
	label: string;
	value: string;
	href?: string;
}

/** Short label/value pairs shown in the detail sidebar (only non-empty ones). */
export function communityNewsInfo(item: CommunityNews): CommunityNewsInfo[] {
	const entries: CommunityNewsInfo[] = [
		{ label: "Date", value: formatActivityDate(item.activityDate) },
		{ label: "Location", value: item.activityLocation ?? "" },
		{ label: "Organiser & partners", value: item.organiser ?? "" },
		{ label: "Photo credit", value: item.mediaCredit ?? "" },
	];
	return entries.filter((entry) => entry.value.trim() !== "");
}

export interface CommunityNewsSection {
	title: string;
	body: string;
}

/** Long-form sections, in template order (only non-empty ones). */
export function communityNewsSections(
	item: CommunityNews,
): CommunityNewsSection[] {
	const entries: CommunityNewsSection[] = [
		{ title: "Summary", body: item.summary ?? "" },
		{ title: "Objectives / main activities", body: item.objectives ?? "" },
		{ title: "Beneficiaries & outcomes", body: item.beneficiaries ?? "" },
	];
	return entries.filter((entry) => entry.body.trim() !== "");
}
