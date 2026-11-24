/**
 * Config-driven schema for the admin CRUD screens.
 * Adding a new content type (T04–T08) means adding one entry here — the list and
 * edit views render themselves from these definitions.
 */

export interface AdminRecord {
	id: number;
	slug: string;
	status: string;
	isPublished: boolean;
	featured: boolean;
	publishedAt: string | null;
	photos: string[];
	createdAt?: string;
	updatedAt?: string;
	[key: string]: unknown;
}

export type FieldType =
	| "text"
	| "textarea"
	| "number"
	| "email"
	| "url"
	| "checkbox"
	| "select"
	| "faculty";

export interface ResourceField {
	name: string;
	label: string;
	type: FieldType;
	required?: boolean;
	help?: string;
	options?: readonly string[];
	rows?: number;
}

export interface ResourceColumn {
	name: string;
	label: string;
}

export type ResourceFilter = "type" | "cluster" | "category" | "level";

/** Select options for the list-view filters, keyed by filter name. */
export interface ResourceFilterOptions {
	type?: readonly string[];
	category?: readonly string[];
	level?: readonly string[];
}

export interface ResourceDef {
	key: string;
	label: string;
	singular: string;
	endpoint: string;
	titleField: string;
	publicPath: string;
	columns: ResourceColumn[];
	filters: ResourceFilter[];
	filterOptions?: ResourceFilterOptions;
	fields: ResourceField[];
}

export const STATUSES = [
	"draft",
	"pending",
	"approved",
	"published",
	"rejected",
] as const;

export const STATUS_LABELS: Record<string, string> = {
	draft: "Draft",
	pending: "Pending review",
	approved: "Approved",
	published: "Published",
	rejected: "Rejected",
};

