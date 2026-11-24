import { contentAssetUrl } from '../lib/contentApi';

export type SpinOffStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected';

/** Row returned by `/api/public/spin-offs` and `/api/admin/spin-offs`. */
export interface SpinOff {
	id: number;
	slug: string;
	companyName: string;
	registrationNumber: string | null;
	yearEstablished: number | null;
	technologyField: string | null;
	productSolutions: string | null;
	marketProblem: string | null;
	targetMarket: string | null;
	traction: string | null;
	ipStatus: string | null;
	collaborationContact: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	websiteUrl: string | null;
	photos: string[];
	status: SpinOffStatus;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/** Resolve an uploaded photo path (`/uploads/x.png`) against the content origin. */
export function spinOffPhotoUrl(path: string): string {
	return contentAssetUrl(path);
}

export function spinOffCover(spinOff: SpinOff): string {
	return spinOff.photos?.length ? spinOffPhotoUrl(spinOff.photos[0]) : '';
}

export function spinOffGallery(spinOff: SpinOff): string[] {
	return (spinOff.photos ?? []).slice(1).map(spinOffPhotoUrl);
}

export interface SpinOffInfo {
	label: string;
	value: string;
	href?: string;
}

/** Short label/value pairs shown in the detail sidebar (only non-empty ones). */
export function spinOffInfo(spinOff: SpinOff): SpinOffInfo[] {
	const entries: SpinOffInfo[] = [
		{ label: 'Registration no.', value: spinOff.registrationNumber ?? '' },
		{ label: 'Year established', value: spinOff.yearEstablished ? String(spinOff.yearEstablished) : '' },
		{ label: 'Technology field', value: spinOff.technologyField ?? '' },
		{ label: 'Target market', value: spinOff.targetMarket ?? '' },
		{ label: 'IP status', value: spinOff.ipStatus ?? '' },
		{ label: 'Email', value: spinOff.contactEmail ?? '', href: spinOff.contactEmail ? `mailto:${spinOff.contactEmail}` : '' },
		{ label: 'Phone', value: spinOff.contactPhone ?? '' },
		{ label: 'Collaboration opportunities', value: spinOff.collaborationContact ?? '' },
	];
	return entries.filter((entry) => entry.value.trim() !== '');
}

export interface SpinOffSection {
	title: string;
	body: string;
}

/** Long-form profile sections, in reading order (only non-empty ones). */
export function spinOffSections(spinOff: SpinOff): SpinOffSection[] {
	const entries: SpinOffSection[] = [
		{ title: 'The market gap', body: spinOff.marketProblem ?? '' },
		{ title: 'Product or solution', body: spinOff.productSolutions ?? '' },
		{ title: 'Traction', body: spinOff.traction ?? '' },
	];
	return entries.filter((entry) => entry.body.trim() !== '');
}
