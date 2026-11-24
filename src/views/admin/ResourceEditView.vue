<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AlertCircle, ArrowLeft, ExternalLink, ImageOff, Save, Trash2, Upload } from 'lucide-vue-next';
import StatusBadge from '../../components/admin/StatusBadge.vue';
import {
	formatDate,
	getResource,
	publicUrl,
	recordTitle,
	STATUSES,
	STATUS_LABELS,
	type AdminRecord,
	type ResourceDef,
} from '../../admin/resources';
import { useResource } from '../../admin/useResource';
import { contentAssetUrl } from '../../lib/contentApi';
import { setPageTitle } from '../../lib/seo';
import { fetchFaculties, type Faculty } from '../../services/faculties';

const props = defineProps<{ resource: string; id?: string }>();
const router = useRouter();
const def = getResource(props.resource) as ResourceDef;

const { record, loading, saving, error, get, create, update, remove, uploadPhoto, removePhoto } =
	useResource(def);

const values = ref<Record<string, string>>({});
const flags = ref<Record<string, boolean>>({});
const faculties = ref<Faculty[]>([]);
const status = ref('draft');
const uploading = ref(false);
const confirmDelete = ref(false);
const saved = ref(false);

const isNew = computed(() => !props.id);
const titleMissing = computed(() => String(values.value[def.titleField] ?? '').trim() === '');
const photos = computed(() => record.value?.photos ?? []);
const published = computed(() => Boolean(record.value?.isPublished));
const liveUrl = computed(() => publicUrl(def, record.value));

function initForm(): void {
	const nextValues: Record<string, string> = {};
	const nextFlags: Record<string, boolean> = {};
	for (const field of def.fields) {
		if (field.type === 'checkbox') nextFlags[field.name] = false;
		else nextValues[field.name] = '';
	}
	values.value = nextValues;
	flags.value = nextFlags;
}

function fillForm(source: AdminRecord): void {
	const nextValues: Record<string, string> = {};
	const nextFlags: Record<string, boolean> = {};
	for (const field of def.fields) {
		const raw = source[field.name];
		if (field.type === 'checkbox') nextFlags[field.name] = Boolean(raw);
		else nextValues[field.name] = raw === null || raw === undefined ? '' : String(raw);
	}
	values.value = nextValues;
	flags.value = nextFlags;
	status.value = source.status || 'draft';
}

function buildPayload(): Record<string, unknown> {
	const payload: Record<string, unknown> = {};
	for (const field of def.fields) {
		if (field.type === 'checkbox') {
			payload[field.name] = flags.value[field.name] ?? false;
		} else if (field.type === 'number') {
			const raw = String(values.value[field.name] ?? '').trim();
			const parsed = Number(raw);
			payload[field.name] = raw === '' || Number.isNaN(parsed) ? null : parsed;
		} else {
			payload[field.name] = String(values.value[field.name] ?? '').trim();
		}
	}
	payload.status = status.value;
	return payload;
}

async function save(): Promise<void> {
	saved.value = false;
	if (titleMissing.value) return;

	if (isNew.value) {
		const created = await create(buildPayload());
		if (created) {
			saved.value = true;
			await router.replace({ name: 'admin-edit', params: { resource: def.key, id: created.id } });
		}
		return;
	}

	const updated = await update(props.id as string, buildPayload());
	if (updated) saved.value = true;
}

async function onFiles(event: Event): Promise<void> {
	const input = event.target as HTMLInputElement;
	const files = Array.from(input.files ?? []);
	input.value = '';
	if (!files.length || !record.value) return;

	uploading.value = true;
	for (const file of files) {
		await uploadPhoto(record.value.id, file);
	}
	uploading.value = false;
}

async function removePhotoAt(index: number): Promise<void> {
	if (record.value) await removePhoto(record.value.id, index);
}

async function deleteRecord(): Promise<void> {
	if (!record.value) return;
	const ok = await remove(record.value.id);
	if (ok) await router.replace({ name: 'admin-list', params: { resource: def.key } });
}

onMounted(async () => {
	initForm();
	if (def.fields.some((field) => field.type === 'faculty')) {
		void fetchFaculties()
			.then((result) => {
				faculties.value = result;
			})
			.catch(() => {
				faculties.value = [];
			});
	}
	if (props.id) {
		const loaded = await get(props.id);
		if (loaded) {
			fillForm(loaded);
			setPageTitle(`${recordTitle(loaded, def)} · Admin`);
		}
	} else {
		setPageTitle(`New ${def.singular} · Admin`);
	}
});
</script>

