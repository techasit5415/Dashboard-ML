<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  // Shown once per full page load (layout persists across client-side tab switches)
  let visible = $state(true);

  onMount(() => {
    const t = setTimeout(() => (visible = false), 1000);
    return () => clearTimeout(t);
  });
</script>

{#if visible}
  <div
    out:fade={{ duration: 450 }}
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#006241]"
    role="status"
    aria-live="polite"
  >
    <svg class="h-24 w-24 text-white" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- Steam -->
      <path class="steam steam-1" d="M24 22c-2-3 2-5 0-8s2-5 0-8" />
      <path class="steam steam-2" d="M32 22c-2-3 2-5 0-8s2-5 0-8" />
      <path class="steam steam-3" d="M40 22c-2-3 2-5 0-8s2-5 0-8" />
      <!-- Cup -->
      <path d="M14 28h36v12a14 14 0 0 1-14 14h-8a14 14 0 0 1-14-14V28z" />
      <path d="M50 32h3a5 5 0 0 1 0 10h-4" />
      <!-- Saucer -->
      <path d="M10 58h44" />
    </svg>
    <p class="mt-5 text-sm font-medium tracking-wide text-white/90">Loading Starbucks ML Studio...</p>
  </div>
{/if}

<style>
  .steam {
    opacity: 0;
    animation: steam-rise 2.4s ease-in-out infinite;
  }
  .steam-2 {
    animation-delay: 0.4s;
  }
  .steam-3 {
    animation-delay: 0.8s;
  }
  @keyframes steam-rise {
    0% {
      opacity: 0;
      transform: translateY(6px);
    }
    35% {
      opacity: 0.85;
    }
    100% {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .steam {
      animation: none;
      opacity: 0.7;
    }
  }
</style>
