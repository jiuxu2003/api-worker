import type { D1Database } from "@cloudflare/workers-types";
import { nowIso } from "../utils/time";
import { extractModelIds } from "./channel-models";
import type { ModelEntry } from "./channel-models";

export const DEFAULT_MODEL_CAPABILITY_TTL_SEC = 2 * 60 * 60;

export type CapabilityRow = {
	channel_id: string;
	model: string;
	last_ok_at: number | null;
};

export function buildCapabilityMap(
	rows: CapabilityRow[],
	cutoff: number,
): Map<string, Set<string>> {
	const map = new Map<string, Set<string>>();
	for (const row of rows) {
		if (!row.channel_id || !row.model) {
			continue;
		}
		const lastOk = Number(row.last_ok_at ?? 0);
		if (!lastOk || lastOk < cutoff) {
			continue;
		}
		const set = map.get(row.channel_id) ?? new Set<string>();
		set.add(row.model);
		map.set(row.channel_id, set);
	}
	return map;
}

export async function listVerifiedModelsByChannel(
	db: D1Database,
	channelIds: string[],
	ttlSeconds: number = DEFAULT_MODEL_CAPABILITY_TTL_SEC,
): Promise<Map<string, Set<string>>> {
	if (channelIds.length === 0) {
		return new Map();
	}
	const cutoff = Math.floor(Date.now() / 1000) - ttlSeconds;
	const placeholders = channelIds.map(() => "?").join(", ");
	const rows = await db
		.prepare(
			`SELECT channel_id, model, last_ok_at FROM channel_model_capabilities WHERE channel_id IN (${placeholders}) AND last_ok_at >= ?`,
		)
		.bind(...channelIds, cutoff)
		.all<CapabilityRow>();
	return buildCapabilityMap(rows.results ?? [], cutoff);
}

export async function listVerifiedModelEntries(
	db: D1Database,
	channels: Array<{ id: string; name: string }>,
	ttlSeconds: number = DEFAULT_MODEL_CAPABILITY_TTL_SEC,
): Promise<ModelEntry[]> {
	const ids = channels.map((channel) => channel.id);
	const nameMap = new Map(channels.map((channel) => [channel.id, channel.name]));
	const map = await listVerifiedModelsByChannel(db, ids, ttlSeconds);
	const entries: ModelEntry[] = [];
	for (const [channelId, models] of map.entries()) {
		const channelName = nameMap.get(channelId) ?? channelId;
		for (const id of models) {
			entries.push({ id, label: id, channelId, channelName });
		}
	}
	return entries;
}

export async function listModelsByChannelWithFallback(
	db: D1Database,
	channels: Array<{ id: string; name: string; models_json?: string | null }>,
	ttlSeconds: number = DEFAULT_MODEL_CAPABILITY_TTL_SEC,
): Promise<Map<string, Set<string>>> {
	const ids = channels.map((channel) => channel.id);
	const verified = await listVerifiedModelsByChannel(db, ids, ttlSeconds);
	const map = new Map<string, Set<string>>();
	for (const channel of channels) {
		const verifiedModels = verified.get(channel.id);
		if (verifiedModels && verifiedModels.size > 0) {
			map.set(channel.id, new Set(verifiedModels));
			continue;
		}
		const declaredModels = extractModelIds(channel);
		if (declaredModels.length > 0) {
			map.set(channel.id, new Set(declaredModels));
		}
	}
	return map;
}

export async function listModelEntriesWithFallback(
	db: D1Database,
	channels: Array<{ id: string; name: string; models_json?: string | null }>,
	ttlSeconds: number = DEFAULT_MODEL_CAPABILITY_TTL_SEC,
): Promise<ModelEntry[]> {
	const map = await listModelsByChannelWithFallback(db, channels, ttlSeconds);
	const entries: ModelEntry[] = [];
	for (const channel of channels) {
		const models = map.get(channel.id);
		if (!models) {
			continue;
		}
		for (const id of models) {
			entries.push({ id, label: id, channelId: channel.id, channelName: channel.name });
		}
	}
	return entries;
}

export async function listCoolingDownChannelsForModel(
	db: D1Database,
	channelIds: string[],
	model: string | null,
	cooldownSeconds: number,
): Promise<Set<string>> {
	if (!model || channelIds.length === 0 || cooldownSeconds <= 0) {
		return new Set();
	}
	const now = Math.floor(Date.now() / 1000);
	const cutoff = now - cooldownSeconds;
	const placeholders = channelIds.map(() => "?").join(", ");
	const rows = await db
		.prepare(
			`SELECT channel_id, last_err_at, last_ok_at FROM channel_model_capabilities WHERE model = ? AND channel_id IN (${placeholders}) AND last_err_at IS NOT NULL AND last_err_at >= ?`,
		)
		.bind(model, ...channelIds, cutoff)
		.all<{ channel_id: string; last_err_at: number | null; last_ok_at: number | null }>();
	const blocked = new Set<string>();
	for (const row of rows.results ?? []) {
		const lastErr = Number(row.last_err_at ?? 0);
		const lastOk = Number(row.last_ok_at ?? 0);
		if (lastErr && lastErr >= lastOk) {
			blocked.add(row.channel_id);
		}
	}
	return blocked;
}

export async function recordChannelModelError(
	db: D1Database,
	channelId: string,
	model: string | null,
	errorCode: string,
	nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<void> {
	if (!model) {
		return;
	}
	const timestamp = nowIso();
	await db
		.prepare(
			"INSERT INTO channel_model_capabilities (channel_id, model, last_ok_at, last_err_at, last_err_code, created_at, updated_at) VALUES (?, ?, 0, ?, ?, ?, ?) ON CONFLICT(channel_id, model) DO UPDATE SET last_err_at = excluded.last_err_at, last_err_code = excluded.last_err_code, updated_at = excluded.updated_at",
		)
		.bind(channelId, model, nowSeconds, errorCode, timestamp, timestamp)
		.run();
}

export async function upsertChannelModelCapabilities(
	db: D1Database,
	channelId: string,
	models: string[],
	nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<void> {
	if (models.length === 0) {
		return;
	}
	const timestamp = nowIso();
	const stmt = db.prepare(
		"INSERT INTO channel_model_capabilities (channel_id, model, last_ok_at, last_err_at, last_err_code, created_at, updated_at) VALUES (?, ?, ?, NULL, NULL, ?, ?) ON CONFLICT(channel_id, model) DO UPDATE SET last_ok_at = excluded.last_ok_at, last_err_at = NULL, last_err_code = NULL, updated_at = excluded.updated_at",
	);
	const statements = models.map((model) =>
		stmt.bind(channelId, model, nowSeconds, timestamp, timestamp),
	);
	await db.batch(statements);
}
