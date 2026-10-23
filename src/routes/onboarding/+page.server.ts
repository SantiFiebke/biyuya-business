import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login?next=/onboarding');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		if (!name) return fail(400, { name, message: 'Poné un nombre' });

		// Generamos el id nosotros: con RLS, un INSERT ... RETURNING exige que la
		// fila nueva sea visible por la policy de SELECT, y todavía no hay membership.
		const businessId = crypto.randomUUID();

		const { error } = await supabase
			.from('businesses')
			.insert({ id: businessId, name, owner_id: user.id });

		if (error) return fail(500, { name, message: `No se pudo crear: ${error.message}` });

		const { error: mErr } = await supabase
			.from('memberships')
			.insert({ business_id: businessId, user_id: user.id, role: 'owner' });

		if (mErr) return fail(500, { name, message: `No se pudo crear la membresía: ${mErr.message}` });

		redirect(303, '/products');
	}
};