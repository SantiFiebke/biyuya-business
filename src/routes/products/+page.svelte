<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { formatARS } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<div class="mx-auto max-w-4xl p-6">
	<h1 class="mb-1 text-2xl font-bold">Productos</h1>
	<p class="text-muted-foreground mb-6 text-sm">{data.business.name}</p>

	<form method="POST" class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-6 sm:items-end">
		<label class="flex flex-col gap-1 text-sm">
			<span>SKU</span>
			<input name="sku" required class="border-input w-full rounded-md border px-3 py-2" />
		</label>
		<label class="flex flex-col gap-1 text-sm">
			<span>Nombre</span>
			<input name="name" required class="border-input w-full rounded-md border px-3 py-2" />
		</label>
		<label class="flex flex-col gap-1 text-sm">
			<span>Costo $</span>
			<input name="cost_price" type="number" inputmode="decimal" min="0" step="0.01" value="0" class="border-input w-full rounded-md border px-3 py-2" />
		</label>
		<label class="flex flex-col gap-1 text-sm">
			<span>Venta $</span>
			<input name="sale_price" type="number" inputmode="decimal" min="0" step="0.01" value="0" class="border-input w-full rounded-md border px-3 py-2" />
		</label>
		<label class="flex flex-col gap-1 text-sm">
			<span>Stock</span>
			<input name="stock" type="number" min="0" step="1" value="0" class="border-input w-full rounded-md border px-3 py-2" />
		</label>
		<Button type="submit">Agregar</Button>
	</form>

	{#if form?.message}
		<p class="text-destructive mb-4 text-sm">{form.message}</p>
	{/if}

	<table class="w-full text-sm">
		<thead>
			<tr class="border-b text-left">
				<th class="py-2">SKU</th>
				<th class="py-2">Nombre</th>
				<th class="py-2 text-right">Costo</th>
				<th class="py-2 text-right">Venta</th>
				<th class="py-2 text-right">Margen</th>
				<th class="py-2 text-right">Stock</th>
			</tr>
		</thead>
		<tbody>
			{#each data.products as p (p.id)}
				<tr class="border-b">
					<td class="py-2">{p.sku}</td>
					<td class="py-2">{p.name}</td>
					<td class="py-2 text-right">{formatARS(p.cost_price)}</td>
					<td class="py-2 text-right">{formatARS(p.sale_price)}</td>
					<td class="py-2 text-right">{formatARS(Number(p.sale_price) - Number(p.cost_price))}</td>
					<td class="py-2 text-right">{p.stock}</td>
				</tr>
			{:else}
				<tr><td colspan="6" class="text-muted-foreground py-4">Sin productos todavía.</td></tr>
			{/each}
		</tbody>
	</table>
</div>
