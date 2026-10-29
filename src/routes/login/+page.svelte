<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let submitting = $state(false);
</script>

<div class="mx-auto max-w-sm p-6">
	<h1 class="mb-2 text-2xl font-bold">Ingresar</h1>
	<p class="text-muted-foreground mb-6 text-sm">Te mandamos un enlace de acceso por email.</p>

	{#if form?.success}
		<p class="text-sm">
			Revisá tu correo (<strong>{form.email}</strong>). En local, mirá <a
				class="underline"
				href="http://localhost:54324"
				target="_blank"
				rel="noreferrer">Mailpit</a
			>.
		</p>
	{:else}
		<form
			method="POST"
			class="flex flex-col gap-3"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<input
				name="email"
				type="email"
				required
				disabled={submitting}
				placeholder="[EMAIL]"
				class="border-input rounded-md border px-3 py-2"
			/>
			<Button type="submit" disabled={submitting}
				>{submitting ? 'Enviando…' : 'Enviar enlace'}</Button
			>
			{#if form?.message}
				<p class="text-destructive text-sm">{form.message}</p>
			{/if}
		</form>
	{/if}
</div>
