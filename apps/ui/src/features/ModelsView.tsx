import type { ModelItem } from "../core/types";

type ModelsViewProps = {
	models: ModelItem[];
};

/**
 * Renders the models view.
 *
 * Args:
 *   props: Models view props.
 *
 * Returns:
 *   Models JSX element.
 */
export const ModelsView = ({ models }: ModelsViewProps) => {
	const channelCount = new Set(
		models.flatMap((model) => model.channels.map((channel) => channel.id)),
	).size;
	return (
		<div class="app-card animate-fade-up p-5">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 class="app-title text-lg">模型广场</h3>
					<p class="app-subtitle">当前聚合的模型与所属渠道清单。</p>
				</div>
				<div class="flex items-center gap-2 text-xs text-[color:var(--app-ink-muted)]">
					<span class="app-chip">{models.length} 个模型</span>
					<span class="app-chip">{channelCount} 个渠道</span>
				</div>
			</div>
			{models.length === 0 ? (
				<div class="app-card text-center text-sm text-[color:var(--app-ink-muted)]">
					暂无模型，请先在站点管理配置可用渠道。
				</div>
			) : (
				<div class="overflow-x-auto">
					<table class="app-table min-w-105 w-full text-xs sm:text-sm">
						<thead>
							<tr>
								<th>模型</th>
								<th>渠道</th>
							</tr>
						</thead>
						<tbody>
							{models.map((model) => (
								<tr key={model.id}>
									<td>{model.id}</td>
									<td>
										{model.channels.map((channel) => channel.name).join(" / ")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};
