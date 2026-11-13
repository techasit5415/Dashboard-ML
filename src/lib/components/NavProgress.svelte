<script lang="ts">
  import { untrack } from 'svelte';
  import { navigating } from '$app/state';

  // Slim top progress bar shown during client-side tab switches
  let width = $state(0);
  let visible = $state(false);
  let timers: ReturnType<typeof setTimeout>[] = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  $effect(() => {
    const active = !!navigating.to;
    untrack(() => {
      clearTimers();
      if (active) {
        visible = true;
        width = 0;
        timers.push(setTimeout(() => (width = 70), 16));
      } else if (visible) {
        width = 100;
        timers.push(
          setTimeout(() => {
            visible = false;
            timers.push(setTimeout(() => (width = 0), 320));
          }, 350)
        );
      }
    });
  });
</script>

<div
  class="pointer-events-none fixed left-0 top-0 z-[90] h-[3px] bg-[#00754A] shadow-[0_0_8px_rgba(0,117,74,0.6)]"
  style="width: {width}%; opacity: {visible ? 1 : 0}; transition: width {width === 100 ? '200ms' : '600ms'} ease-out, opacity 300ms ease;"
  aria-hidden="true"
></div>
