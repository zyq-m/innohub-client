import {
	Briefcase,
	Building2,
	ChartColumn,
	ClipboardList,
	FlaskConical,
	Instagram,
	Landmark,
	Linkedin,
	MessageSquare,
	Rocket,
	Share2,
	Users,
	Wrench,
	Youtube,
} from "lucide-vue-next";
import type { Component } from "vue";

export interface Content {
	brand: string;
	tagline: string;
	meta_description: string;
	hero_heading: string;
	hero_accent: string;
	hero_description: string;
	featured_title: string;
	featured_description: string;
	popular_label: string;
	categories_title: string;
	categories_all_label: string;
	services_title: string;
	services_description: string;
	story_title: string;
	story_subtitle: string;
	story_text: string;
	collaborate_title: string;
	collaborate_text: string;
	contact_label: string;
	contact_email: string;
	partner_caption: string;
	contact_address: string;
	contact_phone: string;
	contact_hours: string;
	contact_office: string;
	newsletter_title: string;
	newsletter_text: string;
	newsletter_button: string;
	footer_tagline: string;
	footer_text: string;
	about_heading: string;
	about_lead: string;
	trl_title: string;
	trl_text: string;
	trl_help: string;
	linkedin?: string;
	instagram?: string;
	youtube?: string;
}

export interface NavLink {
	label: string;
	path: string;
	hash: string;
	active?: boolean;
}

export interface SiteLink {
	label: string;
	path: string;
	hash?: string;
}

export interface Metric {
	icon: Component;
	value: string;
	label: string;
}

export interface Pathway {
	icon: Component;
	title: string;
	description: string;
	/** In-page anchor target (used when `route` is not set). */
	target: string;
	/** Full route path — navigates to a page instead of scrolling to an anchor. */
	route?: string;
}

export interface Service {
	icon: Component;
	label: string;
	detail: string;
}

export interface StoryStat {
	value: string;
	label: string;
}

export interface Social {
	key: string;
	url: string;
	icon: Component;
	label: string;
}

export const content: Content = {
	brand: "InnoHub",
	tagline: "INNOVATION MARKETPLACE",
	meta_description:
		"InnoHub connects research-led innovations with industry, investors, government and communities.",
	hero_heading: "Innovating for",
	hero_accent: "Faith. People. Future.",
	hero_description:
		"Discover research-driven innovations and expert solutions to empower industry and society.",
	featured_title: "Featured Innovations",
	featured_description: "Cutting-edge technologies by our researchers",
	popular_label: "Popular searches:",
	categories_title: "Explore by Category",
	categories_all_label: "All categories",
	services_title: "Services & Facilities",
	services_description: "Leverage our expertise, labs and equipment",
	story_title: "Success Stories",
	story_subtitle: "Real impact through collaboration",
	story_text:
		"Connecting research expertise with industry challenges, from the first prototype to real-world applications.",
	collaborate_title: "Ready to Collaborate with InnoHub?",
	collaborate_text:
		"Let’s turn innovative ideas into real-world impact together.",
	contact_label: "Get in Touch",
	contact_email: "rmic@unisza.edu.my",
	partner_caption: "Partnership Opportunities",
	contact_address:
		"Universiti Sultan Zainal Abidin (UniSZA), Kampus Gong Badak, 21300 Kuala Nerus, Terengganu",
	contact_phone: "09-668 8603",
	contact_hours: "8am - 5pm",
	contact_office:
		"Center for Research Excellence and Incubation Management (CREIM)",
	newsletter_title: "Stay close to what’s next",
	newsletter_text: "New technologies, partnerships and events—once a month.",
	newsletter_button: "Join the list",
	footer_tagline: "IDEAS. PARTNERS. IMPACT.",
	footer_text: "A meeting place for research, industry and communities.",
	about_heading: "About InnoHub",
	about_lead:
		"InnoHub is the meeting place between research, industry and communities — where research-led ideas become products, services and partnerships that matter.",
	trl_title: "Technology Readiness Level (TRL)",
	trl_text: "From early research to market-ready solutions.",
	trl_help:
		"TRL describes technology maturity: 1–3 is early research, 4–6 is validation and demonstration, and 7–9 progresses towards operational use.",
};

export const subscribeUrl = "/api/newsletter/subscribe";

