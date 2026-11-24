import { api } from '../lib/api';

export interface Faculty {
	name: string;
	shortForm: string;
}

let facultiesPromise: Promise<Faculty[]> | null = null;

export function fetchFaculties(): Promise<Faculty[]> {
	if (!facultiesPromise) {
		facultiesPromise = api
			.get<Faculty[]>('/lookup-faculty')
			.then((response) => (Array.isArray(response.data) ? response.data : []))
			.catch((error) => {
				facultiesPromise = null;
				throw error;
			});
	}
	return facultiesPromise;
}

/** Resolve a faculty shortForm to `Full name (CODE)`, falling back to the code. */
export function facultyLabel(code: string | null | undefined, faculties: Faculty[]): string {
	const value = (code ?? '').trim();
	if (!value) return '';
	const match = faculties.find(
		(faculty) => faculty.shortForm.toLowerCase() === value.toLowerCase(),
	);
	return match ? `${match.name} (${match.shortForm})` : value;
}
