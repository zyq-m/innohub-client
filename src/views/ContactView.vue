<script setup lang="ts">
import { computed, ref } from 'vue';
import { content, pathways } from '../data/site';
import { Building2, Mail, MessageSquare } from 'lucide-vue-next';

const submitted = ref(false);
const submitting = ref(false);
const form = ref({ name: '', email: '', message: '' });

const mailto = computed(
	() =>
		`mailto:${content.contact_email}?subject=${encodeURIComponent(
			'InnoHub enquiry from ' + (form.value.name || 'website visitor'),
		)}&body=${encodeURIComponent(form.value.message)}`,
);

function send() {
	if (!form.value.name || !form.value.email || !form.value.message) return;
	submitting.value = true;
	window.location.href = mailto.value;
	setTimeout(() => {
		submitting.value = false;
		submitted.value = true;
	}, 400);
}
</script>

<template>
	<section class="bg-[linear-gradient(110deg,#061a39,#0a2854)] py-9 text-white md:py-12">
		<div class="mx-auto max-w-[1180px] px-5">
			<h1 class="mb-1.5 mt-0 text-[1.6rem] font-extrabold tracking-[-.03em] lg:text-[2rem]">
				Contact InnoHub
			</h1>
			<p class="m-0 max-w-[620px] text-[.85rem] text-white/75">
				Tell us what you need and we will connect you with the right research team.
			</p>
		</div>
	</section>

	<main class="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-5 py-8 md:grid-cols-[1fr_1.15fr]">
		<section class="rounded-[12px] bg-white p-6 shadow-card" aria-label="Contact details">
			<h2 class="mb-4 mt-0 text-[1.05rem] font-bold">Reach us</h2>
			<ul class="m-0 flex list-none flex-col gap-4 p-0 text-[.85rem]">
				<li class="flex gap-3">
					<Building2 class="h-5 w-5 text-brandblue" />
					<span>
						<b class="block text-navy">{{ content.contact_office }}</b>
						<span class="text-muted">{{ content.contact_address }}</span>
					</span>
				</li>
				<li class="flex gap-3">
					<MessageSquare class="h-5 w-5 text-brandblue" />
					<span>
						<b class="block text-navy">{{ content.contact_phone }}</b>
						<span class="text-muted">{{ content.contact_hours }}</span>
					</span>
				</li>
				<li class="flex gap-3">
					<Mail class="h-5 w-5 text-brandblue" />
					<a :href="'mailto:' + content.contact_email" class="text-brandblue hover:underline">{{
						content.contact_email
					}}</a>
				</li>
			</ul>

			<h3 class="mb-2 mt-6 text-[.95rem] font-bold">Who should you talk to?</h3>
			<ul class="m-0 list-none p-0 text-[.83rem]">
				<li v-for="path in pathways" :key="path.title" class="flex items-center gap-2 border-t border-line py-2">
					<b class="text-navy">{{ path.title }}</b>
					<span class="text-muted">— {{ path.description }}</span>
				</li>
			</ul>
		</section>

		<section class="rounded-[12px] bg-white p-6 shadow-card" aria-label="Enquiry form">
			<h2 class="mb-4 mt-0 text-[1.05rem] font-bold">Send an enquiry</h2>
			<p
				v-if="submitted"
				role="status"
				class="rounded-[8px] bg-[#eef7f2] px-4 py-3 text-[.83rem] text-[#0b6b46]"
			>
				Your email client should now be open with your message. If nothing happened, write to
				<a :href="'mailto:' + content.contact_email" class="underline">{{ content.contact_email }}</a>.
			</p>
			<form v-else class="flex flex-col gap-3" @submit.prevent="send">
				<label class="contact-field">
					<span>Name</span>
					<input v-model.trim="form.name" type="text" required autocomplete="name" />
				</label>
				<label class="contact-field">
					<span>Email</span>
					<input v-model.trim="form.email" type="email" required autocomplete="email" />
				</label>
				<label class="contact-field">
					<span>How can we help?</span>
					<textarea v-model.trim="form.message" rows="5" required></textarea>
				</label>
				<button
					type="submit"
					:disabled="submitting"
					class="mt-1 self-start rounded-[6px] bg-navy px-5 py-2.5 text-[.8rem] font-bold text-white transition hover:bg-brandblue disabled:opacity-60"
				>
					{{ submitting ? 'Opening email…' : content.contact_label }}
				</button>
			</form>
		</section>
	</main>
</template>

<style scoped>
.contact-field {
	display: flex;
	flex-direction: column;
	gap: 5px;
}
.contact-field span {
	font-size: 0.7rem;
	font-weight: 700;
	color: #63708a;
}
.contact-field input,
.contact-field textarea {
	border: 1px solid #dce4ef;
	border-radius: 6px;
	padding: 10px;
	font-size: 0.85rem;
	font-family: inherit;
}
.contact-field input {
	height: 40px;
}
.contact-field input:focus,
.contact-field textarea:focus {
	outline: 2px solid #315fde33;
	border-color: #315fde;
}
</style>
