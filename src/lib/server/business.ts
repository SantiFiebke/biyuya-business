import type { SupabaseClient } from '@supabase/supabase-js';

export async function getCurrentBusiness(supabase: SupabaseClient, userId: string) {
	const { data: membership, error: mErr } = await supabase
		.from('memberships')
		.select('business_id')
		.eq('user_id', userId)
		.limit(1)
		.maybeSingle();

	if (mErr) throw mErr;
	if (!membership) return null;

	const { data: business, error: bErr } = await supabase
		.from('businesses')
		.select('id, name')
		.eq('id', membership.business_id)
		.single();

	if (bErr) throw bErr;
	return business;
}
