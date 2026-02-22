import { Hono } from "hono";
import type { AppEnv } from "../env";
import {
	deleteCheckinSite,
	getCheckinSiteById,
	insertCheckinSite,
	listCheckinSites,
	listActiveCheckinSites,
	updateCheckinSite,
	updateCheckinResult,
} from "../services/checkin-site-repo";
import { runCheckin, summarizeCheckin } from "../services/checkin";
import { generateToken } from "../utils/crypto";
import { jsonError } from "../utils/http";
import { beijingDateString, nowIso } from "../utils/time";
import { normalizeBaseUrl } from "../utils/url";

const checkinSites = new Hono<AppEnv>();

type CheckinSitePayload = {
	name?: string;
	base_url?: string;
	checkin_url?: string | null;
	token?: string;
	userid?: string;
	new_api_user?: string;
	status?: string;
};

/**
 * Lists all checkin sites.
 */
checkinSites.get("/", async (c) => {
	const rows = await listCheckinSites(c.env.DB, {
		order: "DESC",
	});
	const sites = rows.map((row) => {
		const { new_api_user, ...rest } = row;
		return {
			...rest,
			userid: new_api_user ?? null,
		};
	});
	return c.json({ sites });
});

/**
 * Creates a new checkin site.
 */
checkinSites.post("/", async (c) => {
	const body = (await c.req.json().catch(() => null)) as CheckinSitePayload | null;
	const userid = body?.userid ?? body?.new_api_user;
	if (!body?.name || !body.base_url || !body.token || !userid) {
		return jsonError(c, 400, "missing_fields", "missing_fields");
	}
	const id = generateToken("cs_");
	const now = nowIso();
	await insertCheckinSite(c.env.DB, {
		id,
		name: body.name,
		base_url: normalizeBaseUrl(String(body.base_url)),
		checkin_url: body.checkin_url?.trim() || null,
		token: body.token,
		new_api_user: userid.trim(),
		last_checkin_date: null,
		last_checkin_status: null,
		last_checkin_message: null,
		last_checkin_at: null,
		status: body.status ?? "active",
		created_at: now,
		updated_at: now,
	});
	return c.json({ id });
});

/**
 * Updates a checkin site.
 */
checkinSites.patch("/:id", async (c) => {
	const body = (await c.req.json().catch(() => null)) as CheckinSitePayload | null;
	const id = c.req.param("id");
	if (!body) {
		return jsonError(c, 400, "missing_body", "missing_body");
	}
	const current = await getCheckinSiteById(c.env.DB, id);
	if (!current) {
		return jsonError(c, 404, "site_not_found", "site_not_found");
	}
	await updateCheckinSite(c.env.DB, id, {
		name: body.name ?? current.name,
		base_url: normalizeBaseUrl(String(body.base_url ?? current.base_url)),
		checkin_url:
			body.checkin_url !== undefined
				? body.checkin_url?.trim() || null
				: current.checkin_url ?? null,
		token: body.token ?? current.token,
		new_api_user:
			body.userid !== undefined || body.new_api_user !== undefined
				? String(body.userid ?? body.new_api_user ?? "").trim()
				: current.new_api_user ?? null,
		status: body.status ?? current.status,
		updated_at: nowIso(),
	});
	return c.json({ ok: true });
});

/**
 * Deletes a checkin site.
 */
checkinSites.delete("/:id", async (c) => {
	const id = c.req.param("id");
	await deleteCheckinSite(c.env.DB, id);
	return c.json({ ok: true });
});

/**
 * Runs checkin for all active sites.
 */
checkinSites.post("/checkin-all", async (c) => {
	const sites = await listActiveCheckinSites(c.env.DB);
	const results = [];
	const today = beijingDateString();
	for (const site of sites) {
		const alreadyChecked =
			site.last_checkin_date === today &&
			(site.last_checkin_status === "success" ||
				site.last_checkin_status === "skipped");
		if (alreadyChecked) {
			results.push({
				id: site.id,
				name: site.name,
				status: "skipped",
				message: site.last_checkin_message ?? "今日已签到",
				checkin_date: site.last_checkin_date ?? today,
			});
			continue;
		}
		const result = await runCheckin(site);
		const checkinDate = result.checkin_date ?? today;
		await updateCheckinResult(c.env.DB, site.id, {
			last_checkin_date: checkinDate,
			last_checkin_status: result.status,
			last_checkin_message: result.message,
			last_checkin_at: nowIso(),
		});
		results.push({ ...result, checkin_date: checkinDate });
	}
	const summary = summarizeCheckin(results);
	return c.json({
		results,
		summary,
		runs_at: nowIso(),
	});
});

export default checkinSites;
