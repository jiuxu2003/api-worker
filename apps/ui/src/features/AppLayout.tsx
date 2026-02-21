import type { TabId, TabItem } from "../core/types";

type AppLayoutProps = {
	tabs: TabItem[];
	activeTab: TabId;
	activeLabel: string;
	token: string | null;
	notice: string;
	onTabChange: (tabId: TabId) => void;
	onLogout: () => void;
	children?: unknown;
};

/**
 * Renders the admin app layout.
 *
 * Args:
 *   props: App layout props.
 *
 * Returns:
 *   App shell JSX element.
 */
export const AppLayout = ({
	tabs,
	activeTab,
	activeLabel,
	token,
	notice,
	onTabChange,
	onLogout,
	children,
}: AppLayoutProps) => {
	const closeMobileNav = () => {
		const toggle = document.querySelector<HTMLInputElement>("#app-nav-toggle");
		if (toggle) {
			toggle.checked = false;
		}
	};

	return (
		<div class="relative flex min-h-screen flex-col lg:grid lg:grid-cols-[260px_1fr]">
			<input class="peer hidden" id="app-nav-toggle" type="checkbox" />
			<header class="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-4 lg:hidden">
				<div class="flex items-center gap-3">
					<label
						aria-label="打开导航"
						class="inline-flex h-10 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
						for="app-nav-toggle"
						role="button"
					>
						<svg
							aria-hidden="true"
							class="h-4 w-4 text-stone-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.8"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 12h16" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 18h16" />
						</svg>
						菜单
					</label>
					<div class="flex flex-col">
						<span class="text-sm font-semibold text-stone-900">
							api-workers
						</span>
						<span class="text-xs text-stone-500">{activeLabel}</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span class="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] uppercase tracking-widest text-stone-500">
						{token ? "已登录" : "未登录"}
					</span>
					<button
						class="h-9 rounded-full border border-stone-200 bg-transparent px-3 text-xs font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
						type="button"
						onClick={onLogout}
					>
						退出
					</button>
				</div>
			</header>
			<aside class="fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col overflow-y-auto border-r border-stone-200 bg-white px-5 py-8 shadow-xl transition-transform duration-300 ease-in-out peer-checked:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none">
				<div class="mb-8 flex flex-col gap-1.5">
					<h2 class="font-['Space_Grotesk'] text-lg font-semibold tracking-tight text-stone-900">
						api-workers
					</h2>
					<span class="text-xs uppercase tracking-widest text-stone-500">
						console
					</span>
				</div>
				<nav class="flex flex-col gap-2.5">
					{tabs.map((tab) => (
						<button
							class={`flex h-11 w-full items-center rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
								activeTab === tab.id
									? "bg-stone-100 text-stone-900"
									: "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
							}`}
							type="button"
							onClick={() => {
								onTabChange(tab.id);
								closeMobileNav();
							}}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</aside>
			<main class="px-4 pt-5 pb-16 sm:px-10 sm:pt-8">
				<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 class="font-['Space_Grotesk'] text-2xl tracking-tight text-stone-900">
							{activeLabel}
						</h1>
						<p class="text-sm text-stone-500">
							集中管理渠道、模型、令牌与使用情况。
						</p>
					</div>
					<div class="hidden items-center gap-3 lg:flex">
						<span class="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
							{token ? "已登录" : "未登录"}
						</span>
						<button
							class="h-11 rounded-lg border border-stone-200 bg-transparent px-4 py-2.5 text-sm font-semibold text-stone-500 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:text-stone-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
							type="button"
							onClick={onLogout}
						>
							退出
						</button>
					</div>
				</div>
				{notice && (
					<div class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
						{notice}
					</div>
				)}
				{children}
			</main>
			<label
				aria-hidden="true"
				class="fixed inset-0 z-30 bg-stone-900/40 opacity-0 transition-opacity duration-300 ease-in-out peer-checked:pointer-events-auto peer-checked:opacity-100 lg:hidden pointer-events-none"
				for="app-nav-toggle"
			/>
		</div>
	);
};
