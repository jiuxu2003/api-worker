import { describe, expect, it } from "vitest";
import { summarizeUsageLogs } from "../../apps/ui/src/core/utils";

const buildLog = (partial: Partial<{ status: string; total_tokens: number | null; prompt_tokens: number | null; completion_tokens: number | null; latency_ms: number | null }>) => ({
	id: "1",
	model: "gpt-4",
	channel_id: "c1",
	token_id: "t1",
	total_tokens: partial.total_tokens ?? null,
	prompt_tokens: partial.prompt_tokens ?? null,
	completion_tokens: partial.completion_tokens ?? null,
	latency_ms: partial.latency_ms ?? null,
	status: partial.status ?? "ok",
	created_at: "2026-03-14T00:00:00Z",
});

describe("usage summary", () => {
	it("summarizes success, failure, tokens, and latency", () => {
		const logs = [
			buildLog({ status: "ok", total_tokens: 20, latency_ms: 1000 }),
			buildLog({ status: "error", total_tokens: 10, latency_ms: 3000 }),
			buildLog({ status: "ok", total_tokens: null, prompt_tokens: 5, completion_tokens: 5, latency_ms: null }),
		];
		const summary = summarizeUsageLogs(logs as any);
		expect(summary.total).toBe(3);
		expect(summary.success).toBe(2);
		expect(summary.failed).toBe(1);
		expect(summary.totalTokens).toBe(40);
		expect(Math.round(summary.errorRate)).toBe(33);
		expect(summary.avgLatencyMs).toBe(2000);
	});
});
