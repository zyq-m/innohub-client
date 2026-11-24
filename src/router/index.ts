import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";
import { getResource } from "../admin/resources";
import { isAuthed } from "../lib/adminAuth";
import { setPageTitle } from "../lib/seo";

declare module "vue-router" {
	interface RouteMeta {
		title?: string;
		requiresAuth?: boolean;
	}
}

function validResource(to: { params: Record<string, unknown> }) {
	return getResource(String(to.params.resource ?? ""))
		? true
		: { name: "admin" };
}

const routes: RouteRecordRaw[] = [
	{
		path: "/",
		name: "home",
		component: () => import("../views/HomeView.vue"),
		meta: { title: "Innovation Marketplace" },
	},
	{
		path: "/innovations",
		name: "innovations",
		component: () => import("../views/InnovationsView.vue"),
		meta: { title: "Innovations" },
	},
	{
		path: "/innovations/:id",
		name: "innovation-detail",
		component: () => import("../views/InnovationDetailView.vue"),
		props: true,
		meta: { title: "Innovation" },
	},
	{
		path: "/stories",
		name: "stories",
		component: () => import("../views/StoriesView.vue"),
		meta: { title: "Success Stories" },
	},
	{
		path: "/stories/:slug",
		name: "story",
		component: () => import("../views/StoryDetailView.vue"),
	},
	{
		path: "/spin-offs",
		name: "spin-offs",
		component: () => import("../views/SpinOffsView.vue"),
		meta: { title: "Spin-off Companies" },
	},
	{
		path: "/spin-offs/:slug",
		name: "spin-off",
		component: () => import("../views/SpinOffDetailView.vue"),
	},
	{
		path: "/centres",
		name: "centres",
		component: () => import("../views/CentresView.vue"),
		meta: { title: "CoE / Institutes" },
	},
	{
		path: "/centres/:slug",
		name: "centre",
		component: () => import("../views/CentreDetailView.vue"),
	},
	{
		path: "/research-partners",
		name: "research-partners",
		component: () => import("../views/ResearchPartnersView.vue"),
		meta: { title: "Cluster / SIG / RG" },
	},
	{
		path: "/research-partners/clusters/:slug",
		name: "research-cluster",
		component: () => import("../views/ResearchClusterView.vue"),
		meta: { title: "Research cluster" },
	},
	{
		path: "/research-partners/:slug",
		name: "research-partner",
		component: () => import("../views/ResearchGroupDetailView.vue"),
	},
	{
		path: "/community",
		name: "community",
		component: () => import("../views/CommunityProductsView.vue"),
		meta: { title: "Community Innovation" },
	},
	{
		path: "/community/news",
		name: "community-news",
		component: () => import("../views/CommunityNewsView.vue"),
		meta: { title: "Community News" },
	},
	{
		path: "/community/news/:slug",
		name: "community-news-item",
		component: () => import("../views/CommunityNewsDetailView.vue"),
	},
	{
		path: "/community/:slug",
		name: "community-product",
		component: () => import("../views/CommunityProductDetailView.vue"),
	},
	{
		path: "/services",
		name: "services",
		component: () => import("../views/ServicesView.vue"),
		meta: { title: "Services & Facilities" },
	},
	{
		path: "/services/:slug",
		name: "service-facility",
		component: () => import("../views/ServiceFacilityDetailView.vue"),
	},
	{
		path: "/about",
		name: "about",
		component: () => import("../views/AboutView.vue"),
		meta: { title: "About" },
	},
	{
		path: "/contact",
		name: "contact",
		component: () => import("../views/ContactView.vue"),
		meta: { title: "Contact" },
	},
	{
		path: "/admin/login",
		name: "admin-login",
		component: () => import("../views/admin/AdminLoginView.vue"),
		meta: { title: "Admin sign in" },
	},
	{
		path: "/admin",
		component: () => import("../views/admin/AdminLayout.vue"),
		meta: { requiresAuth: true },
		children: [
			{
				path: "",
				name: "admin",
				component: () => import("../views/admin/AdminDashboardView.vue"),
				meta: { title: "Admin" },
			},
			{
				path: "hero",
				name: "admin-hero",
				component: () => import("../views/admin/AdminHeroView.vue"),
				meta: { title: "Homepage hero" },
			},
			{
				path: ":resource",
				name: "admin-list",
				component: () => import("../views/admin/ResourceListView.vue"),
				props: true,
				meta: { title: "Admin" },
				beforeEnter: validResource,
			},
			{
				path: ":resource/new",
				name: "admin-new",
				component: () => import("../views/admin/ResourceEditView.vue"),
				props: true,
				meta: { title: "Admin" },
				beforeEnter: validResource,
			},
			{
				path: ":resource/:id",
				name: "admin-edit",
				component: () => import("../views/admin/ResourceEditView.vue"),
				props: true,
				meta: { title: "Admin" },
				beforeEnter: validResource,
			},
		],
	},
	{
		path: "/:pathMatch(.*)*",
		name: "not-found",
		component: () => import("../views/NotFoundView.vue"),
		meta: { title: "Page not found" },
	},
];

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) return savedPosition;
		if (to.hash) {
			return new Promise((resolve) => {
				setTimeout(() => resolve({ el: to.hash, top: 16 }), 60);
			});
		}
		if (to.path === from.path) return;
		return { top: 0 };
	},
});

router.beforeEach((to) => {
	if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthed()) {
		return { name: "admin-login", query: { redirect: to.fullPath } };
	}
	return true;
});

router.afterEach((to) => {
	setPageTitle(to.meta.title ?? "");
});
