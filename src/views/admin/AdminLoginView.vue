<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { login } from '../../lib/adminAuth';
import { setPageTitle } from '../../lib/seo';

const route = useRoute();
const router = useRouter();

const email = ref('admin@innohub.local');
const password = ref('');
const error = ref('');
const loading = ref(false);

setPageTitle('Admin sign in');

async function submit(): Promise<void> {
	error.value = '';
	loading.value = true;
	try {
		await login(email.value.trim(), password.value);
		const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin';
		await router.replace(redirect);
	} catch (err) {
		const status = (err as { response?: { status?: number } }).response?.status;
		error.value = status === 401 ? 'Invalid email or password.' : 'Unable to sign in. Is the content API running?';
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<main class="grid min-h-screen place-items-center bg-[linear-gradient(110deg,#04122a,#0a2854)] px-5 py-10">
		<form
			class="w-full max-w-[380px] rounded-[14px] bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,.35)]"
			@submit.prevent="submit"
		>
			<h1 class="mb-1 mt-0 text-[1.4rem] font-extrabold tracking-[-.02em] text-navy">InnoHub Admin</h1>
			<p class="mb-6 mt-0 text-[.82rem] text-muted">Sign in to manage website content.</p>

			<label class="mb-3 block">
				<span class="mb-1 block text-[.75rem] font-bold text-[#3c4a60]">Email</span>
				<input
					v-model="email"
					type="email"
					required
					autocomplete="username"
					class="w-full rounded-[8px] border border-line px-3 py-2.5 text-[.85rem] outline-none transition focus:border-brandblue"
				/>
			</label>

			<label class="mb-4 block">
				<span class="mb-1 block text-[.75rem] font-bold text-[#3c4a60]">Password</span>
				<input
					v-model="password"
					type="password"
					required
					autocomplete="current-password"
					class="w-full rounded-[8px] border border-line px-3 py-2.5 text-[.85rem] outline-none transition focus:border-brandblue"
				/>
			</label>

			<p v-if="error" class="mb-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[.78rem] text-[#b3261e]">
				{{ error }}
			</p>

			<button
				type="submit"
				:disabled="loading"
				class="w-full rounded-[8px] bg-navy px-4 py-2.5 text-[.85rem] font-extrabold text-white transition hover:bg-brandblue disabled:opacity-60"
			>
				{{ loading ? 'Signing in…' : 'Sign in' }}
			</button>

			<RouterLink to="/" class="mt-5 block text-center text-[.78rem] font-bold text-brandblue hover:text-navy">
				Back to site
			</RouterLink>
		</form>
	</main>
</template>
