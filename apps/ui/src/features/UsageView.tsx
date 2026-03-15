import { useEffect, useMemo, useState } from "hono/jsx/dom";
import type { UsageLog, UsageQuery } from "../core/types";
import {
	buildPageItems,
	buildUsageStatusDetail,
	formatDateTime,
} from "../core/utils";

type UsageViewProps = {
	usage: UsageLog[];
	total: number;
	page: number;
	pageSize: number;
	filters: UsageQuery;
	isRefreshing: boolean;
	onRefresh: () => void;
	onPageChange: (next: number) => void;
	onPageSizeChange: (next: number) => void;
	onFiltersChange: (patch: Partial<UsageQuery>) => void;
	onSearch: () => void;
	onClear: () => void;
};

const pageSizeOptions = [50, 100, 200];

const formatTokens = (value: number | null | undefined) =>
	value === null || value === undefined ? "-" : value;

const formatSeconds = (value: number | null | undefined) => {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "-";
	}
	return `${(value / 1000).toFixed(2)} s`;
};

const formatStream = (value: boolean | number | null | undefined) => {
	if (value === null || value === undefined) {
		return "-";
	}
	if (typeof value === "number") {
		return value > 0 ? "是" : "否";
	}
	return value ? "是" : "否";
};

/**
 * Renders the usage logs view.
 *
 * Args:
 *   props: Usage view props.
 *
 * Returns:
 *   Usage JSX element.
 */
