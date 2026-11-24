<script setup lang="ts">
import { content, footerConnect, footerExplore, socials, type SiteLink } from '../data/site';
import logo from '../assets/logo.png';

const year = new Date().getFullYear();
</script>

<template>
	<footer id="about" class="bg-[#04152f] py-11 text-white">
		<div
			class="mx-auto grid max-w-[1180px] grid-cols-2 gap-6 px-5 sm:grid-cols-4 sm:gap-[25px] lg:grid-cols-[1.5fr_1fr_1fr_1.25fr] lg:gap-[50px]"
		>
			<div>
				<RouterLink class="mb-4 flex items-center gap-3 text-white" to="/">
					<img :src="logo" alt="" class="h-[45px] w-[35px] shrink-0 object-contain" />
					<span>
						<strong
							class="block text-[1.35rem] font-extrabold leading-none tracking-[-.035em] md:text-[1.65rem]"
							>{{ content.brand }}</strong
						>
						<small
							class="mt-[5px] block text-[.6rem] tracking-[.14em] text-gold md:text-[.67rem] md:tracking-[.04em]"
							>{{ content.footer_tagline }}</small
						>
					</span>
				</RouterLink>
				<p class="max-w-[250px] text-[.78rem] text-[#8190a9]">{{ content.footer_text }}</p>
			</div>
			<div class="flex flex-col gap-2">
				<b class="mb-1 text-[.8rem] text-[#dce7f9]">Explore</b>
				<RouterLink
					v-for="link in footerExplore as SiteLink[]"
					:key="link.label"
					class="text-[.78rem] text-[#8190a9] transition hover:text-white"
					:to="{ path: link.path, hash: link.hash || '' }"
					>{{ link.label }}</RouterLink
				>
			</div>
			<div class="flex flex-col gap-2">
				<b class="mb-1 text-[.8rem] text-[#dce7f9]">Connect</b>
				<RouterLink
					v-for="link in footerConnect as SiteLink[]"
					:key="link.label"
					class="text-[.78rem] text-[#8190a9] transition hover:text-white"
					:to="{ path: link.path, hash: link.hash || '' }"
					>{{ link.label }}</RouterLink
				>
			</div>
			<div>
				<b class="mb-3 block text-[.8rem] text-[#dce7f9]">Follow {{ content.brand }}</b>
				<div class="mb-4 flex gap-2">
					<a
						v-for="s in socials"
						:key="s.key"
						:href="s.url"
						:aria-label="s.label"
						rel="noopener noreferrer"
						class="grid h-8 w-8 place-items-center rounded-full bg-[#123761] text-white transition hover:bg-brandblue"
					>
						<component :is="s.icon" class="h-4 w-4" />
					</a>
				</div>
				<small class="text-[.7rem] text-[#6d7c94]"
					>© {{ year }} {{ content.brand }}. All rights reserved.</small
				>
			</div>
		</div>
	</footer>
</template>
