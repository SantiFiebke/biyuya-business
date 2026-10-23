<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<div class="mx-auto max-w-sm p-6">
	<h1 class="mb-2 text-2xl font-bold">Tu negocio</h1>
	<p class="text-muted-foreground mb-6 text-sm">Creá tu negocio para empezar.</p>

	<form method="POST" class="flex flex-col gap-3">
		<input
			name="name"
			required
			placeholder="Nombre del negocio"
			value={form?.name ?? ''}
			class="border-input rounded-md border px-3 py-2"
		/>
		<Button type="submit">Crear negocio</Button>
		{#if form?.message}
			<p class="text-destructive text-sm">{form.message}</p>
		{/if}
	</form>
</div>
