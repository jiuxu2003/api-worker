import type { NoticeMessage } from "../core/types";

type LoginViewProps = {
	notice: NoticeMessage | null;
	isSubmitting: boolean;
	onSubmit: (event: Event) => void;
};

/**
 * Renders the admin login view.
 *
 * Args:
 *   props: Login view props.
 *
 * Returns:
 *   Login JSX element.
 */
export const LoginView = ({ notice, isSubmitting, onSubmit }: LoginViewProps) => {
	const toneStyles: Record<NoticeMessage["tone"], string> = {
		success: "border-emerald-200 bg-emerald-50 text-emerald-800",
		warning: "border-amber-200 bg-amber-50 text-amber-800",
		error: "border-rose-200 bg-rose-50 text-rose-700",
		info: "border-sky-200 bg-sky-50 text-sky-800",
	};
	return (
		<div class="animate-fade-up mx-auto mt-24 max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
			<h1 class="mb-2 font-['Space_Grotesk'] text-2xl tracking-tight text-stone-900">
				api-workers
			</h1>
			<p class="text-sm text-stone-500">请输入管理员密码登录管理台。</p>
			<form class="mt-6 grid gap-4" onSubmit={onSubmit}>
				<div>
					<label
						class="mb-1.5 block text-xs uppercase tracking-widest text-stone-500"
						for="password"
					>
						管理员密码
					</label>
					<input
						class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
						id="password"
						name="password"
						type="password"
						required
						autoFocus
					/>
				</div>
				<button
					class="h-11 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? "登录中..." : "登录"}
				</button>
			</form>
			<p class="mt-3 text-xs text-stone-500">按回车键可快速提交。</p>
			{notice && (
				<div
					class={`mt-4 rounded-xl border px-4 py-3 text-sm ${toneStyles[notice.tone]}`}
				>
					{notice.message}
				</div>
			)}
		</div>
	);
};
