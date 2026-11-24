<script setup lang="ts">
	import {
		Briefcase,
		FlaskConical,
		Globe,
		Images,
		Landmark,
		LayoutDashboard,
		LogOut,
		Newspaper,
		Package,
		Trophy,
		Wrench,
	} from "lucide-vue-next";
	import { computed, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { adminState, isAuthed, logout } from "../../lib/adminAuth";

	const route = useRoute();
	const router = useRouter();

	// If a rejected token clears the session (401), bounce back to the sign-in page.
	watch(isAuthed, (authed) => {
		if (!authed)
			void router.replace({
				name: "admin-login",
				query: { redirect: route.fullPath },
			});
	});

	const links = [
		{
			label: "Dashboard",
			to: { name: "admin" },
			match: "/admin",
			icon: LayoutDashboard,
		},
		{
			label: "Homepage hero",
			to: { name: "admin-hero" },
			match: "/admin/hero",
			icon: Images,
		},
		{
			label: "Spin-off companies",
			to: { name: "admin-list", params: { resource: "spin-offs" } },
			match: "/admin/spin-offs",
			icon: Briefcase,
		},
		{
			label: "CoE / Institutes",
			to: { name: "admin-list", params: { resource: "centres" } },
			match: "/admin/centres",
			icon: Landmark,
		},
		{
			label: "Cluster / SIG / RG",
			to: { name: "admin-list", params: { resource: "research-groups" } },
			match: "/admin/research-groups",
			icon: FlaskConical,
		},
		{
			label: "Community Innovation",
			to: { name: "admin-list", params: { resource: "community-products" } },
			match: "/admin/community-products",
			icon: Package,
		},
		{
			label: "Community News",
			to: { name: "admin-list", params: { resource: "community-news" } },
			match: "/admin/community-news",
			icon: Newspaper,
		},
		{
			label: "Services & Facilities",
			to: { name: "admin-list", params: { resource: "services" } },
			match: "/admin/services",
			icon: Wrench,
		},
		{
			label: "Success Stories",
			to: { name: "admin-list", params: { resource: "success-stories" } },
			match: "/admin/success-stories",
			icon: Trophy,
		},
	];

	const current = computed(() => route.path);

	function isActive(match: string): boolean {
		return match === "/admin"
			? current.value === "/admin"
			: current.value.startsWith(match);
	}

	async function signOut(): Promise<void> {
		logout();
		await router.replace("/admin/login");
	}
</script>

<template>
	<div class="flex min-h-screen flex-col bg-[#f3f6fb] lg:flex-row">
		<aside
			class="flex shrink-0 flex-col gap-1 bg-[linear-gradient(160deg,#04122a,#0a2854)] px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-[230px] lg:self-start lg:overflow-y-auto"
		>
			<div class="mb-5 flex items-center gap-2 px-2">
				<strong class="text-[1.1rem] font-extrabold tracking-[-.02em]"
					>InnoHub Admin</strong
				>
			</div>

			<RouterLink
				v-for="link in links"
				:key="link.label"
				:to="link.to"
				class="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[.83rem] font-semibold transition"
				:class="
					isActive(link.match)
						? 'bg-white/15 text-white'
						: 'text-white/70 hover:bg-white/10 hover:text-white'
				"
			>
				<component :is="link.icon" class="h-4 w-4" />
				{{ link.label }}
			</RouterLink>

			<div class="mt-auto space-y-2 pt-5">
				<RouterLink
					to="/"
					class="flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[.8rem] text-white/70 transition hover:bg-white/10 hover:text-white"
				>
					<Globe class="h-4 w-4" />
					View site
				</RouterLink>
				<button
					type="button"
					class="flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[.8rem] text-white/70 transition hover:bg-white/10 hover:text-white"
					@click="signOut"
				>
					<LogOut class="h-4 w-4" />
					Sign out
				</button>
				<p class="px-3 text-[.7rem] text-white/40">
					{{ adminState.user?.email }}
				</p>
			</div>
		</aside>

		<div class="min-w-0 flex-1">
			<RouterView :key="route.path" />
		</div>
	</div>
</template>
