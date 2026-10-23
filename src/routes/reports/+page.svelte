<script lang="ts">
	import { formatARS } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const periods = [
		{ days: 7, label: '7 días' },
		{ days: 30, label: '30 días' },
		{ days: 90, label: '90 días' }
	];
</script>

<div class="mx-auto max-w-3xl p-6">
	<h1 class="mb-1 text-2xl font-bold">Reportes</h1>
	<p class="text-muted-foreground mb-6 text-sm">{data.business.name}</p>

	<div class="mb-6 flex gap-2 text-sm">
		{#each periods as p (p.days)}
			<a
				href="/reports?days={p.days}"
				class="rounded-md border px-3 py-1 {data.days === p.days ? 'bg-muted font-semibold' : ''}"
			>
				{p.label}
			</a>
		{/each}
	</div>

	<div class="mb-8 grid grid-cols-2 gap-4">
		<div class="rounded-lg border p-4">
			<p class="text-muted-foreground text-sm">Ventas</p>
			<p class="text-2xl font-bold">{data.count}</p>
		</div>
		<div class="rounded-lg border p-4">
			<p class="text-muted-foreground text-sm">Facturación</p>
			<p class="text-2xl font-bold">{formatARS(data.total)}</p>
		</div>
	</div>

	<h2 class="mb-2 text-lg font-semibold">Bajo stock (≤ 5)</h2>
	<table class="mb-8 w-full text-sm">
		<thead>
			<tr class="border-b text-left">
				<th class="py-2">SKU</th>
				<th class="py-2">Nombre</th>
				<th class="py-2 text-right">Stock</th>
			</tr>
		</thead>
		<tbody>
			{#each data.lowStock as p (p.id)}
				<tr class="border-b">
					<td class="py-2">{p.sku}</td>
					<td class="py-2">{p.name}</td>
					<td class="py-2 text-right">{p.stock}</td>
				</tr>
			{:else}
				<tr><td colspan="3" class="text-muted-foreground py-4">Nada bajo stock 👍</td></tr>
			{/each}
		</tbody>
	</table>

	<h2 class="mb-2 text-lg font-semibold">Ventas del período</h2>
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
					<td class="py-2 text-right">{formatARS(s.total)}</td>
				</tr>
			{:else}
				<tr><td colspan="2" class="text-muted-foreground py-4">Sin ventas en el período.</td></tr>
			{/each}
		</tbody>
	</table>
</div>
