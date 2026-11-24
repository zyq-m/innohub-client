import {
	Building2,
	ChartColumn,
	Cpu,
	Flower2,
	GraduationCap,
	Heart,
	TreePine,
} from "lucide-vue-next";
import type { Component } from "vue";
import { assetUrl } from "../lib/api";

export interface ProductFile {
	id: number | null;
	url: string;
	name: string;
	description: string;
}

export interface RawProduct {
	c120did: string;
	c120djenisproduk: string | null;
	c120dprodukdesc: string | null;
	c120dprodukkategori: string | null;
	c120dciriproduk: string | null;
	c120dkeperluan: string | null;
	c120daplikasi: string | null;
	c120dkebaikan: string | null;
	c120dimg: string | null;
	c120dcreatedat: string | null;
	c120dupdatedat: string | null;
	c120dnoip: string | null;
	c120dnoapplyip: string | null;
	c120dspinoff: string | null;
	c120dleveltrl: string | null;
	c120ddoc: string | null;
	c120dvideo: string | null;
	c120ctajukproduk: string | null;
	a017namaper?: string | null;
	a017noper?: string | null;
	a017emel?: string | null;
	a019singkatan?: string | null;
}

export interface Product {
	id: string;
	title: string;
	description: string;
	summary: string;
	categoryId: string;
	categoryLabel: string;
	typeId: string;
	typeLabel: string;
	researcher: string;
	researcherNo: string;
	researcherEmail: string;
	facultyCode: string;
	trl: number | null;
	spinOff: boolean;
	ipNo: string;
	createdAt: string;
	updatedAt: string;
	image: string;
	images: ProductFile[];
	documents: ProductFile[];
	videoUrl: string;
	innovation: string;
	requirement: string;
	application: string;
	benefits: string;
}

export interface Pagination {
	rowsNumber: number;
	rowsPerPage: number;
	page: number;
}

export interface Faculty {
	code: string;
	id: string;
}

/** Category labels come from CreIM's Product category list. */
export const PRODUCT_CATEGORY = [
	{ label: "Healthcare & Life Siences", value: "1" },
	{ label: "Digital Technologies & Intelligent Systems", value: "2" },
	{ label: "Energy, Environment & Sustainabiliy", value: "3" },
	{ label: "Agriculture, Food & Water Security", value: "4" },
	{
		label: "Smart Infrastucture, Cities & Mobility",
		value: "5",
	},
	{ label: "Business, Finance & Entrepreneurship", value: "6" },
	{ label: "Education, Culture & Creative Industries", value: "7" },
];

export const PRODUCT_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
	PRODUCT_CATEGORY.map((item) => [item.value, item.label]),
);

export const PRODUCT_TYPE = [
	{ label: "Product", value: "1" },
	{ label: "Services", value: "2" },
];

export const PRODUCT_TYPE_MAP: Record<string, string> = Object.fromEntries(
	PRODUCT_TYPE.map((item) => [item.value, item.label]),
);

/** Icon per category code, used by the category tiles. */
export const CATEGORY_ICONS: Record<string, Component> = {
	"1": Heart,
	"2": Cpu,
	"3": TreePine,
	"4": Flower2,
	"5": Building2,
	"6": ChartColumn,
	"7": GraduationCap,
};

export const CATEGORY_COLORS = [
	"#188e71",
	"#315a92",
	"#188e71",
	"#315a92",
	"#554087",
	"#188e71",
	"#ad873e",
];

export const SUMMARY_LENGTH = 170;

function clean(value: string | null | undefined): string {
	return (value ?? "").replace(/\s+/g, " ").trim();
}

function multiLine(value: string | null | undefined): string {
	return (value ?? "").replace(/\r\n/g, "\n").trim();
}

function parseFiles(raw: string | null | undefined): ProductFile[] {
	if (!raw) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.flatMap((entry) => {
			const item = entry as { id?: number; file?: string; desc?: string };
			if (!item.file) return [];
			return [
				{
					id: item.id ?? null,
					url: assetUrl(item.file),
					name: item.file.split("/").pop() ?? item.file,
					description: item.desc ?? "",
				},
			];
		});
	} catch {
		return [];
	}
}

export function clamp(text: string, length = SUMMARY_LENGTH): string {
	if (text.length <= length) return text;
	const cut = text.slice(0, length);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 80 ? lastSpace : length).trimEnd()}…`;
}

export function mapProduct(raw: RawProduct): Product {
	const description = multiLine(raw.c120dprodukdesc);
	const categoryId = raw.c120dprodukkategori ?? "";
	const typeId = raw.c120djenisproduk ?? "";
	const images = parseFiles(raw.c120dimg);
	const trl = raw.c120dleveltrl === null ? null : Number(raw.c120dleveltrl);

	return {
		id: String(raw.c120did),
		title: clean(raw.c120ctajukproduk) || "Untitled innovation",
		description,
		summary: clamp(clean(description)),
		categoryId,
		categoryLabel:
			PRODUCT_CATEGORY_MAP[categoryId] ??
			(categoryId ? `Category ${categoryId}` : ""),
		typeId,
		typeLabel: PRODUCT_TYPE_MAP[typeId] ?? "",
		researcher: clean(raw.a017namaper),
		researcherNo: clean(raw.a017noper),
		researcherEmail: clean(raw.a017emel),
		facultyCode: clean(raw.a019singkatan),
		trl: trl === null || Number.isNaN(trl) ? null : trl,
		spinOff: raw.c120dspinoff === "1",
		ipNo: clean(raw.c120dnoip),
		createdAt: raw.c120dcreatedat ?? "",
		updatedAt: raw.c120dupdatedat ?? "",
		image: images[0]?.url ?? "",
		images,
		documents: parseFiles(raw.c120ddoc),
		videoUrl: raw.c120dvideo ? assetUrl(raw.c120dvideo) : "",
		innovation: multiLine(raw.c120dciriproduk),
		requirement: multiLine(raw.c120dkeperluan),
		application: multiLine(raw.c120daplikasi),
		benefits: multiLine(raw.c120dkebaikan),
	};
}

export function mapFaculty(
	rows: { a019kbahagian: string; a019singkatan: string }[] = [],
): Faculty[] {
	return rows
		.filter((row) => row.a019kbahagian && row.a019singkatan)
		.map((row) => ({ id: row.a019kbahagian, code: row.a019singkatan }));
}