export const UsageView = ({
	usage,
	total,
	page,
	pageSize,
	filters,
	isRefreshing,
	onRefresh,
	onPageChange,
	onPageSizeChange,
	onFiltersChange,
	onSearch,
	onClear,
}: UsageViewProps) => {
	const [activeErrorLog, setActiveErrorLog] = useState<UsageLog | null>(null);
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(total / pageSize)),
		[total, pageSize],
	);
	const pageItems = useMemo(
		() => buildPageItems(page, totalPages),
		[page, totalPages],
	);
	const closeErrorModal = () => setActiveErrorLog(null);
	const hasFilters =
		filters.channel.trim() ||
		filters.token.trim() ||
		filters.model.trim() ||
		filters.status.trim();

	const handleSearchKey = (event: KeyboardEvent) => {
		if (event.key === "Enter") {
			event.preventDefault();
			onSearch();
		}
	};

	useEffect(() => {
		if (!activeErrorLog) {
			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closeErrorModal();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeErrorLog]);

	return (
		<div class="animate-fade-up rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
						使用日志
					</h3>
					<p class="text-xs text-stone-500">
						追踪每次调用的令牌与关键性能指标。
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<button
						class="h-9 rounded-full border border-stone-200 bg-stone-100 px-4 text-xs font-semibold text-stone-900 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
						type="button"
						disabled={isRefreshing}
						onClick={onRefresh}
					>
						{isRefreshing ? "刷新中..." : "刷新"}
					</button>
				</div>
			</div>
			<div class="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-3">
				<label class="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] uppercase tracking-widest text-stone-400">
					渠道
					<input
						class="w-36 bg-transparent text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none"
						placeholder="渠道名称"
						value={filters.channel}
						onInput={(event) =>
							onFiltersChange({
								channel: (event.currentTarget as HTMLInputElement).value,
							})
						}
						onKeyDown={handleSearchKey}
					/>
				</label>
				<label class="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] uppercase tracking-widest text-stone-400">
					令牌
					<input
						class="w-36 bg-transparent text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none"
						placeholder="令牌名称"
						value={filters.token}
						onInput={(event) =>
							onFiltersChange({
								token: (event.currentTarget as HTMLInputElement).value,
							})
						}
						onKeyDown={handleSearchKey}
					/>
				</label>
				<label class="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] uppercase tracking-widest text-stone-400">
					模型
					<input
						class="w-36 bg-transparent text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none"
						placeholder="模型名称"
						value={filters.model}
						onInput={(event) =>
							onFiltersChange({
								model: (event.currentTarget as HTMLInputElement).value,
							})
						}
						onKeyDown={handleSearchKey}
					/>
				</label>
				<label class="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] uppercase tracking-widest text-stone-400">
					状态码
					<input
						class="w-28 bg-transparent text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none"
						placeholder="200/503"
						inputMode="numeric"
						value={filters.status}
						onInput={(event) =>
							onFiltersChange({
								status: (event.currentTarget as HTMLInputElement).value,
							})
						}
						onKeyDown={handleSearchKey}
					/>
				</label>
				<div class="flex flex-wrap items-center gap-2">
					<button
						class="h-8 rounded-full bg-stone-900 px-4 text-[11px] font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
						type="button"
						disabled={isRefreshing}
						onClick={onSearch}
					>
						搜索
					</button>
					<button
						class="h-8 rounded-full border border-stone-200 bg-white px-4 text-[11px] font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
						type="button"
						disabled={isRefreshing || !hasFilters}
						onClick={onClear}
					>
						清空
					</button>
				</div>
			</div>
			<div class="mt-4 overflow-hidden rounded-xl border border-stone-200">
				<div class="h-[420px] overflow-auto sm:h-[520px]">
					<table class="min-w-[960px] w-full border-collapse text-xs sm:text-sm">
						<thead>
							<tr>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									时间
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									模型
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									渠道
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									令牌
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									输入 Tokens
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									输出 Tokens
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									用时 (s)
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									首 token 延迟 (s)
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									流式
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									推理强度
								</th>
								<th class="sticky top-0 border-b border-stone-200 bg-stone-50 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									状态码
								</th>
							</tr>
						</thead>
						<tbody>
							{usage.length === 0 ? (
								<tr>
									<td
										class="px-3 py-10 text-center text-sm text-stone-500"
										colSpan={11}
									>
										<div class="flex flex-col items-center gap-3">
											<span>暂无日志，先完成一次调用吧。</span>
											<button
												class="h-8 rounded-full bg-stone-900 px-4 text-[11px] font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
												type="button"
												onClick={onRefresh}
												disabled={isRefreshing}
											>
												立即刷新
											</button>
										</div>
									</td>
								</tr>
							) : (
								usage.map((log) => {
									const statusDetail = buildUsageStatusDetail(log);
									const hasDetail = Boolean(
										log.error_message || log.error_code,
									);
									return (
									<tr class="hover:bg-stone-50" key={log.id}>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{formatDateTime(log.created_at)}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{log.model ?? "-"}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{log.channel_name ?? log.channel_id ?? "-"}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{log.token_name ?? log.token_id ?? "-"}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{formatTokens(log.prompt_tokens)}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{formatTokens(log.completion_tokens)}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{formatSeconds(log.latency_ms)}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{formatSeconds(log.first_token_latency_ms)}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{formatStream(log.stream)}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{log.reasoning_effort ?? "-"}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											<div
												class={
													statusDetail.tone === "success"
														? "font-semibold text-emerald-700"
														: "font-semibold text-rose-700"
												}
											>
												{statusDetail.label}
											</div>
											{hasDetail ? (
												<button
													class="mt-2 rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md"
													type="button"
													onClick={() => setActiveErrorLog(log)}
												>
													查看详情
												</button>
											) : null}
										</td>
									</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
			<div class="mt-4 flex flex-col gap-3 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-xs text-stone-500">
						共 {totalPages} 页 · {total} 条
					</span>
					<button
						class="h-8 w-8 rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
						type="button"
						disabled={page <= 1 || isRefreshing}
						onClick={() => onPageChange(Math.max(1, page - 1))}
					>
						&lt;
					</button>
					{pageItems.map((item, index) =>
						item === "ellipsis" ? (
							<span class="px-2 text-xs text-stone-400" key={`e-${index}`}>
								...
							</span>
						) : (
							<button
								class={`h-8 min-w-8 rounded-full border px-3 text-xs font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
									item === page
										? "border-stone-900 bg-stone-900 text-white shadow-md"
										: "border-stone-200 bg-white text-stone-600 hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md"
								}`}
								type="button"
								key={item}
								disabled={isRefreshing}
								onClick={() => onPageChange(item)}
							>
								{item}
							</button>
						),
					)}
					<button
						class="h-8 w-8 rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
						type="button"
						disabled={page >= totalPages || isRefreshing}
						onClick={() => onPageChange(Math.min(totalPages, page + 1))}
					>
						&gt;
					</button>
				</div>
				<label class="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
					每页条数
					<select
						class="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-xs text-stone-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
						value={pageSize}
						disabled={isRefreshing}
						onChange={(event) =>
							onPageSizeChange(
								Number((event.currentTarget as HTMLSelectElement).value),
							)
						}
					>
						{pageSizeOptions.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
				</label>
			</div>
			{activeErrorLog ? (
				<div
					class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 px-4 py-8"
					onClick={closeErrorModal}
				>
					<div
						aria-labelledby="usage-error-title"
						aria-modal="true"
						class="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl"
						role="dialog"
						onClick={(event) => event.stopPropagation()}
					>
						<div class="flex items-start justify-between gap-4">
							<div>
								<h3
									class="font-['Space_Grotesk'] text-lg tracking-tight text-stone-900"
									id="usage-error-title"
								>
									错误详情
								</h3>
								<p class="mt-2 text-xs text-stone-500">
									状态码 {activeErrorLog.upstream_status ?? "-"}
								</p>
								{activeErrorLog.error_code ? (
									<p class="mt-1 text-xs text-stone-500">
										错误码: {activeErrorLog.error_code}
									</p>
								) : null}
							</div>
							<button
								class="h-8 rounded-full border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
								type="button"
								onClick={closeErrorModal}
							>
								关闭
							</button>
						</div>
						<div class="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
							<div class="grid gap-2">
								<div class="flex items-center justify-between gap-3">
									<span class="text-stone-400">时间</span>
									<span>{formatDateTime(activeErrorLog.created_at)}</span>
								</div>
								<div class="flex items-center justify-between gap-3">
									<span class="text-stone-400">模型</span>
									<span>{activeErrorLog.model ?? "-"}</span>
								</div>
								<div class="flex items-center justify-between gap-3">
									<span class="text-stone-400">渠道</span>
									<span>
										{activeErrorLog.channel_name ??
											activeErrorLog.channel_id ??
											"-"}
									</span>
								</div>
								<div class="flex items-center justify-between gap-3">
									<span class="text-stone-400">令牌</span>
									<span>
										{activeErrorLog.token_name ??
											activeErrorLog.token_id ??
											"-"}
									</span>
								</div>
								<div class="flex items-center justify-between gap-3">
									<span class="text-stone-400">耗时</span>
									<span>{formatSeconds(activeErrorLog.latency_ms)}</span>
								</div>
							</div>
							<p class="mt-3 text-[11px] text-stone-400">
								错误片段已省略，请结合状态码与错误码排查。
							</p>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};
