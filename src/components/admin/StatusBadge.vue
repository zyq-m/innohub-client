<script setup lang="ts">
import { computed } from 'vue';
import { STATUS_LABELS } from '../../admin/resources';

const props = defineProps<{ status: string }>();

const classes = computed(() => {
	switch (props.status) {
		case 'published':
			return 'bg-[#e4f6ec] text-[#1c7c47]';
		case 'approved':
			return 'bg-[#e2f4f2] text-[#0e7a6d]';
		case 'pending':
			return 'bg-[#fff4dd] text-[#9a6a00]';
		case 'rejected':
			return 'bg-[#fdecec] text-[#b3261e]';
		default:
			return 'bg-[#eef2f8] text-[#4a5870]';
	}
});

const label = computed(() => STATUS_LABELS[props.status] ?? props.status);
</script>

<template>
	<span
		class="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[.68rem] font-bold"
		:class="classes"
		>{{ label }}</span
	>
</template>
