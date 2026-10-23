import { redirect } from '@sveltejs/kit';
import { getCurrentBusiness } from '#lib/server/business.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) redirect(303, '/login?next=/reports');

	const business = await getCurrentBusiness(supabase, user.id);
	if (!business) redirect(303, '/onboarding');

	const days = Number(url.searchParams.get('days') ?? 30);
	const from = new Date(Date.now() - days * 86_400_000).toISOString();

	const { data: sales } = await supabase
		.from('sales')
		.select('id, total, created_at')
		.eq('business_id', business.id)
		.gte('created_at', from)
		.order('created_at', { ascending: false });

	const { data: lowStock } = await supabase
		.from('products')
		.select('id, name, sku, stock')
		.eq('business_id', business.id)
		.lte('stock', 5)
		.order('stock', { ascending: true });

	const items = sales ?? [];
	const total = items.reduce((sum, s) => sum + Number(s.total), 0);

	return {
		business,
		days,
		sales: items,
		total,
		count: items.length,
		lowStock: lowStock ?? []
	};
};
