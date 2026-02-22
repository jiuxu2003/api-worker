import { Hono } from "hono";
import type { AppEnv } from "../env";
import {
	getCheckinSchedule,
	getRetentionDays,
	getSessionTtlHours,
	isAdminPasswordSet,
	setAdminPasswordHash,
	setCheckinSchedule,
	setRetentionDays,
	setSessionTtlHours,
} from "../services/settings";
import { sha256Hex } from "../utils/crypto";
import { jsonError } from "../utils/http";

const settings = new Hono<AppEnv>();

/**
 * Returns settings values.
 */
settings.get("/", async (c) => {
	const retention = await getRetentionDays(c.env.DB);
	const sessionTtlHours = await getSessionTtlHours(c.env.DB);
	const adminPasswordSet = await isAdminPasswordSet(c.env.DB);
	const checkinSchedule = await getCheckinSchedule(c.env.DB);
	return c.json({
		log_retention_days: retention,
		session_ttl_hours: sessionTtlHours,
		admin_password_set: adminPasswordSet,
		checkin_schedule_enabled: checkinSchedule.enabled,
		checkin_schedule_time: checkinSchedule.time,
	});
});

/**
 * Updates settings values.
 */
settings.put("/", async (c) => {
	const body = await c.req.json().catch(() => null);
	if (!body) {
		return jsonError(c, 400, "settings_required", "settings_required");
	}

	let touched = false;

	if (body.log_retention_days !== undefined) {
		const days = Number(body.log_retention_days);
		if (Number.isNaN(days) || days < 1) {
			return jsonError(
				c,
				400,
				"invalid_log_retention_days",
				"invalid_log_retention_days",
			);
		}
		await setRetentionDays(c.env.DB, days);
		touched = true;
	}

	if (body.session_ttl_hours !== undefined) {
		const hours = Number(body.session_ttl_hours);
		if (Number.isNaN(hours) || hours < 1) {
			return jsonError(
				c,
				400,
				"invalid_session_ttl_hours",
				"invalid_session_ttl_hours",
			);
		}
		await setSessionTtlHours(c.env.DB, hours);
		touched = true;
	}

	if (typeof body.admin_password === "string" && body.admin_password.trim()) {
		const hash = await sha256Hex(body.admin_password.trim());
		await setAdminPasswordHash(c.env.DB, hash);
		touched = true;
	}

	if (
		body.checkin_schedule_enabled !== undefined ||
		body.checkin_schedule_time !== undefined
	) {
		const current = await getCheckinSchedule(c.env.DB);
		const enabledRaw = body.checkin_schedule_enabled;
		const enabled =
			enabledRaw === undefined
				? current.enabled
				: enabledRaw === true || enabledRaw === "true";
		if (
			enabledRaw !== undefined &&
			enabledRaw !== true &&
			enabledRaw !== false
		) {
			if (enabledRaw !== "true" && enabledRaw !== "false") {
				return jsonError(
					c,
					400,
					"invalid_checkin_schedule_enabled",
					"invalid_checkin_schedule_enabled",
				);
			}
		}
		const timeValue =
			body.checkin_schedule_time !== undefined
				? String(body.checkin_schedule_time).trim()
				: current.time;
		if (!/^\d{2}:\d{2}$/.test(timeValue)) {
			return jsonError(
				c,
				400,
				"invalid_checkin_schedule_time",
				"invalid_checkin_schedule_time",
			);
		}
		const [hour, minute] = timeValue.split(":").map((value) => Number(value));
		if (
			Number.isNaN(hour) ||
			Number.isNaN(minute) ||
			hour < 0 ||
			hour > 23 ||
			minute < 0 ||
			minute > 59
		) {
			return jsonError(
				c,
				400,
				"invalid_checkin_schedule_time",
				"invalid_checkin_schedule_time",
			);
		}
		await setCheckinSchedule(c.env.DB, { enabled, time: timeValue });
		touched = true;
	}

	if (!touched) {
		return jsonError(c, 400, "settings_empty", "settings_empty");
	}

	return c.json({ ok: true });
});

export default settings;
