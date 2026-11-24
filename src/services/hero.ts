import { contentApi } from '../lib/contentApi';

export interface HeroSetting {
	id: number;
	images: string[];
	updatedAt?: string;
}

export async function fetchHeroSetting(): Promise<HeroSetting | null> {
	try {
		const { data } = await contentApi.get<{ data: HeroSetting }>('/public/hero');
		return data.data;
	} catch {
		return null;
	}
}

export async function fetchAdminHero(): Promise<HeroSetting> {
	const { data } = await contentApi.get<{ data: HeroSetting }>('/admin/hero');
	return data.data;
}

export async function uploadHeroImage(file: File): Promise<HeroSetting> {
	const form = new FormData();
	form.append('file', file);
	const { data } = await contentApi.post<{ data: HeroSetting }>('/admin/hero/images', form);
	return data.data;
}

export async function removeHeroImage(index: number): Promise<HeroSetting> {
	const { data } = await contentApi.delete<{ data: HeroSetting }>(`/admin/hero/images/${index}`);
	return data.data;
}

export async function reorderHeroImages(images: string[]): Promise<HeroSetting> {
	const { data } = await contentApi.put<{ data: HeroSetting }>('/admin/hero/images/order', { images });
	return data.data;
}
