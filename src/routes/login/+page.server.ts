import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// shortcut: in-memory throttle is per-instance only; not shared across server instances/workers
const lastSent: Map<string, number> = new Map();
const THROTTLE_MS = 5_000;

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session } = await safeGetSession();
	if (session) redirect(303, url.searchParams.get('next') ?? '/');
	return {};
};

export const actions: Actions = {
	default: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();

		if (!email) return fail(400, { email, message: 'Ingresá un email' });

		// sync check+set before any await keeps duplicate requests from both calling OTP
		const now = Date.now();
		const last = lastSent.get(email);
		if (last !== undefined && now - last < THROTTLE_MS) {
			return fail(429, { email, message: 'Esperá unos segundos antes de reintentar' });
		}
		lastSent.set(email, now);

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: `${url.origin}/auth/confirm` }
		});

		if (error) {
			lastSent.delete(email);
			return fail(500, { email, message: `No se pudo enviar el enlace: ${error.message}` });
		}

		return { success: true, email };
	}
};
