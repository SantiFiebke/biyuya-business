import { fail, redirect } from '@sveltejs/kit';
import { getCurrentBusiness } from '#lib/server/business.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login?next=/sales');

	const business = await getCurrentBusiness(supabase, user.id);
	if (!business) redirect(303, '/onboarding');

	const { data: products } = await supabase
		.from('products')
		.select('id, name, sku, sale_price, stock')
		.eq('business_id', business.id)
		.order('name');

	const { data: sales } = await supabase
		.from('sales')
		.select('id, total, created_at')
		.eq('business_id', business.id)
		.order('created_at', { ascending: false })
		.limit(10);

	return { business, products: products ?? [], sales: sales ?? [] };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) redirect(303, '/login');

		const business = await getCurrentBusiness(supabase, user.id);
		if (!business) redirect(303, '/onboarding');

		const fd = await request.formData();
		const productId = String(fd.get('product_id') ?? '');
		const qty = Number(fd.get('qty') ?? 0);

		if (!productId || !Number.isInteger(qty) || qty <= 0)
			return fail(400, { message: 'Elegí un producto y una cantidad válida' });

		// El precio lo tomamos del servidor: no confiamos en el cliente.
		const { data: product, error: pErr } = await supabase
			.from('products')
			.select('id, sale_price')
			.eq('id', productId)
			.eq('business_id', business.id)
			.single();

		if (pErr || !product) return fail(400, { message: 'Producto inexistente' });

		const { error } = await supabase.rpc('create_sale', {
			p_items: [{ product_id: product.id, qty, unit_price: product.sale_price }]
		});

		if (error) return fail(500, { message: `No se pudo registrar: ${error.message}` });

		return { success: true };
	}
};
