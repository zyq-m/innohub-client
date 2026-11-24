import { contentAssetUrl } from '../lib/contentApi';

export type SuccessStoryStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected';

/** Fixed T07 achievement types (innohub.md). */
export const ACHIEVEMENT_TYPES = [
	'Product',
	'Innovation Competition',
	'Patent Granted',
	'Research Grant',
	'Commercialisation',
	'Others',
] as const;

/** Fixed T07 levels / geographic tags (innohub.md). */
export const ACHIEVEMENT_LEVELS = [
	'State',
	'National',
	'International',
	'Not applicable',
] as const;

/** Row returned by `/api/public/success-stories` and `/api/admin/success-stories` (template T07). */
export interface SuccessStory {
	id: number;
	slug: string;
	achievementTitle: string;
	achievementType: string | null;
	level: string | null;
	achievementDate: string | null;
	team: string | null;
	summary: string | null;
	impact: string | null;
	evidenceUrl: string | null;
	photos: string[];
	status: SuccessStoryStatus;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/** Resolve an uploaded photo path (`/uploads/x.png`) against the content origin. */
export function successStoryPhotoUrl(path: string): string {
	return contentAssetUrl(path);
}

export function successStoryCover(story: SuccessStory): string {
	return story.photos?.length ? successStoryPhotoUrl(story.photos[0]) : '';
}

export function successStoryGallery(story: SuccessStory): string[] {
	return (story.photos ?? []).slice(1).map(successStoryPhotoUrl);
}

/** `2026-06-23` → `23 Jun 2026` (returns '' for empty/invalid input). */
export function formatAchievementDate(value: string | null | undefined): string {
	if (!value) return '';
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export interface SuccessStoryInfo {
	label: string;
	value: string;
	href?: string;
}

/** Short label/value pairs shown in the detail sidebar (only non-empty ones). */
export function successStoryInfo(story: SuccessStory): SuccessStoryInfo[] {
	const entries: SuccessStoryInfo[] = [
		{ label: 'Type', value: story.achievementType ?? '' },
		{ label: 'Level', value: story.level ?? '' },
		{ label: 'Date', value: formatAchievementDate(story.achievementDate) },
		{ label: 'Researcher / team / PTj', value: story.team ?? '' },
	];
	return entries.filter((entry) => entry.value.trim() !== '');
}

export interface SuccessStorySection {
	title: string;
	body: string;
}

/** Long-form sections, in template order (only non-empty ones). */
export function successStorySections(story: SuccessStory): SuccessStorySection[] {
	const entries: SuccessStorySection[] = [
		{ title: 'Achievement summary', body: story.summary ?? '' },
		{ title: 'Significance & impact', body: story.impact ?? '' },
	];
	return entries.filter((entry) => entry.body.trim() !== '');
}
