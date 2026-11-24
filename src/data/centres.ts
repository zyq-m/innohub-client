import { contentAssetUrl } from "../lib/contentApi";

export type CentreStatus =
	| "draft"
	| "pending"
	| "approved"
	| "published"
	| "rejected";

/** Row returned by `/api/public/centres` and `/api/admin/centres` (template T02). */
export interface Centre {
	id: number;
	slug: string;
	officialName: string;
	expertise: string | null;
	mission: string | null;
	director: string | null;
	facilities: string | null;
	services: string | null;
	projects: string | null;
	outcomes: string | null;
	partners: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	websiteUrl: string | null;
	photos: string[];
	status: CentreStatus;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/** Resolve an uploaded photo path (`/uploads/x.png`) against the content origin. */
export function centrePhotoUrl(path: string): string {
	return contentAssetUrl(path);
}

export function centreCover(centre: Centre): string {
	return centre.photos?.length ? centrePhotoUrl(centre.photos[0]) : "";
}

export function centreGallery(centre: Centre): string[] {
	return (centre.photos ?? []).slice(1).map(centrePhotoUrl);
}

export interface CentreInfo {
	label: string;
	value: string;
	href?: string;
}

/** Short label/value pairs shown in the detail sidebar (only non-empty ones). */
export function centreInfo(centre: Centre): CentreInfo[] {
	const entries: CentreInfo[] = [
		{ label: "Director / contact officer", value: centre.director ?? "" },
		{
			label: "Email",
			value: centre.contactEmail ?? "",
			href: centre.contactEmail ? `mailto:${centre.contactEmail}` : "",
		},
		{ label: "Phone", value: centre.contactPhone ?? "" },
		{ label: "Expertise", value: centre.expertise ?? "" },
		{ label: "Services", value: centre.services ?? "" },
	];
	return entries.filter((entry) => entry.value.trim() !== "");
}

export interface CentreSection {
	title: string;
	body: string;
}

/** Long-form profile sections in template order (only non-empty ones). */
export function centreSections(centre: Centre): CentreSection[] {
	const entries: CentreSection[] = [
		{ title: "Mission, role & uniqueness", body: centre.mission ?? "" },
		{ title: "Facilities & key technology", body: centre.facilities ?? "" },
		{ title: "Selected projects & grants", body: centre.projects ?? "" },
		{ title: "Outcomes & impact", body: centre.outcomes ?? "" },
		{ title: "Strategic partners", body: centre.partners ?? "" },
	];
	return entries.filter((entry) => entry.body.trim() !== "");
}
