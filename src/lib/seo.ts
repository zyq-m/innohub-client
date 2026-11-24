export const APP_TITLE = 'InnoHub';

export function setPageTitle(title: string): void {
	document.title = title
		? `${title} — ${APP_TITLE}`
		: `${APP_TITLE} — Innovation Marketplace`;
}
