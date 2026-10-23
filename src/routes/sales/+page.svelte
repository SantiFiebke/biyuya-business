<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<div class="mx-auto max-w-3xl p-6">
	<h1 class="mb-1 text-2xl font-bold">Ventas</h1>
	<p class="text-muted-foreground mb-6 text-sm">{data.business.name}</p>

	<form method="POST" class="mb-8 flex flex-wrap items-end gap-3">
		<label class="flex flex-col gap-1 text-sm">
			<span>Producto</span>
			<select name="product_id" required class="border-input rounded-md border px-3 py-2">
				{#each data.products as p (p.id)}
					<option value={p.id}>{p.name} ({p.sku}) — stock {p.stock}</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1 text-sm">
			<span>Cantidad</span>
			<input
				name="qty"
				type="number"
				min="1"
				value="1"
				class="border-input w-24 rounded-md border px-3 py-2"
			/>
		</label>
		<Button type="submit">Registrar venta</Button>
	</form>

	{#if form?.message}
		<p class="text-destructive mb-4 text-sm">{form.message}</p>
	{/if}
	{#if form?.success}
		<p class="mb-4 text-sm text-green-600">Venta registrada ✅</p>
	{/if}

	<h2 class="mb-2 text-lg font-semibold">Últimas ventas</h2>
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b text-left">
				<th class="py-2">Fecha</th>
				<th class="py-2 text-right">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each data.sales as s (s.id)}
				<tr class="border-b">
					<td class="py-2">{new Date(s.created_at).toLocaleString()}</td>
					<td class="py-2 text-right">{s.total}</td>
				</tr>
			{:else}
				<tr><td colspan="2" class="text-muted-foreground py-4">Sin ventas todavía.</td></tr>
			{/each}
		</tbody>
	</table>
</div>
