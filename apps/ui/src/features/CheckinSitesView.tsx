import type { CheckinSite, CheckinSiteForm, CheckinSummary } from "../core/types";
import { formatDateTime, getBeijingDateString } from "../core/utils";

type CheckinSitesViewProps = {
	sites: CheckinSite[];
	form: CheckinSiteForm;
	isModalOpen: boolean;
	editingSite: CheckinSite | null;
	summary: CheckinSummary | null;
	lastRun: string | null;
	onCreate: () => void;
	onEdit: (site: CheckinSite) => void;
	onCloseModal: () => void;
	onSubmit: (event: Event) => void;
	onFormChange: (patch: Partial<CheckinSiteForm>) => void;
	onToggle: (id: string, status: string) => void;
	onDelete: (id: string) => void;
	onRunAll: () => void;
};

export const CheckinSitesView = ({
	sites,
	form,
	isModalOpen,
	editingSite,
	summary,
	lastRun,
	onCreate,
	onEdit,
	onCloseModal,
	onSubmit,
	onFormChange,
	onToggle,
	onDelete,
	onRunAll,
}: CheckinSitesViewProps) => {
	const isEditing = Boolean(editingSite);
	const today = getBeijingDateString();
	const openManual = (site: CheckinSite) => {
		const url =
			site.checkin_url && site.checkin_url.trim()
				? site.checkin_url.trim()
				: site.base_url;
		if (!url) {
			return;
		}
		window.open(url, "_blank", "noopener");
	};
	return (
		<div class="space-y-5">
			<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
							签到站点
						</h3>
						<p class="text-xs text-stone-500">
							维护站点信息，一键签到仅对启用站点执行。
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						{summary && (
							<div class="flex flex-wrap items-center gap-2 text-xs text-stone-500">
								<span>总计 {summary.total}</span>
								<span class="text-emerald-600">成功 {summary.success}</span>
								<span class="text-stone-500">已签 {summary.skipped}</span>
								<span class="text-rose-600">失败 {summary.failed}</span>
							</div>
						)}
						<button
							class="h-9 rounded-full border border-stone-200 bg-stone-100 px-4 text-xs font-semibold text-stone-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
							type="button"
							onClick={onRunAll}
						>
							一键签到
						</button>
						<button
							class="h-9 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
							type="button"
							onClick={onCreate}
						>
							新增站点
						</button>
					</div>
				</div>
				<div class="mt-4">
					<div class="space-y-3 md:hidden">
						{sites.length === 0 ? (
							<div class="rounded-xl border border-stone-200 bg-white px-4 py-10 text-center text-sm text-stone-500">
								暂无站点，请先创建。
							</div>
						) : (
							sites.map((site) => {
								const isActive = site.status === "active";
								const isToday = site.last_checkin_date === today;
								const status = isToday ? site.last_checkin_status : null;
								const message = isToday ? site.last_checkin_message : null;
								return (
									<div
										class={`rounded-xl border p-4 shadow-sm ${
											editingSite?.id === site.id
												? "border-amber-200 bg-amber-50/60"
												: "border-stone-200 bg-white"
										}`}
										key={site.id}
									>
										<div class="flex items-start justify-between gap-3">
											<div class="min-w-0">
												<p class="truncate text-sm font-semibold text-stone-900">
													{site.name}
												</p>
												<p class="truncate text-xs text-stone-500">
													{site.base_url}
												</p>
											</div>
											<span
												class={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
													isActive
														? "border-emerald-100 bg-emerald-50 text-emerald-600"
														: "border-stone-200 bg-stone-100 text-stone-500"
												}`}
											>
												{isActive ? "启用" : "禁用"}
											</span>
										</div>
										<div class="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-500">
											<div class="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
												<p>签到 URL</p>
												<p class="mt-1 truncate font-semibold text-stone-700">
													{site.checkin_url || "-"}
												</p>
											</div>
											<div class="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
												<p>User ID</p>
												<p class="mt-1 truncate font-semibold text-stone-700">
													{site.userid || "-"}
												</p>
											</div>
											<div class="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
												<p>创建时间</p>
												<p class="mt-1 font-semibold text-stone-700">
													{formatDateTime(site.created_at)}
												</p>
											</div>
											<div class="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
												<p>今日签到</p>
												<p class="mt-1 font-semibold text-stone-700">
													{status
														? status === "success"
															? "成功"
															: status === "skipped"
																? "已签"
																: "签到失败"
														: "未签到"}
												</p>
												{message && (
													<p class="mt-1 truncate text-[11px] text-stone-500">
														{message}
													</p>
												)}
											</div>
										</div>
										<div class="mt-3 grid grid-cols-2 gap-2">
											<button
												class="h-9 w-full rounded-full border border-stone-200 bg-stone-100 px-3 text-xs font-semibold text-stone-900 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
												type="button"
												onClick={() => openManual(site)}
											>
												手动签到
											</button>
											<button
												class="h-9 w-full rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
												type="button"
												onClick={() => onToggle(site.id, site.status)}
											>
												{isActive ? "禁用" : "启用"}
											</button>
											<button
												class="h-9 w-full rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
												type="button"
												onClick={() => onEdit(site)}
											>
												编辑
											</button>
											<button
												class="h-9 w-full rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
												type="button"
												onClick={() => onDelete(site.id)}
											>
												删除
											</button>
										</div>
									</div>
								);
							})
						)}
					</div>
					<div class="hidden overflow-hidden rounded-xl border border-stone-200 md:block">
						<div class="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.4fr)] gap-3 bg-stone-50 px-4 py-3 text-xs uppercase tracking-widest text-stone-500">
							<div>站点</div>
							<div>状态</div>
							<div>签到 URL</div>
							<div>User ID</div>
							<div>今日签到</div>
							<div>创建时间</div>
							<div>操作</div>
						</div>
						{sites.length === 0 ? (
							<div class="px-4 py-10 text-center text-sm text-stone-500">
								暂无站点，请先创建。
							</div>
						) : (
							<div class="divide-y divide-stone-100">
								{sites.map((site) => {
									const isActive = site.status === "active";
									const isToday = site.last_checkin_date === today;
									const status = isToday ? site.last_checkin_status : null;
									const message = isToday ? site.last_checkin_message : null;
									return (
										<div
											class={`grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.4fr)] items-center gap-3 px-4 py-4 text-sm ${
												editingSite?.id === site.id
													? "bg-amber-50/60"
													: "bg-white"
											}`}
											key={site.id}
										>
											<div class="flex min-w-0 flex-col">
												<span class="truncate font-semibold text-stone-900">
													{site.name}
												</span>
												<span class="truncate text-xs text-stone-500">
													{site.base_url}
												</span>
											</div>
											<div>
												<span
													class={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
														isActive
															? "border-emerald-100 bg-emerald-50 text-emerald-600"
															: "border-stone-200 bg-stone-100 text-stone-500"
													}`}
												>
													{isActive ? "启用" : "禁用"}
												</span>
											</div>
											<div class="text-xs text-stone-600">
												{site.checkin_url || "-"}
											</div>
											<div class="text-xs text-stone-600">
												{site.userid || "-"}
											</div>
											<div
												class="text-xs text-stone-600"
												title={message ?? ""}
											>
												{(() => {
													if (!status) {
														return "未签到";
													}
													if (status === "success") {
														return "成功";
													}
													if (status === "skipped") {
														return "已签";
													}
													return "签到失败";
												})()}
											</div>
											<div class="text-xs text-stone-600">
												{formatDateTime(site.created_at)}
											</div>
											<div class="flex flex-wrap gap-2">
												<button
													class="h-9 rounded-full border border-stone-200 bg-stone-100 px-3 text-xs font-semibold text-stone-900 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
													type="button"
													onClick={() => openManual(site)}
												>
													手动签到
												</button>
												<button
													class="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
													type="button"
													onClick={() => onToggle(site.id, site.status)}
												>
													{isActive ? "禁用" : "启用"}
												</button>
												<button
													class="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
													type="button"
													onClick={() => onEdit(site)}
												>
													编辑
												</button>
												<button
													class="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
													type="button"
													onClick={() => onDelete(site.id)}
												>
													删除
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
				{lastRun && (
					<p class="mt-3 text-xs text-stone-500">最近执行时间：{formatDateTime(lastRun)}</p>
				)}
			</div>
			{isModalOpen && (
				<div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4 py-8">
					<div class="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h3 class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
									{isEditing ? "编辑站点" : "新增站点"}
								</h3>
								<p class="text-xs text-stone-500">
									{isEditing
										? `正在编辑：${editingSite?.name ?? ""}`
										: "填写站点信息并保存。"}
								</p>
							</div>
							<button
								class="h-9 rounded-full border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
								type="button"
								onClick={onCloseModal}
							>
								关闭
							</button>
						</div>
						<form class="mt-4 grid gap-3.5" onSubmit={onSubmit}>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="checkin-name"
								>
									名称
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="checkin-name"
									name="name"
									value={form.name}
									required
									onInput={(event) =>
										onFormChange({
											name: (event.currentTarget as HTMLInputElement).value,
										})
									}
								/>
							</div>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="checkin-base"
								>
									基础 URL
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="checkin-base"
									name="base_url"
									placeholder="https://example.com"
									value={form.base_url}
									required
									onInput={(event) =>
										onFormChange({
											base_url: (event.currentTarget as HTMLInputElement).value,
										})
									}
								/>
							</div>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="checkin-url"
								>
									签到 URL（可选）
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="checkin-url"
									name="checkin_url"
									placeholder="https://example.com/checkin"
									value={form.checkin_url}
									onInput={(event) =>
										onFormChange({
											checkin_url: (event.currentTarget as HTMLInputElement)
												.value,
										})
									}
								/>
							</div>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="checkin-token"
								>
									Token
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="checkin-token"
									name="token"
									value={form.token}
									required
									onInput={(event) =>
										onFormChange({
											token: (event.currentTarget as HTMLInputElement).value,
										})
									}
								/>
							</div>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="checkin-user"
								>
									User ID
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="checkin-user"
									name="userid"
									value={form.userid}
									required
									onInput={(event) =>
										onFormChange({
											userid: (event.currentTarget as HTMLInputElement)
												.value,
										})
									}
								/>
							</div>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="checkin-status"
								>
									状态
								</label>
								<select
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="checkin-status"
									name="status"
									value={form.status}
									onChange={(event) =>
										onFormChange({
											status: (event.currentTarget as HTMLSelectElement).value,
										})
									}
								>
									<option value="active">启用</option>
									<option value="disabled">禁用</option>
								</select>
							</div>
							<div class="flex flex-wrap items-center justify-end gap-2 pt-2">
								<button
									class="h-10 rounded-full border border-stone-200 bg-stone-50 px-4 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
									type="button"
									onClick={onCloseModal}
								>
									取消
								</button>
								<button
									class="h-10 rounded-full bg-stone-900 px-5 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
									type="submit"
								>
									{isEditing ? "保存修改" : "创建站点"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};
