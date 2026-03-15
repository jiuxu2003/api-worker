import { useEffect } from "hono/jsx/dom";
import type { Site, Token, TokenForm } from "../core/types";
import {
	buildPageItems,
	formatChinaDateTime,
	formatDateTime,
} from "../core/utils";

type TokensViewProps = {
	pagedTokens: Token[];
	tokenPage: number;
	tokenPageSize: number;
	tokenTotal: number;
	tokenTotalPages: number;
	isTokenModalOpen: boolean;
	isActionPending: (key: string) => boolean;
	sites: Site[];
	tokenForm: TokenForm;
	editingToken: Token | null;
	onCreate: () => void;
	onCloseModal: () => void;
	onPageChange: (next: number) => void;
	onPageSizeChange: (next: number) => void;
	onSubmit: (event: Event) => void;
	onFormChange: (patch: Partial<TokenForm>) => void;
	onEdit: (token: Token) => void;
	onReveal: (id: string) => void;
	onToggle: (id: string, status: string) => void;
	onDelete: (token: Token) => void;
};

const pageSizeOptions = [10, 20, 50];

/**
 * Renders the tokens management view.
 *
 * Args:
 *   props: Tokens view props.
 *
 * Returns:
 *   Tokens JSX element.
 */
export const TokensView = ({
	pagedTokens,
	tokenPage,
	tokenPageSize,
	tokenTotal,
	tokenTotalPages,
	isTokenModalOpen,
	isActionPending,
	sites,
	tokenForm,
	editingToken,
	onCreate,
	onCloseModal,
	onPageChange,
	onPageSizeChange,
	onSubmit,
	onFormChange,
	onEdit,
	onReveal,
	onToggle,
	onDelete,
}: TokensViewProps) => {
	const pageItems = buildPageItems(tokenPage, tokenTotalPages);
	const isSubmitting = isActionPending("token:submit");
	const isEditing = Boolean(editingToken);
	const modalTitle = isEditing ? "编辑令牌" : "生成令牌";
	const modalDescription = isEditing
		? "更新令牌名称、额度、状态与过期时间。"
		: "创建后会自动复制令牌，请妥善保存。";
	const submitLabel = isEditing ? "保存修改" : "生成令牌";
	const selectedChannels = new Set(tokenForm.allowed_channels);
	const toggleChannel = (channelId: string) => {
		const next = new Set(selectedChannels);
		if (next.has(channelId)) {
			next.delete(channelId);
		} else {
			next.add(channelId);
		}
		onFormChange({ allowed_channels: Array.from(next) });
	};
	const clearChannels = () => onFormChange({ allowed_channels: [] });

	useEffect(() => {
		if (!isTokenModalOpen) {
			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onCloseModal();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isTokenModalOpen, onCloseModal]);
	return (
		<div class="animate-fade-up space-y-5">
			<div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900">
							令牌列表
						</h3>
						<p class="text-xs text-stone-500">
							统一管理令牌状态、额度与操作入口。
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<button
							class="h-9 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
							type="button"
							onClick={onCreate}
						>
							新增令牌
						</button>
					</div>
				</div>
				<div class="mt-4">
					<div class="space-y-3 md:hidden">
						{pagedTokens.length === 0 ? (
							<div class="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-10 text-center text-sm text-stone-500">
								<p>暂无令牌，请先创建。</p>
								<button
									class="mt-4 h-9 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
									type="button"
									onClick={onCreate}
								>
									生成令牌
								</button>
							</div>
						) : (
							pagedTokens.map((tokenItem) => {
								const isActive = tokenItem.status === "active";
								const revealPending = isActionPending(
									`token:reveal:${tokenItem.id}`,
								);
								const togglePending = isActionPending(
									`token:toggle:${tokenItem.id}`,
								);
								const deletePending = isActionPending(
									`token:delete:${tokenItem.id}`,
								);
								return (
									<div
										class="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
										key={tokenItem.id}
									>
										<div class="flex items-start justify-between gap-3">
											<div class="min-w-0">
												<p class="truncate text-sm font-semibold text-stone-900">
													{tokenItem.name}
												</p>
												<p class="text-xs text-stone-500">
													前缀 {tokenItem.key_prefix ?? "-"}
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
												<p>已用/额度</p>
												<p class="mt-1 font-semibold text-stone-700">
													{tokenItem.quota_used} /{" "}
													{tokenItem.quota_total ?? "∞"}
												</p>
											</div>
											<div class="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
												<p>创建时间</p>
												<p class="mt-1 font-semibold text-stone-700">
													{formatDateTime(tokenItem.created_at)}
												</p>
											</div>
											<div class="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
												<p>过期时间</p>
												<p class="mt-1 font-semibold text-stone-700">
													{tokenItem.expires_at
														? formatChinaDateTime(tokenItem.expires_at)
														: "永不过期"}
												</p>
											</div>
											<div class="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
												<p>渠道限制</p>
												<p class="mt-1 font-semibold text-stone-700">
													{tokenItem.allowed_channels &&
													tokenItem.allowed_channels.length > 0
														? `${tokenItem.allowed_channels.length} 个`
														: "全开"}
												</p>
											</div>
										</div>
										<div class="mt-3 grid grid-cols-2 gap-2">
											<button
												class="col-span-2 h-9 w-full rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
												type="button"
												onClick={() => onEdit(tokenItem)}
											>
												编辑
											</button>
											<button
												class="h-9 w-full rounded-full border border-stone-200 bg-stone-100 px-3 text-xs font-semibold text-stone-900 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
												type="button"
												disabled={revealPending}
												onClick={() => onReveal(tokenItem.id)}
											>
												{revealPending ? "查看中..." : "查看"}
											</button>
											<button
												class="h-9 w-full rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
												type="button"
												disabled={togglePending}
												onClick={() => onToggle(tokenItem.id, tokenItem.status)}
											>
												{togglePending ? "处理中..." : "切换"}
											</button>
											<button
												class="col-span-2 h-9 w-full rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
												type="button"
												disabled={deletePending}
												onClick={() => onDelete(tokenItem)}
											>
												{deletePending ? "删除中..." : "删除"}
											</button>
										</div>
									</div>
								);
							})
						)}
					</div>
					<div class="hidden overflow-hidden rounded-xl border border-stone-200 md:block">
						<div class="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,0.9fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.3fr)] gap-3 bg-stone-50 px-4 py-3 text-xs uppercase tracking-widest text-stone-500">
							<div>名称</div>
							<div>状态</div>
							<div>已用/额度</div>
							<div>前缀</div>
							<div>创建时间</div>
							<div>过期时间</div>
							<div>渠道限制</div>
							<div>操作</div>
						</div>
						{pagedTokens.length === 0 ? (
							<div class="px-4 py-10 text-center text-sm text-stone-500">
								<p>暂无令牌，请先创建。</p>
								<button
									class="mt-4 h-9 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
									type="button"
									onClick={onCreate}
								>
									生成令牌
								</button>
							</div>
						) : (
							<div class="divide-y divide-stone-100">
								{pagedTokens.map((tokenItem) => {
									const isActive = tokenItem.status === "active";
									const revealPending = isActionPending(
										`token:reveal:${tokenItem.id}`,
									);
									const togglePending = isActionPending(
										`token:toggle:${tokenItem.id}`,
									);
									const deletePending = isActionPending(
										`token:delete:${tokenItem.id}`,
									);
									return (
										<div
											class="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,0.9fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.3fr)] items-center gap-3 px-4 py-4 text-sm"
											key={tokenItem.id}
										>
											<div class="flex min-w-0 flex-col">
												<span class="truncate font-semibold text-stone-900">
													{tokenItem.name}
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
											<div class="text-sm font-semibold text-stone-700">
												{tokenItem.quota_used} / {tokenItem.quota_total ?? "∞"}
											</div>
											<div class="text-sm text-stone-700">
												{tokenItem.key_prefix ?? "-"}
											</div>
											<div class="text-sm text-stone-700">
												{formatDateTime(tokenItem.created_at)}
											</div>
											<div class="text-sm text-stone-700">
												{tokenItem.expires_at
													? formatChinaDateTime(tokenItem.expires_at)
													: "永不过期"}
											</div>
											<div class="text-sm text-stone-700">
												{tokenItem.allowed_channels &&
												tokenItem.allowed_channels.length > 0
													? `${tokenItem.allowed_channels.length} 个`
													: "全开"}
											</div>
											<div class="flex flex-wrap gap-2">
												<button
													class="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
													type="button"
													onClick={() => onEdit(tokenItem)}
												>
													编辑
												</button>
												<button
													class="h-9 rounded-full border border-stone-200 bg-stone-100 px-3 text-xs font-semibold text-stone-900 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
													type="button"
													disabled={revealPending}
													onClick={() => onReveal(tokenItem.id)}
												>
													{revealPending ? "查看中..." : "查看"}
												</button>
												<button
													class="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
													type="button"
													disabled={togglePending}
													onClick={() =>
														onToggle(tokenItem.id, tokenItem.status)
													}
												>
													{togglePending ? "处理中..." : "切换"}
												</button>
												<button
													class="h-9 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
													type="button"
													disabled={deletePending}
													onClick={() => onDelete(tokenItem)}
												>
													{deletePending ? "删除中..." : "删除"}
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
				<div class="mt-4 flex flex-col gap-3 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-xs text-stone-500">
							共 {tokenTotal} 条 · {tokenTotalPages} 页
						</span>
						<button
							class="h-8 w-8 rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
							type="button"
							disabled={tokenPage <= 1}
							onClick={() => onPageChange(Math.max(1, tokenPage - 1))}
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
										item === tokenPage
											? "border-stone-900 bg-stone-900 text-white shadow-md"
											: "border-stone-200 bg-white text-stone-600 hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md"
									}`}
									type="button"
									key={item}
									onClick={() => onPageChange(item)}
								>
									{item}
								</button>
							),
						)}
						<button
							class="h-8 w-8 rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
							type="button"
							disabled={tokenPage >= tokenTotalPages}
							onClick={() =>
								onPageChange(Math.min(tokenTotalPages, tokenPage + 1))
							}
						>
							&gt;
						</button>
					</div>
					<label class="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
						每页条数
						<select
							class="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-xs text-stone-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
							value={tokenPageSize}
							onChange={(event) => {
								onPageSizeChange(
									Number((event.currentTarget as HTMLSelectElement).value),
								);
							}}
						>
							{pageSizeOptions.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>
			{isTokenModalOpen && (
				<div
					class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4 py-8"
					onClick={onCloseModal}
				>
					<div
						aria-labelledby="token-modal-title"
						aria-modal="true"
						class="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl"
						role="dialog"
						onClick={(event) => event.stopPropagation()}
					>
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h3
									class="mb-1 font-['Space_Grotesk'] text-lg tracking-tight text-stone-900"
									id="token-modal-title"
								>
									{modalTitle}
								</h3>
								<p class="text-xs text-stone-500">
									{modalDescription}
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
									for="token-name"
								>
									名称
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="token-name"
									name="name"
									required
									autoFocus
									value={tokenForm.name}
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
									for="token-quota"
								>
									额度（可选）
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="token-quota"
									name="quota_total"
									type="number"
									min="0"
									placeholder="留空表示无限"
									value={tokenForm.quota_total}
									onInput={(event) =>
										onFormChange({
											quota_total: (
												event.currentTarget as HTMLInputElement
											).value,
										})
									}
								/>
							</div>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="token-status"
								>
									状态
								</label>
								<select
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="token-status"
									name="status"
									value={tokenForm.status}
									onChange={(event) =>
										onFormChange({
											status: (
												event.currentTarget as HTMLSelectElement
											).value,
										})
									}
								>
									<option value="active">启用</option>
									<option value="disabled">禁用</option>
								</select>
							</div>
							<div>
								<label
									class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
									for="token-expires"
								>
									过期时间（北京时间）
								</label>
								<input
									class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
									id="token-expires"
									name="expires_at"
									type="datetime-local"
									step="60"
									placeholder="留空表示不过期"
									value={tokenForm.expires_at}
									onInput={(event) =>
										onFormChange({
											expires_at: (
												event.currentTarget as HTMLInputElement
											).value,
										})
									}
								/>
								<p class="mt-1 text-xs text-stone-400">
									留空表示不过期。
								</p>
							</div>
							<div>
								<div class="flex items-center justify-between">
									<label class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500">
										允许渠道
									</label>
									<button
										class="text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:text-stone-900"
										type="button"
										onClick={clearChannels}
									>
										全开
									</button>
								</div>
								<p class="text-xs text-stone-400">
									未选择表示全开。
								</p>
								<div class="mt-2 max-h-36 space-y-2 overflow-auto rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
									{sites.length === 0 ? (
										<p class="text-stone-400">暂无渠道，请先创建。</p>
									) : (
										sites.map((site) => (
											<label
												class="flex items-center gap-2"
												key={site.id}
											>
												<input
													class="h-3 w-3 rounded border-stone-300 text-stone-900 focus:ring-amber-300"
													type="checkbox"
													checked={selectedChannels.has(site.id)}
													onChange={() => toggleChannel(site.id)}
												/>
												<span class="truncate">
													{site.name ?? site.id}
												</span>
											</label>
										))
									)}
								</div>
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
									disabled={isSubmitting}
								>
									{isSubmitting
										? isEditing
											? "保存中..."
											: "生成中..."
										: submitLabel}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};
