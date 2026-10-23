<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="flex items-center justify-between border-b px-4 py-3">
	<a href="/" class="font-semibold">biyuya-business</a>
	<nav class="flex items-center gap-4 text-sm">
		{#if data.session}
			<span class="text-muted-foreground">{data.session.user.email}</span>
			<form method="POST" action="/logout">
				<button type="submit" class="underline">Salir</button>
			</form>
		{:else}
			<a href="/login" class="underline">Ingresar</a>
		{/if}
	</nav>
</header>

<main class="p-4">
	{@render children()}
</main>
