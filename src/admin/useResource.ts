import { ref } from 'vue';
import { contentApi } from '../lib/contentApi';
import type { AdminRecord, ResourceDef } from './resources';

export interface ListMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ListParams {
	search?: string;
	status?: string;
	featured?: boolean;
	type?: string;
	cluster?: string;
	category?: string;
	level?: string;
	page?: number;
	limit?: number;
}

export type RecordPayload = Record<string, unknown>;

interface ApiError {
	response?: { status?: number; data?: { message?: string }; };
	message?: string;
}

/** Turn an axios/unknown error into a message suitable for the admin UI. */
export function apiError(error: unknown, fallback: string): string {
	const err = error as ApiError;
	if (err?.response?.data?.message) return err.response.data.message;
	if (err?.response?.status) return `${fallback} (HTTP ${err.response.status})`;
	if (err?.message) return `${fallback} — ${err.message}`;
	return fallback;
}

/**
 * CRUD wrapper for a single admin resource. All mutations talk to the
 * `/api/admin/*` endpoints via the shared authenticated `contentApi` client.
 */
export function useResource(def: ResourceDef) {
	const rows = ref<AdminRecord[]>([]);
	const meta = ref<ListMeta | null>(null);
	const record = ref<AdminRecord | null>(null);
	const loading = ref(false);
	const saving = ref(false);
	const error = ref('');

	async function list(params: ListParams = {}): Promise<void> {
		loading.value = true;
		error.value = '';

		const query: Record<string, string | number | boolean> = {
			page: params.page ?? 1,
			limit: params.limit ?? 20,
		};
		if (params.search?.trim()) query.search = params.search.trim();
		if (params.status) query.status = params.status;
		if (params.featured !== undefined) query.featured = params.featured;
		if (params.type?.trim()) query.type = params.type.trim();
		if (params.cluster?.trim()) query.cluster = params.cluster.trim();
		if (params.category?.trim()) query.category = params.category.trim();
		if (params.level?.trim()) query.level = params.level.trim();

		try {
			const { data } = await contentApi.get<{ data: AdminRecord[]; meta: ListMeta }>(def.endpoint, {
				params: query,
			});
			rows.value = data.data ?? [];
			meta.value = data.meta ?? null;
		} catch (err) {
			error.value = apiError(err, 'Unable to load records');
			rows.value = [];
			meta.value = null;
		} finally {
			loading.value = false;
		}
	}

	async function get(id: number | string): Promise<AdminRecord | null> {
		loading.value = true;
		error.value = '';

		try {
			const { data } = await contentApi.get<{ data: AdminRecord }>(`${def.endpoint}/${id}`);
			record.value = data.data;
			return data.data;
		} catch (err) {
			error.value = apiError(err, 'Unable to load record');
			return null;
		} finally {
			loading.value = false;
		}
	}

	async function create(payload: RecordPayload): Promise<AdminRecord | null> {
		saving.value = true;
		error.value = '';

		try {
			const { data } = await contentApi.post<{ data: AdminRecord }>(def.endpoint, payload);
			record.value = data.data;
			return data.data;
		} catch (err) {
			error.value = apiError(err, 'Unable to save record');
			return null;
		} finally {
			saving.value = false;
		}
	}

	async function update(id: number | string, payload: RecordPayload): Promise<AdminRecord | null> {
		saving.value = true;
		error.value = '';

		try {
			const { data } = await contentApi.put<{ data: AdminRecord }>(`${def.endpoint}/${id}`, payload);
			record.value = data.data;
			return data.data;
		} catch (err) {
			error.value = apiError(err, 'Unable to save record');
			return null;
		} finally {
			saving.value = false;
		}
	}

	async function remove(id: number | string): Promise<boolean> {
		saving.value = true;
		error.value = '';

		try {
			await contentApi.delete(`${def.endpoint}/${id}`);
			return true;
		} catch (err) {
			error.value = apiError(err, 'Unable to delete record');
			return false;
		} finally {
			saving.value = false;
		}
	}

	async function setStatus(id: number | string, status: string): Promise<AdminRecord | null> {
		error.value = '';

		try {
			const { data } = await contentApi.patch<{ data: AdminRecord }>(`${def.endpoint}/${id}/status`, {
				status,
			});
			return data.data;
		} catch (err) {
			error.value = apiError(err, 'Unable to change status');
			return null;
		}
	}

	async function uploadPhoto(id: number | string, file: File): Promise<AdminRecord | null> {
		error.value = '';

		const form = new FormData();
		form.append('file', file);

		try {
			const { data } = await contentApi.post<{ data: AdminRecord }>(
				`${def.endpoint}/${id}/photos`,
				form,
			);
			record.value = data.data;
			return data.data;
		} catch (err) {
			error.value = apiError(err, `Unable to upload ${file.name}`);
			return null;
		}
	}

	async function removePhoto(id: number | string, index: number): Promise<AdminRecord | null> {
		error.value = '';

		try {
			const { data } = await contentApi.delete<{ data: AdminRecord }>(
				`${def.endpoint}/${id}/photos/${index}`,
			);
			record.value = data.data;
			return data.data;
		} catch (err) {
			error.value = apiError(err, 'Unable to remove photo');
			return null;
		}
	}

	return {
		rows,
		meta,
		record,
		loading,
		saving,
		error,
		list,
		get,
		create,
		update,
		remove,
		setStatus,
		uploadPhoto,
		removePhoto,
	};
}