export const popular: string[] = [
	"Halal",
	"Enzyme",
	"AI",
	"Agriculture",
	"Medical",
];

export const metrics: Metric[] = [
	{ icon: Rocket, value: "110+", label: "Innovations ready for impact" },
	{
		icon: Users,
		value: "500+",
		label: "Expert researchers across disciplines",
	},
	{ icon: Building2, value: "100+", label: "Industry & community partners" },
	{
		icon: ChartColumn,
		value: "5+",
		label: "Technologies licensed & commercialised",
	},
];

export const pathways: Pathway[] = [
	{
		icon: Briefcase,
		title: "Spin-Off Company",
		description: "Find solutions for your business",
		target: "spin-offs",
		route: "/spin-offs",
	},
	{
		icon: Landmark,
		title: "CoE / Institute",
		description: "Solutions for the public sector",
		target: "services",
		route: "/centres",
	},
	{
		icon: FlaskConical,
		title: "Cluster / SIG / RG",
		description: "Collaborate on R&D",
		target: "collaborate",
		route: "/research-partners",
	},
	{
		icon: Users,
		title: "Community Innovation",
		description: "Innovations for society",
		target: "collaborate",
		route: "/community",
	},
];

export const trlStages: string[] = [
	"Basic Research",
	"Concept Formulation",
	"Proof of Concept",
	"Lab Validation",
	"Prototype Validation",
	"Prototype Demonstration",
	"System Prototype",
	"System Complete",
	"Market Ready",
];

export const services: Service[] = [
	{
		icon: FlaskConical,
		label: "R&D",
		detail:
			"Joint research programmes from idea validation to proof of concept.",
	},
	{
		icon: ClipboardList,
		label: "Testing & Analysis",
		detail:
			"Accredited laboratories for material, food and product characterisation.",
	},
	{
		icon: Wrench,
		label: "Prototyping & Fabrication",
		detail:
			"Fabrication facilities that take a design from drawing to working model.",
	},
	{
		icon: MessageSquare,
		label: "Consultancy & Training",
		detail:
			"Expert guidance, feasibility studies and hands-on training for partners.",
	},
	{
		icon: Share2,
		label: "Shared Facilities & Services",
		detail:
			"Expert guidance, feasibility studies and hands-on training for partners.",
	},
];

export const storyStats: StoryStat[] = [
	{ value: "35+", label: "Technologies licensed" },
	{ value: "25+", label: "Industry partners" },
	{ value: "RM 15M+", label: "Economic impact" },
];

/* Accent palettes carried over from the original reference stylesheet. */
export const pathwayIconColors: string[] = [
	"#ffc928",
	"#5ddd69",
	"#4cd3e7",
	"#cf7aff",
	"#e65295",
];

export const metricIconColors: string[] = [
	"#315fde",
	"#ffc928",
	"#20a9bd",
	"#754ce3",
];

export const navLinks: NavLink[] = [
	{ label: "Home", path: "/", hash: "", active: true },
	{ label: "Innovations", path: "/innovations", hash: "" },
	{ label: "Services & Facilities", path: "/services", hash: "" },
	{ label: "Collaborate", path: "/contact", hash: "" },
	{ label: "About Us", path: "/about", hash: "" },
];

export const footerExplore: SiteLink[] = [
	{ label: "Innovations", path: "/innovations" },
	{ label: "Spin-off companies", path: "/spin-offs" },
	{ label: "CoE / institutes", path: "/centres" },
	{ label: "Cluster / SIG / RG", path: "/research-partners" },
	{ label: "Community innovation", path: "/community" },
	{ label: "Community news", path: "/community/news" },
	{ label: "Services & facilities", path: "/services" },
	{ label: "Success stories", path: "/stories" },
];

export const footerConnect: SiteLink[] = [
	{ label: "Contact us", path: "/contact" },
	{ label: "About us", path: "/about" },
];

const socialIcons = {
	linkedin: Linkedin,
	instagram: Instagram,
	youtube: Youtube,
} as const;

export const socials: Social[] = (
	Object.keys(socialIcons) as (keyof typeof socialIcons)[]
)
	.filter((key) => Boolean(content[key]))
	.map((key) => ({
		key,
		url: content[key] as string,
		icon: socialIcons[key],
		label: key[0].toUpperCase() + key.slice(1),
	}));
