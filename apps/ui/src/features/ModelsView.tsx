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
		<div class="animate-fade-up rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
						模型广场
					</h3>
					<p class="text-xs text-stone-500">
						当前聚合的模型与所属渠道清单。
					</p>
				</div>
				<div class="flex items-center gap-2 text-xs text-stone-500">
					<span class="rounded-full bg-stone-100 px-2.5 py-1">
						{models.length} 个模型
					</span>
					<span class="rounded-full bg-stone-100 px-2.5 py-1">
						{channelCount} 个渠道
					</span>
				</div>
			</div>
			{models.length === 0 ? (
				<div class="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
					暂无模型，请先在站点管理配置可用渠道。
				</div>
			) : (
				<div class="overflow-x-auto">
					<table class="min-w-105 w-full border-collapse text-xs sm:text-sm">
						<thead>
							<tr>
								<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									模型
								</th>
								<th class="border-b border-stone-200 px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-stone-500 sm:text-xs">
									渠道
								</th>
							</tr>
						</thead>
						<tbody>
							{models.map((model) => (
								<tr class="hover:bg-stone-50" key={model.id}>
									<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
										{model.id}
									</td>
									<td class="border-b border-stone-200 px-3 py-2.5 text-left text-xs text-stone-700 sm:text-sm">
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
