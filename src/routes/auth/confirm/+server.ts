import { error, redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/products';

	if (code) {
		const { error: err } = await supabase.auth.exchangeCodeForSession(code);
		if (!err) redirect(303, next);
	}

	if (token_hash && type) {
		const { error: err } = await supabase.auth.verifyOtp({ type, token_hash });
		if (!err) redirect(303, next);
	}

	error(400, 'No se pudo validar el enlace de acceso');
};
