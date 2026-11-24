import { contentAssetUrl } from '../lib/contentApi';

export type ServiceStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected';

/** Fixed T06 service categories (innohub.md). */
export const SERVICE_CATEGORIES = [
	'R&D',
	'Testing & Analysis',
	'Prototyping & Fabrication',
	'Consultancy & Training',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/** Row returned by `/api/public/services` and `/api/admin/services` (template T06). */
export interface ServiceFacility {
	id: number;
	slug: string;
	serviceName: string;
	category: string | null;
	providerUnit: string | null;
	description: string | null;
	expertise: string | null;
	clientTypes: string | null;
	scope: string | null;
	location: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	websiteUrl: string | null;
	photos: string[];
	status: ServiceStatus;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/** Resolve an uploaded photo path (`/uploads/x.png`) against the content origin. */
export function serviceFacilityPhotoUrl(path: string): string {
	return contentAssetUrl(path);
}

export function serviceFacilityCover(service: ServiceFacility): string {
	return service.photos?.length ? serviceFacilityPhotoUrl(service.photos[0]) : '';
}

export function serviceFacilityGallery(service: ServiceFacility): string[] {
	return (service.photos ?? []).slice(1).map(serviceFacilityPhotoUrl);
}

export interface ServiceFacilityInfo {
	label: string;
	value: string;
	href?: string;
}

/** Short label/value pairs shown in the detail sidebar (only non-empty ones). */
export function serviceFacilityInfo(service: ServiceFacility): ServiceFacilityInfo[] {
	const entries: ServiceFacilityInfo[] = [
		{ label: 'Category', value: service.category ?? '' },
		{ label: 'Provider (PTj)', value: service.providerUnit ?? '' },
		{ label: 'Client types', value: service.clientTypes ?? '' },
		{ label: 'Email', value: service.contactEmail ?? '', href: service.contactEmail ? `mailto:${service.contactEmail}` : '' },
		{ label: 'Phone', value: service.contactPhone ?? '' },
	];
	return entries.filter((entry) => entry.value.trim() !== '');
}

export interface ServiceFacilitySection {
	title: string;
	body: string;
}

/** Long-form sections, in template order (only non-empty ones). */
export function serviceFacilitySections(service: ServiceFacility): ServiceFacilitySection[] {
	const entries: ServiceFacilitySection[] = [
		{ title: 'Description & usage', body: service.description ?? '' },
		{ title: 'Expertise & key equipment', body: service.expertise ?? '' },
		{ title: 'Scope & specifications', body: service.scope ?? '' },
		{ title: 'Location & enquiries', body: service.location ?? '' },
	];
	return entries.filter((entry) => entry.body.trim() !== '');
}
