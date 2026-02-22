import type { D1Database } from "@cloudflare/workers-types";
import type { CheckinSiteRow } from "./checkin-site-types";

type CheckinSiteFilters = {
	status?: string | null;
};

function buildWhere(filters: CheckinSiteFilters | undefined) {
	const where: string[] = [];
	const bindings: Array<string> = [];
	if (filters?.status) {
		where.push("status = ?");
		bindings.push(filters.status);
	}
	const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
	return { whereSql, bindings };
}

export async function listCheckinSites(
	db: D1Database,
	options: {
		filters?: CheckinSiteFilters;
		order?: "ASC" | "DESC";
	} = {},
): Promise<CheckinSiteRow[]> {
	const { whereSql, bindings } = buildWhere(options.filters);
	const order = options.order ?? "DESC";
	const statement = db.prepare(
		`SELECT * FROM checkin_sites ${whereSql} ORDER BY created_at ${order}`,
	);
	const rows = await statement.bind(...bindings).all<CheckinSiteRow>();
	return rows.results ?? [];
}

export async function listActiveCheckinSites(
	db: D1Database,
): Promise<CheckinSiteRow[]> {
	return listCheckinSites(db, { filters: { status: "active" } });
}

export async function getCheckinSiteById(
	db: D1Database,
	id: string,
): Promise<CheckinSiteRow | null> {
	const row = await db
		.prepare("SELECT * FROM checkin_sites WHERE id = ?")
		.bind(id)
		.first<CheckinSiteRow>();
	return row ?? null;
}

export type CheckinSiteInsertInput = {
	id: string;
	name: string;
	base_url: string;
	checkin_url: string | null;
	token: string;
	new_api_user: string | null;
	last_checkin_date: string | null;
	last_checkin_status: string | null;
	last_checkin_message: string | null;
	last_checkin_at: string | null;
	status: string;
	created_at: string;
	updated_at: string;
};

export async function insertCheckinSite(
	db: D1Database,
	input: CheckinSiteInsertInput,
): Promise<void> {
	await db
		.prepare(
			"INSERT INTO checkin_sites (id, name, base_url, checkin_url, token, new_api_user, last_checkin_date, last_checkin_status, last_checkin_message, last_checkin_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		)
		.bind(
			input.id,
			input.name,
			input.base_url,
			input.checkin_url,
			input.token,
			input.new_api_user,
			input.last_checkin_date,
			input.last_checkin_status,
			input.last_checkin_message,
			input.last_checkin_at,
			input.status,
			input.created_at,
			input.updated_at,
		)
		.run();
}

export type CheckinSiteUpdateInput = {
	name: string;
	base_url: string;
	checkin_url: string | null;
	token: string;
	new_api_user: string | null;
	status: string;
	updated_at: string;
};

export async function updateCheckinSite(
	db: D1Database,
	id: string,
	input: CheckinSiteUpdateInput,
): Promise<void> {
	await db
		.prepare(
			"UPDATE checkin_sites SET name = ?, base_url = ?, checkin_url = ?, token = ?, new_api_user = ?, status = ?, updated_at = ? WHERE id = ?",
		)
		.bind(
			input.name,
			input.base_url,
			input.checkin_url,
			input.token,
			input.new_api_user,
			input.status,
			input.updated_at,
			id,
		)
		.run();
}

export async function updateCheckinResult(
	db: D1Database,
	id: string,
	input: {
		last_checkin_date: string | null;
		last_checkin_status: string | null;
		last_checkin_message: string | null;
		last_checkin_at: string | null;
	},
): Promise<void> {
	await db
		.prepare(
			"UPDATE checkin_sites SET last_checkin_date = ?, last_checkin_status = ?, last_checkin_message = ?, last_checkin_at = ?, updated_at = ? WHERE id = ?",
		)
		.bind(
			input.last_checkin_date,
			input.last_checkin_status,
			input.last_checkin_message,
			input.last_checkin_at,
			input.last_checkin_at ?? new Date().toISOString(),
			id,
		)
		.run();
}

export async function deleteCheckinSite(
	db: D1Database,
	id: string,
): Promise<void> {
	await db.prepare("DELETE FROM checkin_sites WHERE id = ?").bind(id).run();
}