<template>
	<div class="px-5 py-6 lg:px-8 lg:py-8">
		<header class="mb-5 flex flex-wrap items-center justify-between gap-3">
			<div>
				<RouterLink
					:to="{ name: 'admin-list', params: { resource: def.key } }"
					class="mb-1 inline-flex items-center gap-1.5 text-[.76rem] font-bold text-brandblue hover:text-navy"
				>
					<ArrowLeft class="h-3.5 w-3.5" />
					{{ def.label }}
				</RouterLink>
				<h1 class="m-0 text-[1.4rem] font-extrabold tracking-[-.02em] text-navy">
					{{ isNew ? `New ${def.singular}` : recordTitle(record, def) }}
				</h1>
			</div>
			<div class="flex items-center gap-2">
				<a
					v-if="published && liveUrl"
					:href="liveUrl"
					target="_blank"
					rel="noopener"
					class="outline-btn"
				>
					View on site
					<ExternalLink class="h-3.5 w-3.5" />
				</a>
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-[8px] bg-navy px-4 py-2.5 text-[.8rem] font-extrabold text-white transition hover:bg-brandblue disabled:opacity-60"
					:disabled="saving || titleMissing"
					@click="save"
				>
					<Save class="h-4 w-4" />
					{{ saving ? 'Saving…' : 'Save' }}
				</button>
			</div>
		</header>

		<p
			v-if="error"
			class="mb-4 flex items-center gap-2 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[.8rem] text-[#b3261e]"
		>
			<AlertCircle class="h-4 w-4" />
			{{ error }}
		</p>
		<p
			v-else-if="saved"
			class="mb-4 rounded-[8px] bg-[#e4f6ec] px-3 py-2 text-[.8rem] font-semibold text-[#1c7c47]"
		>
			Saved successfully.
		</p>

		<div v-if="loading" class="space-y-3">
			<div v-for="n in 5" :key="n" class="h-14 animate-pulse rounded-[8px] bg-white shadow-card"></div>
		</div>

		<div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
			<div class="space-y-5">
				<section class="rounded-[10px] border border-line bg-white p-5 shadow-card">
					<h2 class="mb-4 mt-0 text-[.95rem] font-bold text-navy">Profile fields</h2>
					<div class="space-y-4">
						<div v-for="field in def.fields" :key="field.name">
							<label v-if="field.type === 'checkbox'" class="flex items-center gap-2.5">
								<input
									v-model="flags[field.name]"
									type="checkbox"
									class="h-4 w-4 rounded border-line accent-brandblue"
								/>
								<span class="text-[.82rem] font-bold text-[#3c4a60]">{{ field.label }}</span>
							</label>

							<template v-else>
								<span class="mb-1 block text-[.75rem] font-bold text-[#3c4a60]">
									{{ field.label }}
									<span v-if="field.required" class="text-[#b3261e]">*</span>
								</span>

								<textarea
									v-if="field.type === 'textarea'"
									v-model="values[field.name]"
									:rows="field.rows ?? 3"
									class="w-full rounded-[8px] border border-line px-3 py-2 text-[.84rem] outline-none transition focus:border-brandblue"
								></textarea>

								<select
									v-else-if="field.type === 'faculty'"
									v-model="values[field.name]"
									class="w-full rounded-[8px] border border-line px-3 py-2 text-[.84rem] outline-none transition focus:border-brandblue"
								>
									<option value="">— Select faculty —</option>
									<option
										v-if="
											values[field.name] &&
											!faculties.some((faculty) => faculty.shortForm === values[field.name])
										"
										:value="values[field.name]"
									>
										{{ values[field.name] }}
									</option>
									<option
										v-for="faculty in faculties"
										:key="faculty.shortForm"
										:value="faculty.shortForm"
									>
										{{ faculty.name }} ({{ faculty.shortForm }})
									</option>
								</select>

								<select
									v-else-if="field.type === 'select'"
									v-model="values[field.name]"
									class="w-full rounded-[8px] border border-line px-3 py-2 text-[.84rem] outline-none transition focus:border-brandblue"
								>
									<option value="">— Select —</option>
									<option v-for="option in field.options" :key="option" :value="option">
										{{ option }}
									</option>
								</select>

								<input
									v-else
									v-model="values[field.name]"
									:type="field.type"
									class="w-full rounded-[8px] border border-line px-3 py-2 text-[.84rem] outline-none transition focus:border-brandblue"
								/>

								<span v-if="field.help" class="mt-1 block text-[.72rem] text-muted">
									{{ field.help }}
								</span>
							</template>
						</div>
					</div>
				</section>

				<section class="rounded-[10px] border border-line bg-white p-5 shadow-card">
					<div class="mb-4 flex items-center justify-between gap-3">
						<h2 class="m-0 text-[.95rem] font-bold text-navy">Photos</h2>
						<label
							class="inline-flex cursor-pointer items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[.76rem] font-bold text-[#3c4a60] transition hover:border-brandblue hover:text-brandblue"
							:class="(!record || uploading) && 'cursor-not-allowed opacity-60'"
						>
							<Upload class="h-3.5 w-3.5" />
							{{ uploading ? 'Uploading…' : 'Upload photos' }}
							<input
								type="file"
								multiple
								accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
								class="hidden"
								:disabled="!record || uploading"
								@change="onFiles"
							/>
						</label>
					</div>

					<p v-if="!record" class="m-0 text-[.78rem] text-muted">
						Save the record first to enable photo uploads.
					</p>
					<div v-else-if="!photos.length" class="flex items-center gap-2 text-[.78rem] text-muted">
						<ImageOff class="h-4 w-4" />
						No photos yet.
					</div>
					<div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						<div v-for="(photo, index) in photos" :key="photo" class="group relative">
							<img
								:src="contentAssetUrl(photo)"
								alt=""
								class="h-28 w-full rounded-[8px] border border-line object-cover"
							/>
							<button
								type="button"
								class="absolute right-1.5 top-1.5 rounded-[6px] bg-white/95 p-1 text-[#b3261e] opacity-0 shadow-card transition group-hover:opacity-100"
								title="Remove photo"
								@click="removePhotoAt(index)"
							>
								<Trash2 class="h-3.5 w-3.5" />
							</button>
							<span class="mt-1 block truncate text-[.68rem] text-muted">{{ photo.split('/').pop() }}</span>
						</div>
					</div>
				</section>
			</div>

			<aside class="space-y-5">
				<section class="rounded-[10px] border border-line bg-white p-5 shadow-card">
					<h2 class="mb-4 mt-0 text-[.95rem] font-bold text-navy">Publishing</h2>

					<label class="mb-3 block">
						<span class="mb-1 block text-[.75rem] font-bold text-[#3c4a60]">Status</span>
						<select
							v-model="status"
							class="w-full rounded-[8px] border border-line px-3 py-2 text-[.84rem] outline-none transition focus:border-brandblue"
						>
							<option v-for="value in STATUSES" :key="value" :value="value">
								{{ STATUS_LABELS[value] }}
							</option>
						</select>
					</label>

					<div class="space-y-2 text-[.78rem] text-[#3c4a60]">
						<div class="flex items-center justify-between gap-2">
							<span class="text-muted">Current state</span>
							<StatusBadge :status="status" />
						</div>
						<div class="flex items-center justify-between gap-2">
							<span class="text-muted">Slug</span>
							<span class="truncate font-semibold">{{ record?.slug ?? '—' }}</span>
						</div>
						<div class="flex items-center justify-between gap-2">
							<span class="text-muted">Published at</span>
							<span class="font-semibold">{{ formatDate(record?.publishedAt) }}</span>
						</div>
					</div>

					<p class="mb-0 mt-3 text-[.72rem] text-muted">
						Setting the status to <b>Published</b> makes this record visible on the public site.
					</p>
				</section>

				<section v-if="!isNew" class="rounded-[10px] border border-line bg-white p-5 shadow-card">
					<h2 class="mb-3 mt-0 text-[.95rem] font-bold text-navy">Danger zone</h2>
					<template v-if="confirmDelete">
						<p class="mb-3 mt-0 text-[.78rem] text-[#3c4a60]">
							Delete this record and its photos? This cannot be undone.
						</p>
						<div class="flex gap-2">
							<button
								type="button"
								class="rounded-[8px] bg-[#b3261e] px-3 py-2 text-[.76rem] font-bold text-white"
								@click="deleteRecord"
							>
								Delete
							</button>
							<button
								type="button"
								class="rounded-[8px] border border-line px-3 py-2 text-[.76rem] font-bold text-[#3c4a60]"
								@click="confirmDelete = false"
							>
								Cancel
							</button>
						</div>
					</template>
					<button
						v-else
						type="button"
						class="inline-flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[.76rem] font-bold text-[#b3261e] transition hover:border-[#b3261e]"
						@click="confirmDelete = true"
					>
						<Trash2 class="h-3.5 w-3.5" />
						Delete record
					</button>
				</section>
			</aside>
		</div>
	</div>
</template>
