import type { UsageLog } from "./types";

/**
 * Formats a datetime string for display.
 *
 * Args:
 *   value: ISO datetime string or nullable value.
 *
 * Returns:
 *   A human-friendly datetime string or "-".
 */
const pad2 = (value: number) => String(value).padStart(2, "0");

export const formatDateTime = (value?: string | null) => {
	if (!value) {
		return "-";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
		date.getDate(),
	)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
		date.getSeconds(),
	)}`;
};

/**
 * Toggles channel or token status between active and disabled.
 *
 * Args:
 *   value: Current status value.
 *
 * Returns:
 *   Next status value.
 */
export const toggleStatus = (value: string) =>
	value === "active" ? "disabled" : "active";

/**
 * Returns Beijing date string (YYYY-MM-DD).
 *
 * Args:
 *   date: Optional date value.
 *
 * Returns:
 *   Beijing date string.
 */
export const getBeijingDateString = (date: Date = new Date()) => {
	const formatter = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Shanghai",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return formatter.format(date);
};

export type PageItem = number | "ellipsis";

export const buildPageItems = (current: number, total: number): PageItem[] => {
	if (total <= 6) {
		return Array.from({ length: total }, (_, index) => index + 1);
	}
	const items: PageItem[] = [1, 2, 3];
	if (current > 3 && current < total - 1) {
		items.push("ellipsis", current);
	}
	items.push("ellipsis", total - 1, total);
	return items.filter((item, index, array) => {
		if (item === "ellipsis" && array[index - 1] === "ellipsis") {
			return false;
		}
		if (typeof item === "number") {
			return array.indexOf(item) === index;
		}
		return true;
	});
};

export type UsageSummary = {
	total: number;
	success: number;
	failed: number;
	errorRate: number;
	avgLatencyMs: number | null;
	totalTokens: number;
};

export const summarizeUsageLogs = (logs: UsageLog[]): UsageSummary => {
	const total = logs.length;
	const success = logs.filter((log) => log.status === "ok").length;
	const failed = total - success;
	let latencySum = 0;
	let latencyCount = 0;
	let totalTokens = 0;
	for (const log of logs) {
		const latency = log.latency_ms;
		if (latency !== null && latency !== undefined && !Number.isNaN(latency)) {
			latencySum += latency;
			latencyCount += 1;
		}
		if (log.total_tokens !== null && log.total_tokens !== undefined) {
			totalTokens += log.total_tokens;
		} else {
			totalTokens += (log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0);
		}
	}
	return {
		total,
		success,
		failed,
		errorRate: total > 0 ? (failed / total) * 100 : 0,
		avgLatencyMs: latencyCount > 0 ? latencySum / latencyCount : null,
		totalTokens,
	};
};
