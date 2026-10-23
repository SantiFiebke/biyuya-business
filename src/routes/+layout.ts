import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { invalidate } from '$app/navigation';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$app/env/public';
import type { LayoutLoad } from './$types';

let authListenerRegistered = false;

export const load: LayoutLoad = async ({ depends, fetch }) => {
	depends('supabase:auth');

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		global: { fetch }
	});

	if (isBrowser() && !authListenerRegistered) {
		authListenerRegistered = true;
		supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
		});
	}

	const {
		data: { session }
	} = await supabase.auth.getSession();

	return { supabase, session };
};
