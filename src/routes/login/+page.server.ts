import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

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

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: `${url.origin}/auth/confirm` }
		});

		if (error) return fail(500, { email, message: `No se pudo enviar el enlace: ${error.message}` });

		return { success: true, email };
	}
};
