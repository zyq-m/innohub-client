import { contentAssetUrl } from '../lib/contentApi';

export type ResearchGroupStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected';

/** Row returned by `/api/public/research-groups` and `/api/admin/research-groups` (template T03). */
export interface ResearchGroup {
	id: number;
	slug: string;
	groupName: string;
	groupType: string | null;
	parentCluster: string | null;
	faculty: string | null;
	leads: string | null;
	expertise: string | null;
	focus: string | null;
	projects: string | null;
	facilities: string | null;
	outcomes: string | null;
	collaboration: string | null;
	contactEmail: string | null;
	websiteUrl: string | null;
	photos: string[];
	status: ResearchGroupStatus;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/** Resolve an uploaded photo path (`/uploads/x.png`) against the content origin. */
export function researchGroupPhotoUrl(path: string): string {
	return contentAssetUrl(path);
}

export function researchGroupCover(group: ResearchGroup): string {
	return group.photos?.length ? researchGroupPhotoUrl(group.photos[0]) : '';
}

export function researchGroupGallery(group: ResearchGroup): string[] {
	return (group.photos ?? []).slice(1).map(researchGroupPhotoUrl);
}

export function researchGroupType(group: ResearchGroup): string {
	return (group.groupType ?? '').trim().toLowerCase();
}

export function isKlusterGroup(group: ResearchGroup): boolean {
	return researchGroupType(group).startsWith('kluster');
}

/** The cluster a group belongs to: `parentCluster` for SIG/RG, own name for a Kluster. */
export function clusterOf(group: ResearchGroup): string {
	const parent = group.parentCluster?.trim();
	if (parent) return parent;
	if (isKlusterGroup(group)) return group.groupName;
	return 'Unaffiliated';
}

export interface ClusterTypeGroup {
	cluster: string;
	kluster?: ResearchGroup;
	sigs: ResearchGroup[];
	rgs: ResearchGroup[];
	others: ResearchGroup[];
}

function sortGroups(items: ResearchGroup[]): ResearchGroup[] {
	return [...items].sort((a, b) => {
		if (a.featured !== b.featured) return a.featured ? -1 : 1;
		return a.groupName.localeCompare(b.groupName);
	});
}

/** Cluster → SIG / RG children, both attached directly to the cluster. */
export function groupByClusterType(groups: ResearchGroup[]): ClusterTypeGroup[] {
	const buckets = new Map<string, ClusterTypeGroup>();

	const ensure = (cluster: string): ClusterTypeGroup => {
		const existing = buckets.get(cluster);
		if (existing) return existing;
		const bucket: ClusterTypeGroup = { cluster, sigs: [], rgs: [], others: [] };
		buckets.set(cluster, bucket);
		return bucket;
	};

	for (const group of groups) {
		if (isKlusterGroup(group)) {
			ensure(group.groupName).kluster = group;
			continue;
		}

		const bucket = ensure(clusterOf(group));
		if (researchGroupType(group) === 'sig') bucket.sigs.push(group);
		else if (researchGroupType(group) === 'rg') bucket.rgs.push(group);
		else bucket.others.push(group);
	}

	return [...buckets.values()]
		.sort((a, b) => a.cluster.localeCompare(b.cluster))
		.map((bucket) => ({
			...bucket,
			sigs: sortGroups(bucket.sigs),
			rgs: sortGroups(bucket.rgs),
			others: sortGroups(bucket.others),
		}));
}

export interface FacultyGroup {
	faculty: string;
	items: ResearchGroup[];
}

const OTHER_FACULTY = 'Other research groups';

/** Bucket RGs by their faculty shortForm, with unassigned groups last. */
export function groupByFaculty(groups: ResearchGroup[]): FacultyGroup[] {
	const buckets = new Map<string, ResearchGroup[]>();

	for (const group of groups) {
		const key = group.faculty?.trim() || OTHER_FACULTY;
		const bucket = buckets.get(key);
		if (bucket) bucket.push(group);
		else buckets.set(key, [group]);
	}

	return [...buckets.entries()]
		.sort(([a], [b]) => {
			if (a === OTHER_FACULTY) return 1;
			if (b === OTHER_FACULTY) return -1;
			return a.localeCompare(b);
		})
		.map(([faculty, items]) => ({ faculty, items: sortGroups(items) }));
}

export interface ResearchGroupInfo {
	label: string;
	value: string;
	href?: string;
}

/** Short label/value pairs shown in the detail sidebar (only non-empty ones). */
export function researchGroupInfo(group: ResearchGroup, faculty = ''): ResearchGroupInfo[] {
	const cluster = clusterOf(group);
	const entries: ResearchGroupInfo[] = [
		{ label: 'Group type', value: group.groupType ?? '' },
		{ label: 'Parent cluster', value: group.parentCluster ? cluster : '' },
		{ label: 'Faculty', value: faculty },
		{ label: 'Lead & members', value: group.leads ?? '' },
		{ label: 'Email', value: group.contactEmail ?? '', href: group.contactEmail ? `mailto:${group.contactEmail}` : '' },
	];
	return entries.filter((entry) => entry.value.trim() !== '');
}

export interface ResearchGroupSection {
	title: string;
	body: string;
}

/** Long-form profile sections in template order (only non-empty ones). */
export function researchGroupSections(group: ResearchGroup): ResearchGroupSection[] {
	const entries: ResearchGroupSection[] = [
		{ title: 'Focus & objectives', body: group.focus ?? '' },
		{ title: 'Expertise & research themes', body: group.expertise ?? '' },
		{ title: 'Current projects & grants', body: group.projects ?? '' },
		{ title: 'Facilities & technology', body: group.facilities ?? '' },
		{ title: 'Flagship outcomes', body: group.outcomes ?? '' },
		{ title: 'Collaboration opportunities', body: group.collaboration ?? '' },
	];
	return entries.filter((entry) => entry.body.trim() !== '');
}
