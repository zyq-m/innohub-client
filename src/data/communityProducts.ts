import { contentAssetUrl } from '../lib/contentApi';

export type CommunityProductStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected';

/** Row returned by `/api/public/community-products` and `/api/admin/community-products` (template T04). */
export interface CommunityProduct {
	id: number;
	slug: string;
	productName: string;
	beneficiaries: string | null;
	communityProblem: string | null;
	description: string | null;
	innovator: string | null;
	developmentStatus: string | null;
	impact: string | null;
	partners: string | null;
	photos: string[];
	status: CommunityProductStatus;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/** Resolve an uploaded photo path (`/uploads/x.png`) against the content origin. */
export function communityProductPhotoUrl(path: string): string {
	return contentAssetUrl(path);
}

export function communityProductCover(product: CommunityProduct): string {
	return product.photos?.length ? communityProductPhotoUrl(product.photos[0]) : '';
}

export function communityProductGallery(product: CommunityProduct): string[] {
	return (product.photos ?? []).slice(1).map(communityProductPhotoUrl);
}

export interface CommunityProductInfo {
	label: string;
	value: string;
	href?: string;
}

/** Short label/value pairs shown in the detail sidebar (only non-empty ones). */
export function communityProductInfo(product: CommunityProduct): CommunityProductInfo[] {
	const entries: CommunityProductInfo[] = [
		{ label: 'Innovator / owner', value: product.innovator ?? '' },
		{ label: 'Development status', value: product.developmentStatus ?? '' },
	];
	return entries.filter((entry) => entry.value.trim() !== '');
}

export interface CommunityProductSection {
	title: string;
	body: string;
}

/** Long-form profile sections, in template order (only non-empty ones). */
export function communityProductSections(product: CommunityProduct): CommunityProductSection[] {
	const entries: CommunityProductSection[] = [
		{ title: 'The community problem', body: product.communityProblem ?? '' },
		{ title: 'Product description & function', body: product.description ?? '' },
		{ title: 'Beneficiaries & location', body: product.beneficiaries ?? '' },
		{ title: 'Proven benefits & impact', body: product.impact ?? '' },
		{ title: 'Community & agency partners', body: product.partners ?? '' },
	];
	return entries.filter((entry) => entry.body.trim() !== '');
}