export const resources: ResourceDef[] = [
	{
		key: "spin-offs",
		label: "Spin-off companies",
		singular: "Spin-off company",
		endpoint: "/admin/spin-offs",
		titleField: "companyName",
		publicPath: "/spin-offs/:slug",
		columns: [
			{ name: "companyName", label: "Company" },
			{ name: "technologyField", label: "Technology field" },
			{ name: "yearEstablished", label: "Year" },
		],
		filters: [],
		fields: [
			{
				name: "companyName",
				label: "Registered company name",
				type: "text",
				required: true,
			},
			{
				name: "registrationNumber",
				label: "Company registration number",
				type: "text",
			},
			{ name: "yearEstablished", label: "Year established", type: "number" },
			{
				name: "technologyField",
				label: "Technology field / industry",
				type: "text",
			},
			{
				name: "productSolutions",
				label: "Main product or solution",
				type: "textarea",
				rows: 3,
			},
			{
				name: "marketProblem",
				label: "Market problem & value proposition",
				type: "textarea",
				rows: 3,
			},
			{
				name: "targetMarket",
				label: "Customers / target market",
				type: "text",
			},
			{
				name: "traction",
				label: "Key achievements / traction",
				type: "textarea",
				rows: 3,
				help: "Verified figures only",
			},
			{ name: "ipStatus", label: "IP status / IP number", type: "text" },
			{
				name: "collaborationContact",
				label: "Collaboration & public contact",
				type: "textarea",
				rows: 2,
			},
			{ name: "contactEmail", label: "Company email", type: "email" },
			{ name: "contactPhone", label: "Company phone", type: "text" },
			{ name: "websiteUrl", label: "Official website", type: "url" },
			{ name: "featured", label: "Featured", type: "checkbox" },
		],
	},
	{
		key: "centres",
		label: "CoE / Institutes",
		singular: "CoE / Institute",
		endpoint: "/admin/centres",
		titleField: "officialName",
		publicPath: "/centres/:slug",
		columns: [
			{ name: "officialName", label: "Centre" },
			{ name: "expertise", label: "Expertise" },
			{ name: "director", label: "Director" },
		],
		filters: [],
		fields: [
			{
				name: "officialName",
				label: "Official CoE / institute name",
				type: "text",
				required: true,
			},
			{ name: "expertise", label: "Expertise & main focus", type: "text" },
			{
				name: "mission",
				label: "Mission / role / uniqueness",
				type: "textarea",
				rows: 3,
			},
			{
				name: "director",
				label: "Director / public contact officer",
				type: "text",
			},
			{
				name: "facilities",
				label: "Facilities & key technology",
				type: "textarea",
				rows: 3,
			},
			{
				name: "services",
				label: "Services / collaboration areas",
				type: "textarea",
				rows: 3,
			},
			{
				name: "projects",
				label: "Selected projects / grants",
				type: "textarea",
				rows: 3,
			},
			{
				name: "outcomes",
				label: "Outcomes & impact",
				type: "textarea",
				rows: 3,
			},
			{
				name: "partners",
				label: "Selected strategic partners",
				type: "textarea",
				rows: 2,
			},
			{ name: "contactEmail", label: "Office email", type: "email" },
			{ name: "contactPhone", label: "Office phone", type: "text" },
			{
				name: "websiteUrl",
				label: "Official website / member profile",
				type: "url",
			},
			{ name: "featured", label: "Featured", type: "checkbox" },
		],
	},
	{
		key: "research-groups",
		label: "Cluster / SIG / RG",
		singular: "Research group",
		endpoint: "/admin/research-groups",
		titleField: "groupName",
		publicPath: "/research-partners/:slug",
		columns: [
			{ name: "groupName", label: "Group" },
			{ name: "groupType", label: "Type" },
			{ name: "parentCluster", label: "Parent cluster" },
			{ name: "faculty", label: "Faculty" },
		],
		filters: ["type", "cluster"],
		filterOptions: { type: ["Kluster", "SIG", "RG"] },
		fields: [
			{ name: "groupName", label: "Group name", type: "text", required: true },
			{
				name: "groupType",
				label: "Group type",
				type: "select",
				options: ["Kluster", "SIG", "RG"],
				help: "Kluster has no parent; SIG and RG sit under a parent cluster.",
			},
			{
				name: "parentCluster",
				label: "Parent cluster",
				type: "text",
				help: "SIG / RG only",
			},
			{
				name: "faculty",
				label: "Faculty",
				type: "faculty",
				help: "RG only. Selected from the faculty lookup.",
			},
			{ name: "leads", label: "Lead & main members", type: "text" },
			{ name: "expertise", label: "Expertise / research theme", type: "text" },
			{ name: "focus", label: "Focus & objectives", type: "textarea", rows: 3 },
			{
				name: "projects",
				label: "Current projects / disclosable grants",
				type: "textarea",
				rows: 3,
			},
			{
				name: "facilities",
				label: "Facilities / available technology",
				type: "textarea",
				rows: 3,
			},
			{
				name: "outcomes",
				label: "Key achievements / Significant outputs",
				type: "textarea",
				rows: 3,
				help: "Publications, IP, prototypes, impact",
			},
			{
				name: "collaboration",
				label: "Collaboration opportunities",
				type: "textarea",
				rows: 2,
			},
			{ name: "contactEmail", label: "Contact email", type: "email" },
			{ name: "websiteUrl", label: "Official website", type: "url" },
			{ name: "featured", label: "Featured", type: "checkbox" },
		],
	},
	{
		key: "community-products",
		label: "Community Innovation",
		singular: "Community product",
		endpoint: "/admin/community-products",
		titleField: "productName",
		publicPath: "/community/:slug",
		columns: [
			{ name: "productName", label: "Product" },
			{ name: "innovator", label: "Innovator" },
			{ name: "developmentStatus", label: "Status" },
		],
		filters: [],
		fields: [
			{
				name: "productName",
				label: "Product name",
				type: "text",
				required: true,
			},
			{
				name: "communityProblem",
				label: "Community problem addressed",
				type: "textarea",
				rows: 3,
			},
			{
				name: "description",
				label: "Product description & function",
				type: "textarea",
				rows: 4,
			},
			{
				name: "beneficiaries",
				label: "Beneficiaries & location",
				type: "textarea",
				rows: 3,
			},
			{ name: "innovator", label: "Innovator / owner", type: "text" },
			{
				name: "developmentStatus",
				label: "Development status",
				type: "text",
				help: "e.g. Prototype, pilot, in production",
			},
			{
				name: "impact",
				label: "Proven benefits & impact",
				type: "textarea",
				rows: 3,
			},
			{
				name: "partners",
				label: "Community & agency partners",
				type: "textarea",
				rows: 2,
			},
			{ name: "featured", label: "Featured", type: "checkbox" },
		],
	},
	{
		key: "services",
		label: "Services & Facilities",
		singular: "Service / facility",
		endpoint: "/admin/services",
		titleField: "serviceName",
		publicPath: "/services/:slug",
		columns: [
			{ name: "serviceName", label: "Service / facility" },
			{ name: "category", label: "Category" },
			{ name: "providerUnit", label: "Provider (PTj)" },
		],
		filters: ["category"],
		filterOptions: {
			category: [
				"R&D",
				"Testing & Analysis",
				"Prototyping & Fabrication",
				"Consultancy & Training",
			],
		},
		fields: [
			{
				name: "serviceName",
				label: "Service / facility name",
				type: "text",
				required: true,
			},
			{
				name: "category",
				label: "Service category",
				type: "select",
				options: [
					"R&D",
					"Testing & Analysis",
					"Prototyping & Fabrication",
					"Consultancy & Training",
				],
			},
			{ name: "providerUnit", label: "Provider (PTj)", type: "text" },
			{
				name: "description",
				label: "Short description / usage",
				type: "textarea",
				rows: 3,
			},
			{
				name: "expertise",
				label: "Expertise / key equipment",
				type: "textarea",
				rows: 3,
			},
			{ name: "clientTypes", label: "Client types", type: "text" },
			{
				name: "scope",
				label: "Scope & key specifications",
				type: "textarea",
				rows: 3,
				help: "Only what may be published",
			},
			{
				name: "location",
				label: "Location / how to enquire",
				type: "textarea",
				rows: 2,
			},
			{ name: "contactEmail", label: "Office email", type: "email" },
			{ name: "contactPhone", label: "Office phone", type: "text" },
			{ name: "websiteUrl", label: "Official website", type: "url" },
			{ name: "featured", label: "Featured", type: "checkbox" },
		],
	},
	{
		key: "success-stories",
		label: "Success Stories",
		singular: "Achievement",
		endpoint: "/admin/success-stories",
		titleField: "achievementTitle",
		publicPath: "/stories/:slug",
		columns: [
			{ name: "achievementTitle", label: "Achievement" },
			{ name: "achievementType", label: "Type" },
			{ name: "level", label: "Level" },
		],
		filters: ["type", "level"],
		filterOptions: {
			type: [
				"Product",
				"Innovation Competition",
				"Patent Granted",
				"Research Grant",
				"Commercialisation",
				"Others",
			],
			level: ["State", "National", "International", "Not applicable"],
		},
		fields: [
			{
				name: "achievementTitle",
				label: "Achievement title",
				type: "text",
				required: true,
			},
			{
				name: "achievementType",
				label: "Achievement type",
				type: "select",
				options: [
					"Product",
					"Innovation Competition",
					"Patent Granted",
					"Research Grant",
					"Commercialisation",
					"Others",
				],
			},
			{
				name: "level",
				label: "Level",
				type: "select",
				options: ["State", "National", "International", "Not applicable"],
			},
			{
				name: "achievementDate",
				label: "Achievement date",
				type: "text",
				help: "Format YYYY-MM-DD, e.g. 2026-06-23",
			},
			{ name: "team", label: "Researcher / team / PTj", type: "text" },
			{
				name: "summary",
				label: "Achievement summary",
				type: "textarea",
				rows: 5,
				help: "150–250 words",
			},
			{
				name: "impact",
				label: "Significance & impact",
				type: "textarea",
				rows: 4,
			},
			{ name: "evidenceUrl", label: "Evidence / reference link", type: "url" },
			{ name: "featured", label: "Featured", type: "checkbox" },
		],
	},
	{
		key: "community-news",
		label: "Community News",
		singular: "News item",
		endpoint: "/admin/community-news",
		titleField: "newsTitle",
		publicPath: "/community/news/:slug",
		columns: [
			{ name: "newsTitle", label: "News title" },
			{ name: "topic", label: "Topic" },
			{ name: "level", label: "Level" },
		],
		filters: ["type", "level"],
		filterOptions: {
			type: [
				"Product",
				"Innovation Competition",
				"Patent Granted",
				"Research Grant",
				"Commercialisation",
				"Community",
				"Other",
			],
			level: ["State", "National", "International", "Not applicable"],
		},
		fields: [
			{
				name: "newsTitle",
				label: "News title",
				type: "text",
				required: true,
				help: "Around 12 words",
			},
			{
				name: "activityDate",
				label: "Activity date",
				type: "text",
				help: "Format YYYY-MM-DD, e.g. 2026-05-18",
			},
			{ name: "activityLocation", label: "Activity location", type: "text" },
			{
				name: "organiser",
				label: "Organiser & collaboration partners",
				type: "textarea",
				rows: 2,
			},
			{
				name: "topic",
				label: "Topic",
				type: "select",
				options: [
					"Product",
					"Innovation Competition",
					"Patent Granted",
					"Research Grant",
					"Commercialisation",
					"Community",
					"Other",
				],
			},
			{
				name: "level",
				label: "Level",
				type: "select",
				options: ["State", "National", "International", "Not applicable"],
			},
			{
				name: "summary",
				label: "News summary (EN)",
				type: "textarea",
				rows: 5,
				help: "150–250 words",
			},
			{
				name: "objectives",
				label: "Objectives / main activities",
				type: "textarea",
				rows: 4,
			},
			{
				name: "beneficiaries",
				label: "Beneficiaries / outcomes",
				type: "textarea",
				rows: 4,
			},
			{
				name: "quote",
				label: "Approved quote",
				type: "textarea",
				rows: 3,
				help: "Optional",
			},
			{
				name: "mediaCredit",
				label: "Photo / caption / credit & consent",
				type: "textarea",
				rows: 2,
				help: "Credit and consent details for published photos",
			},
			{ name: "newsUrl", label: "News / social media link", type: "url" },
			{ name: "featured", label: "Featured", type: "checkbox" },
		],
	},
];

export function getResource(key: string | undefined): ResourceDef | undefined {
	if (!key) return undefined;
	return resources.find((resource) => resource.key === key);
}

export function recordTitle(
	record: AdminRecord | null,
	def: ResourceDef,
): string {
	if (!record) return "";
	const value = record[def.titleField];
	return typeof value === "string" && value.trim() ? value : def.singular;
}

export function publicUrl(
	def: ResourceDef,
	record: AdminRecord | null,
): string {
	if (!record?.slug) return "";
	return def.publicPath.replace(":slug", record.slug);
}

export function toCellText(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}

export function formatDate(value: unknown): string {
	if (typeof value !== "string" || !value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}
