<script setup lang="ts">
import { ref } from 'vue';
import { content, subscribeUrl } from '../data/site';
import { Mail } from 'lucide-vue-next';

const email = ref('');
const notice = ref('');
const noticeError = ref(false);
const submitting = ref(false);

async function subscribe() {
	submitting.value = true;
	notice.value = '';
	noticeError.value = false;
	try {
		const response = await fetch(subscribeUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ email: email.value }),
		});
		const payload = await response.json();
		notice.value = payload?.message;
		noticeError.value = !response.ok;
		if (response.ok) email.value = '';
	} catch {
		notice.value = 'We could not add you just now. Please try again.';
		noticeError.value = true;
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<section
		id="newsletter"
		class="bg-[linear-gradient(90deg,#124b91,#1b5bc5_58%,#0ca88e)] py-[19px] text-white"
	>
		<div
			class="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-center sm:gap-[35px]"
		>
			<div class="flex items-center gap-4">
				<span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
					<Mail class="h-5 w-5" />
				</span>
				<span>
					<b class="block text-[1rem]">{{ content.newsletter_title }}</b>
					<small class="mt-0.5 block text-[.72rem] text-white/75 sm:text-[.73rem]">{{
						content.newsletter_text
					}}</small>
				</span>
			</div>
			<form
				class="flex w-full flex-row rounded-[9px] bg-white p-1 sm:w-[470px]"
				@submit.prevent="subscribe"
			>
				<label class="sr-only" for="email">Email address</label>
				<input
					id="email"
					v-model.trim="email"
					type="email"
					placeholder="Enter your email address"
					required
					class="min-w-0 flex-1 bg-transparent px-3 text-[.75rem] text-ink outline-none sm:text-[.85rem]"
				/>
				<button
					type="submit"
					:disabled="submitting"
					class="shrink-0 whitespace-nowrap rounded-[7px] bg-gold px-3.5 py-2.5 text-[.76rem] font-extrabold text-navy transition hover:bg-[#ffe175] disabled:cursor-not-allowed disabled:opacity-60"
				>
					<span v-if="submitting">Joining…</span>
					<span v-else>{{ content.newsletter_button }}</span>
				</button>
			</form>
		</div>
		<p
			v-if="notice"
			role="status"
			class="mx-auto mb-0 mt-2 max-w-[1180px] px-5 text-center text-[.78rem]"
			:class="noticeError ? 'text-[#ffe0e0]' : 'text-white'"
		>
			{{ notice }}
		</p>
	</section>
</template>
