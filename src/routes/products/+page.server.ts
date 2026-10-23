import { fail, redirect } from '@sveltejs/kit';
import { getCurrentBusiness } from '#lib/server/business.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login?next=/products');

	const business = await getCurrentBusiness(supabase, user.id);
	if (!business) redirect(303, '/onboarding');

	const { data: products, error } = await supabase
		.from('products')
		.select('id, sku, name, cost_price, sale_price, stock')
		.eq('business_id', business.id)
		.order('created_at', { ascending: false });

	if (error) throw error;

	return { business, products: products ?? [] };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) redirect(303, '/login');

		const business = await getCurrentBusiness(supabase, user.id);
		if (!business) redirect(303, '/onboarding');

		const formData = await request.formData();
		const sku = String(formData.get('sku') ?? '').trim();
		const name = String(formData.get('name') ?? '').trim();
		const cost_price = Number(formData.get('cost_price') ?? 0);
		const sale_price = Number(formData.get('sale_price') ?? 0);
		const stock = Number(formData.get('stock') ?? 0);

		if (!sku || !name) return fail(400, { message: 'SKU y nombre son obligatorios' });
		if (Number.isNaN(cost_price) || Number.isNaN(sale_price) || Number.isNaN(stock))
			return fail(400, { message: 'Precios y stock deben ser números' });

		const { error } = await supabase.from('products').insert({
			business_id: business.id,
			sku,
			name,
			cost_price,
			sale_price,
			stock
		});

		if (error) return fail(500, { message: `No se pudo crear: ${error.message}` });

		return { success: true };
	}
};
