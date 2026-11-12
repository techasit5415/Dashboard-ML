<script lang="ts">
	import './layout.css';
	import Navbar from '#lib/components/Navbar.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-[#f7f7f6] flex flex-col font-sans">
	<!-- Persistent Navbar -->
	<Navbar />

	<!-- Main Workspace Canvas -->
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
		{@render children()}
	</main>

	<!-- Clean Minimal Footer -->
	<footer class="border-t border-neutral-200/80 bg-white py-3.5 mt-auto">
		<div class="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between text-xs text-neutral-400">
			<span>Starbucks ML Studio</span>
			<span>© Starbucks Coffee Company</span>
		</div>
	</footer>
</div>