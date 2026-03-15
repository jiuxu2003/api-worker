import type { DashboardData } from "../core/types";

type DashboardViewProps = {
	dashboard: DashboardData | null;
	onRefresh: () => void;
	isRefreshing: boolean;
};

/**
 * Renders the dashboard summary and charts.
 *
 * Args:
 *   props: Dashboard view props.
 *
 * Returns:
 *   Dashboard JSX element.
 */
export const DashboardView = ({
	dashboard,
	onRefresh,
	isRefreshing,
}: DashboardViewProps) => {
	if (!dashboard) {
		return (
			<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
							数据面板
						</h3>
						<p class="text-xs text-stone-500">
							查看请求量、消耗与性能趋势。
						</p>
					</div>
					<button
						class="h-9 rounded-full border border-stone-200 bg-stone-100 px-4 text-xs font-semibold text-stone-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
						type="button"
						disabled={isRefreshing}
						onClick={onRefresh}
					>
						{isRefreshing ? "刷新中..." : "刷新"}
					</button>
				</div>
				<div class="mt-6 rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
					暂无数据，请先产生调用或刷新面板。
					<div class="mt-4 flex justify-center">
						<button
							class="h-9 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
							type="button"
							onClick={onRefresh}
							disabled={isRefreshing}
						>
							立即刷新
						</button>
					</div>
				</div>
			</div>
		);
	}
	const totalRequests = dashboard.summary.total_requests;
	const totalErrors = dashboard.summary.total_errors;
	const errorRate = dashboard.summary.total_requests
		? Math.round(
				(dashboard.summary.total_errors / dashboard.summary.total_requests) *
					100,
			)
		: 0;
	const successRate = totalRequests
		? Math.max(0, Math.round(((totalRequests - totalErrors) / totalRequests) * 100))
		: 0;
	const avgTokensPerRequest = totalRequests
		? Math.round(dashboard.summary.total_tokens / totalRequests)
		: 0;
	return (
		<div class="animate-fade-up space-y-5">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
						数据面板
					</h3>
					<p class="text-xs text-stone-500">
						快速掌握请求表现、性能与消耗概况。
					</p>
				</div>
				<button
					class="h-9 rounded-full border border-stone-200 bg-stone-100 px-4 text-xs font-semibold text-stone-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
					type="button"
					disabled={isRefreshing}
					onClick={onRefresh}
				>
					{isRefreshing ? "刷新中..." : "刷新"}
				</button>
			</div>
			<div class="grid grid-cols-1 gap-5 lg:grid-cols-4">
				<div class="flex flex-col gap-1.5 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
						总请求
					</span>
					<div class="text-2xl font-semibold text-stone-900">
						{dashboard.summary.total_requests}
					</div>
					<span class="font-['Space_Grotesk'] text-xs text-stone-500">
						最近窗口
					</span>
				</div>
				<div class="flex flex-col gap-1.5 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
						总 Tokens
					</span>
					<div class="text-2xl font-semibold text-stone-900">
						{dashboard.summary.total_tokens}
					</div>
					<span class="font-['Space_Grotesk'] text-xs text-stone-500">
						累计消耗
					</span>
				</div>
				<div class="flex flex-col gap-1.5 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
						成功率
					</span>
					<div class="text-2xl font-semibold text-stone-900">
						{successRate}%
					</div>
					<span class="font-['Space_Grotesk'] text-xs text-stone-500">
						错误率 {errorRate}%
					</span>
				</div>
				<div class="flex flex-col gap-1.5 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
						单次消耗
					</span>
					<div class="text-2xl font-semibold text-stone-900">
						{avgTokensPerRequest}
					</div>
					<span class="font-['Space_Grotesk'] text-xs text-stone-500">
						平均 {Math.round(dashboard.summary.avg_latency)}ms 延迟
					</span>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="mb-0 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
							按日趋势
						</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-130 w-full border-collapse text-xs sm:text-sm">
							<thead>
								<tr>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										日期
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										请求
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										Tokens
									</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byDay.map((row) => (
									<tr class="hover:bg-stone-50" key={row.day}>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.day}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.requests}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.tokens}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="mb-0 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
							模型排行
						</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-130 w-full border-collapse text-xs sm:text-sm">
							<thead>
								<tr>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										模型
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										请求
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										Tokens
									</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byModel.map((row) => (
									<tr class="hover:bg-stone-50" key={row.model}>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.model ?? "-"}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.requests}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.tokens}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="mb-0 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
							渠道贡献
						</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-130 w-full border-collapse text-xs sm:text-sm">
							<thead>
								<tr>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										渠道
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										请求
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										Tokens
									</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byChannel.map((row) => (
									<tr
										class="hover:bg-stone-50"
										key={row.channel_name ?? "unknown"}
									>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.channel_name ?? "-"}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.requests}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.tokens}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="mb-0 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
							令牌贡献
						</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="min-w-130 w-full border-collapse text-xs sm:text-sm">
							<thead>
								<tr>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										令牌
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										请求
									</th>
									<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
										Tokens
									</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byToken.map((row) => (
									<tr
										class="hover:bg-stone-50"
										key={row.token_name ?? "unknown"}
									>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.token_name ?? "-"}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.requests}
										</td>
										<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
											{row.tokens}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};
