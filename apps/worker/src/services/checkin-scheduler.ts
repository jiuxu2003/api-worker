import type {
	DurableObjectNamespace,
	DurableObjectState,
} from "@cloudflare/workers-types";
import type { Bindings } from "../env";
import { getCheckinSchedule } from "./settings";
import { runCheckinAll } from "./checkin-runner";
import {
	beijingDateString,
	computeBeijingScheduleTime,
	computeNextBeijingRun,
} from "../utils/time";

const SCHEDULER_NAME = "checkin-scheduler";
const LAST_RUN_DATE_KEY = "last_run_date";

export const getCheckinSchedulerStub = (namespace: DurableObjectNamespace) =>
	namespace.get(namespace.idFromName(SCHEDULER_NAME));

export const shouldRunCheckin = (
	now: Date,
	scheduleTime: string,
	lastRunDate: string | null,
) => {
	const today = beijingDateString(now);
	if (lastRunDate && lastRunDate === today) {
		return false;
	}
	const scheduledAt = computeBeijingScheduleTime(now, scheduleTime);
	return now.getTime() >= scheduledAt.getTime();
};

export const shouldResetLastRun = (
	current: { enabled: boolean; time: string },
	next: { enabled: boolean; time: string },
) => {
	if (!next.enabled) {
		return false;
	}
	if (current.enabled !== next.enabled) {
		return next.enabled;
	}
	return current.time !== next.time;
};

export const computeNextAlarmAt = (
	now: Date,
	scheduleTime: string,
	reset: boolean,
) => {
	if (!reset) {
		return computeNextBeijingRun(now, scheduleTime);
	}
	const scheduledAt = computeBeijingScheduleTime(now, scheduleTime);
	if (now.getTime() >= scheduledAt.getTime()) {
		return new Date(now.getTime() + 1000);
	}
	return scheduledAt;
};

type RescheduleResult = {
	enabled: boolean;
	nextRunAt: string | null;
};

export class CheckinScheduler {
	private state: DurableObjectState;
	private env: Bindings;

	constructor(state: DurableObjectState, env: Bindings) {
		this.state = state;
		this.env = env;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (request.method === "POST" && url.pathname === "/reschedule") {
			let reset = false;
			try {
				const payload = (await request.json()) as { reset?: boolean };
				reset = Boolean(payload?.reset);
			} catch {
				reset = false;
			}
			const result = await this.reschedule(new Date(), reset);
			return new Response(JSON.stringify({ ok: true, ...result }), {
				headers: { "Content-Type": "application/json" },
			});
		}
		if (request.method === "GET" && url.pathname === "/status") {
			const lastRunDate =
				(await this.state.storage.get<string>(LAST_RUN_DATE_KEY)) ?? null;
			return new Response(
				JSON.stringify({
					ok: true,
					last_run_date: lastRunDate,
				}),
				{ headers: { "Content-Type": "application/json" } },
			);
		}
		return new Response("Not Found", { status: 404 });
	}

	async alarm(): Promise<void> {
		await this.handleAlarm();
	}

	private async handleAlarm(): Promise<void> {
		const now = new Date();
		const schedule = await getCheckinSchedule(this.env.DB);
		if (!schedule.enabled) {
			await this.state.storage.deleteAlarm();
			return;
		}
		const lastRunDate =
			(await this.state.storage.get<string>(LAST_RUN_DATE_KEY)) ?? null;
		if (shouldRunCheckin(now, schedule.time, lastRunDate)) {
			await runCheckinAll(this.env.DB, now);
			await this.state.storage.put(LAST_RUN_DATE_KEY, beijingDateString(now));
		}
		await this.reschedule(now);
	}

	private async reschedule(
		now: Date = new Date(),
		reset = false,
	): Promise<RescheduleResult> {
		const schedule = await getCheckinSchedule(this.env.DB);
		if (!schedule.enabled) {
			await this.state.storage.deleteAlarm();
			return { enabled: false, nextRunAt: null };
		}
		if (reset) {
			await this.state.storage.delete(LAST_RUN_DATE_KEY);
		}
		const nextRun = computeNextAlarmAt(now, schedule.time, reset);
		await this.state.storage.setAlarm(nextRun.getTime());
		return { enabled: true, nextRunAt: nextRun.toISOString() };
	}
}
