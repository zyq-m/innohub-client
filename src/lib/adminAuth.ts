import { reactive } from 'vue';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { contentApi } from './contentApi';

const TOKEN_KEY = 'innohub-admin-token';
const USER_KEY = 'innohub-admin-user';

export interface AdminUser {
	id: number;
	email: string;
	role: string;
}

interface AuthResponse {
	token: string;
	user: AdminUser;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

function readUser(): AdminUser | null {
	try {
		const raw = localStorage.getItem(USER_KEY);
		return raw ? (JSON.parse(raw) as AdminUser) : null;
	} catch {
		return null;
	}
}

export const adminState = reactive<{ token: string; user: AdminUser | null }>({
	token: localStorage.getItem(TOKEN_KEY) ?? '',
	user: readUser(),
});

export function isAuthed(): boolean {
	return Boolean(adminState.token);
}

function persist(token: string, user: AdminUser | null): void {
	adminState.token = token;
	adminState.user = user;
	if (token) localStorage.setItem(TOKEN_KEY, token);
	else localStorage.removeItem(TOKEN_KEY);
	if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
	else localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password: string): Promise<void> {
	const { data } = await contentApi.post<AuthResponse>('/auth/login', {
		email,
		password,
	});
	persist(data.token, data.user);
}

export function logout(): void {
	// Revoke the refresh token server-side (it lives in an HttpOnly cookie).
	void contentApi.post('/auth/logout').catch(() => undefined);
	persist('', null);
}

let refreshPromise: Promise<string | null> | null = null;

async function requestNewAccessToken(): Promise<string | null> {
	try {
		const { data } = await contentApi.post<AuthResponse>('/auth/refresh');
		persist(data.token, data.user ?? adminState.user);
		return data.token;
	} catch {
		return null;
	}
}

/** Mint a new access token using the HttpOnly refresh cookie. Concurrent callers share one request. */
export function refreshAccessToken(): Promise<string | null> {
	if (!refreshPromise) {
		refreshPromise = requestNewAccessToken().finally(() => {
			refreshPromise = null;
		});
	}
	return refreshPromise;
}

// Attach the bearer token to every content request when signed in.
contentApi.interceptors.request.use((config) => {
	if (adminState.token) {
		config.headers.Authorization = `Bearer ${adminState.token}`;
	}
	return config;
});

// On a 401, try to refresh once and replay the request; give up (sign out) if that fails.
contentApi.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const status = error.response?.status;
		const config = error.config as RetryableRequestConfig | undefined;
		const url = config?.url ?? '';
		const isAuthCall =
			url.startsWith('/auth/login') ||
			url.startsWith('/auth/refresh') ||
			url.startsWith('/auth/logout');

		if (status === 401 && config && !config._retry && !isAuthCall) {
			config._retry = true;
			const token = await refreshAccessToken();
			if (token) {
				config.headers.set('Authorization', `Bearer ${token}`);
				return contentApi.request(config);
			}
			logout();
		} else if (status === 401 && !isAuthCall) {
			logout();
		}

		return Promise.reject(error);
	},
);
