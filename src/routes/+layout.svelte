<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import Navbar from '#lib/components/Navbar.svelte';
	import Preloader from '#lib/components/Preloader.svelte';
	import NavProgress from '#lib/components/NavProgress.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Preloader />
<NavProgress />

<div class="min-h-screen bg-[#F7F5F0] flex flex-col font-sans selection:bg-[#006241]/15 selection:text-[#1E3932]">
	<!-- Persistent Navbar -->
	<Navbar />

	<!-- Main Workspace Canvas -->
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
		{#key page.url.pathname}
			{@render children()}
		{/key}
	</main>

	<!-- Clean Minimal Footer -->
	<footer class="border-t border-[#1E3932]/10 bg-white/80 backdrop-blur-xs py-4 mt-auto">
		<div class="mx-auto max-w-6xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
			<div class="flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-[#006241]"></span>
				<span class="font-semibold text-[#1E3932]">Starbucks ML Studio</span>
				<span class="text-neutral-400">·</span>
				<span>66050193 Thatchai Limpitak | 66050050 Techasit Vanitpattarakul</span>
			</div>
			<span class="text-neutral-400">© Starbucks Coffee Company · Machine Learning Project</span>
		</div>
	</footer>
</div>
