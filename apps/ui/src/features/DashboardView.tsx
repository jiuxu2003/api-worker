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
			<div class="animate-fade-up space-y-5">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h3 class="app-title">数据面板</h3>
						<p class="app-subtitle">查看请求量、消耗与性能趋势。</p>
					</div>
					<button
						class="app-button app-focus"
						type="button"
						disabled={isRefreshing}
						onClick={onRefresh}
					>
						{isRefreshing ? "刷新中..." : "刷新"}
					</button>
				</div>
				<div class="app-card mt-6 text-center">
					<div class="app-chip app-chip--accent">空状态</div>
					<p class="mt-3 text-sm text-[color:var(--app-ink-muted)]">
						暂无数据，请先产生调用或刷新面板。
					</p>
					<div class="mt-4 flex justify-center">
						<button
							class="app-button app-button-primary app-focus"
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
		? Math.max(
				0,
				Math.round(((totalRequests - totalErrors) / totalRequests) * 100),
			)
		: 0;
	const avgTokensPerRequest = totalRequests
		? Math.round(dashboard.summary.total_tokens / totalRequests)
		: 0;
	return (
		<div class="animate-fade-up space-y-5">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h3 class="app-title">数据面板</h3>
					<p class="app-subtitle">快速掌握请求表现、性能与消耗概况。</p>
				</div>
				<button
					class="app-button app-focus"
					type="button"
					disabled={isRefreshing}
					onClick={onRefresh}
				>
					{isRefreshing ? "刷新中..." : "刷新"}
				</button>
			</div>
			<div class="app-grid app-grid--kpi">
				<div class="app-card app-card--compact">
					<span class="app-chip">总请求</span>
					<div class="app-kpi-value">{dashboard.summary.total_requests}</div>
					<span class="app-kpi-meta">最近窗口</span>
				</div>
				<div class="app-card app-card--compact">
					<span class="app-chip">总 Tokens</span>
					<div class="app-kpi-value">{dashboard.summary.total_tokens}</div>
					<span class="app-kpi-meta">累计消耗</span>
				</div>
				<div class="app-card app-card--compact">
					<span class="app-chip">成功率</span>
					<div class="app-kpi-value">{successRate}%</div>
					<span class="app-kpi-meta">错误率 {errorRate}%</span>
				</div>
				<div class="app-card app-card--compact">
					<span class="app-chip">单次消耗</span>
					<div class="app-kpi-value">{avgTokensPerRequest}</div>
					<span class="app-kpi-meta">
						平均 {Math.round(dashboard.summary.avg_latency)}ms 延迟
					</span>
				</div>
			</div>
			<div class="app-grid app-grid--split">
				<div class="app-card">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="app-title">按日趋势</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="app-table">
							<thead>
								<tr>
									<th>日期</th>
									<th>请求</th>
									<th>Tokens</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byDay.map((row) => (
									<tr key={row.day}>
										<td>{row.day}</td>
										<td>{row.requests}</td>
										<td>{row.tokens}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
				<div class="app-card">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="app-title">模型排行</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="app-table">
							<thead>
								<tr>
									<th>模型</th>
									<th>请求</th>
									<th>Tokens</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byModel.map((row) => (
									<tr key={row.model}>
										<td>{row.model ?? "-"}</td>
										<td>{row.requests}</td>
										<td>{row.tokens}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="app-grid app-grid--split">
				<div class="app-card">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="app-title">渠道贡献</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="app-table">
							<thead>
								<tr>
									<th>渠道</th>
									<th>请求</th>
									<th>Tokens</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byChannel.map((row) => (
									<tr key={row.channel_name ?? "unknown"}>
										<td>{row.channel_name ?? "-"}</td>
										<td>{row.requests}</td>
										<td>{row.tokens}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
				<div class="app-card">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="app-title">令牌贡献</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="app-table">
							<thead>
								<tr>
									<th>令牌</th>
									<th>请求</th>
									<th>Tokens</th>
								</tr>
							</thead>
							<tbody>
								{dashboard.byToken.map((row) => (
									<tr key={row.token_name ?? "unknown"}>
										<td>{row.token_name ?? "-"}</td>
										<td>{row.requests}</td>
										<td>{row.tokens}</td>
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
