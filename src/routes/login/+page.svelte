<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
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
		<form method="POST" class="flex flex-col gap-3">
			<input
				name="email"
				type="email"
				required
				placeholder="[EMAIL]"
				class="border-input rounded-md border px-3 py-2"
			/>
			<Button type="submit">Enviar enlace</Button>
			{#if form?.message}
				<p class="text-destructive text-sm">{form.message}</p>
			{/if}
		</form>
	{/if}
</div>
