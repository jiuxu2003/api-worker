/**
 * Returns the current ISO timestamp.
 */
export function nowIso(): string {
	return new Date().toISOString();
}

/**
 * Adds hours to a date and returns a new Date.
 */
export function addHours(date: Date, hours: number): Date {
	const copy = new Date(date.getTime());
	copy.setHours(copy.getHours() + hours);
	return copy;
}

/**
 * Returns Beijing date string (YYYY-MM-DD).
 */
export function beijingDateString(date: Date = new Date()): string {
	const offsetMs = 8 * 60 * 60 * 1000;
	const beijing = new Date(date.getTime() + offsetMs);
	const year = beijing.getUTCFullYear();
	const month = String(beijing.getUTCMonth() + 1).padStart(2, "0");
	const day = String(beijing.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
